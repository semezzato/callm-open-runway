import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { 
  LlmService, 
  SessionService, 
  SkillLoader, 
  FileSystemSkill, 
  BrowserSkill, 
  MemorySkill, 
  HygieneSkill, 
  PlaybookService, 
  AgentService,
  MemoryService,
  AgentOrchestrator
} from '@callm/core';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Configurações
const dbPath = path.resolve(process.cwd(), 'callm.sqlite');
const memoryPath = path.resolve(process.cwd(), '.callm', 'neurons');
const llmService = new LlmService({ apiKey: process.env.GEMINI_API_KEY || '' });
const sessionService = new SessionService(dbPath);
const memoryService = new MemoryService(memoryPath);
const skillLoader = new SkillLoader();
const agentService = new AgentService(llmService, memoryService);
const orchestrator = new AgentOrchestrator(llmService, memoryService);
const playbookService = new PlaybookService();

// ... (Banco de dados inicializado)

// Endpoints de Playbooks
app.get('/api/playbooks', async (req, res) => {
  try {
    const playbooks = await playbookService.listPlaybooks();
    res.json(playbooks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/playbooks/:id', async (req, res) => {
  try {
    const playbook = await playbookService.getPlaybook(req.params.id);
    res.json(playbook);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar Skills Padrão
skillLoader.registerSkill(new FileSystemSkill());
skillLoader.registerSkill(new BrowserSkill());
skillLoader.registerSkill(new MemorySkill());
skillLoader.registerSkill(new HygieneSkill());

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

// Novo endpoint de Orquestração Paralela
app.post('/api/orchestrate', async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Tasks array is required' });
  }

  try {
    const results = await orchestrator.runParallel(tasks);
    res.json({ results });
  } catch (error: any) {
    console.error('Orchestration Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`caLLM API Server running at http://localhost:${port}`);
});
