import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { LlmService } from '@callm/core';
import { SessionService } from '@callm/core';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const llmService = new LlmService();
const sessionService = new SessionService();

// Inicializa o banco de dados
sessionService.initialize().then(() => {
  console.log('Database initialized');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'caLLM Open Runway' });
});

// Listar sessões
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await sessionService.listSessions();
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obter histórico de uma sessão
app.get('/api/sessions/:id/messages', async (req, res) => {
  try {
    const messages = await sessionService.getMessages(req.params.id);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chat Endpoint (Streaming ou Simples)
app.post('/api/chat', async (req, res) => {
  const { prompt, sessionId } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const currentSessionId = sessionId || `session_${Date.now()}`;
    
    // Salva mensagem do usuário
    await sessionService.saveMessage(currentSessionId, 'user', prompt);
    
    // Gera resposta (Non-streaming para simplificar primeira integração)
    const response = await llmService.generateContent(prompt);
    
    // Salva resposta do modelo
    await sessionService.saveMessage(currentSessionId, 'model', response);
    
    res.json({ 
      sessionId: currentSessionId,
      content: response 
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`caLLM API Server running at http://localhost:${port}`);
});
