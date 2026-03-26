import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { LlmService, SessionService, SkillLoader, FileSystemSkill, BrowserSkill, AgentService } from '@callm/core';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Configurações
const dbPath = path.resolve(process.cwd(), 'callm.sqlite');
const llmService = new LlmService({ apiKey: process.env.GEMINI_API_KEY || '' });
const sessionService = new SessionService(dbPath);
const skillLoader = new SkillLoader();
const agentService = new AgentService();

// Registrar Skills Padrão
skillLoader.registerSkill(new FileSystemSkill());
skillLoader.registerSkill(new BrowserSkill());

// Carregar Skills Dinâmicas
const externalSkillsPath = path.resolve(process.cwd(), '.callm', 'skills');
skillLoader.loadFromDirectory(externalSkillsPath);

// Listar Agentes Disponíveis
app.get('/api/agents', (req, res) => {
  res.json(agentService.listProfiles());
});

// Inicializa o banco de dados
sessionService.init().then(() => {
  console.log('Database initialized at:', dbPath);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'caLLM Open Runway' });
});

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
    const messages = await sessionService.getSessionHistory(req.params.id);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chat Endpoint (Com suporte a Skills e Agentes)
app.post('/api/chat', async (req, res) => {
  const { prompt, sessionId, agentId } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const currentSessionId = sessionId || `session_${Date.now()}`;
    const history = await sessionService.getSessionHistory(currentSessionId);
    const skillDefs = skillLoader.getAllDefinitions();
    
    // Busca instruções do agente se houver
    const agent = agentId ? agentService.getProfile(agentId) : undefined;
    const systemPrompt = agent?.systemPrompt;

    const chatResponse = await llmService.sendMessage(
      prompt, 
      history, 
      skillDefs,
      (name, params) => skillLoader.executeSkill(name, params),
      systemPrompt
    );
    
    // Salva no banco
    await sessionService.addMessage({ session_id: currentSessionId, role: 'user', content: prompt });
    await sessionService.addMessage({ session_id: currentSessionId, role: 'model', content: chatResponse });
    
    res.json({ 
      sessionId: currentSessionId,
      content: chatResponse 
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`caLLM API Server running at http://localhost:${port}`);
});
