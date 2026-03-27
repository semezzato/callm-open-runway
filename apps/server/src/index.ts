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
  AgentOrchestrator,
  HuggingFaceService,
  LocalLlamaService
} from '@callm/core';
import fs from 'fs-extra';

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
const hfService = new HuggingFaceService(path.resolve(process.cwd(), 'models'));

// Cache de instâncias de modelos locais para evitar recarregar
const localModels: Record<string, LocalLlamaService> = {};
const sessionModels: Record<string, string> = {}; // session_id -> model_id

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

// Endpoints de Modelos
app.get('/api/models/local', async (req, res) => {
  try {
    const projectModelsDir = path.resolve(process.cwd(), 'models');
    const homeDir = process.env.USERPROFILE || process.env.HOME || '/tmp';
    const globalModelsDir = path.join(homeDir, '.callm', 'models');
    
    const allModels: any[] = [];

    const scanDir = async (dir: string, type: 'local' | 'global') => {
      if (await fs.pathExists(dir)) {
        const files = await fs.readdir(dir, { recursive: true });
        (files as string[]).filter(f => f.endsWith('.gguf')).forEach(f => {
          allModels.push({ 
            id: f, 
            name: path.basename(f), 
            path: path.join(dir, f),
            type 
          });
        });
      }
    };

    await scanDir(projectModelsDir, 'local');
    await scanDir(globalModelsDir, 'global');

    res.json(allModels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gita/inspect', async (req, res) => {
  try {
    const rootDir = process.cwd();
    const pkgPath = path.join(rootDir, 'package.json');
    let blueprint: any = {
      project: path.basename(rootDir),
      stack: {},
      database: 'Desconhecido',
      detectedAt: new Date().toISOString()
    };

    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      blueprint.stack.framework = deps['next'] ? 'Next.js' : (deps['react'] ? 'React' : (deps['vue'] ? 'Vue' : 'Vanilla/Other'));
      blueprint.stack.runtime = 'Node.js';
      
      if (deps['prisma']) blueprint.database = 'Prisma / SQL';
      if (deps['mongoose']) blueprint.database = 'MongoDB';
      if (deps['knex'] || deps['sqlite3']) blueprint.database = 'SQLite/SQL';
    }

    const callmDir = path.join(rootDir, '.callm');
    await fs.ensureDir(callmDir);
    await fs.writeJson(path.join(callmDir, 'blueprint.json'), blueprint, { spaces: 2 });

    res.json(blueprint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/models/hf/search', async (req, res) => {
  const { q } = req.query;
  try {
    const response = await fetch(`https://huggingface.co/api/models?search=${q}&filter=gguf&sort=downloads&direction=-1&limit=10`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/models/hf/download', async (req, res) => {
  const { repoId, filename } = req.body;
  try {
    // Inicia download (não bloqueia a resposta se for longo, mas aqui faremos await para simplicidade inicial)
    const filePath = await hfService.downloadFile(repoId, filename, (progress) => {
      console.log(`Download progress for ${filename}: ${progress}%`);
    });
    res.json({ success: true, path: filePath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions/:id/model', (req, res) => {
  const { modelId } = req.body;
  sessionModels[req.params.id] = modelId;
  res.json({ success: true });
});

app.get('/api/gita/blueprint', async (req, res) => {
  try {
    const blueprintPath = path.resolve(process.cwd(), '.callm', 'blueprint.json');
    if (await fs.pathExists(blueprintPath)) {
      const blueprint = await fs.readJson(blueprintPath);
      res.json(blueprint);
    } else {
      res.status(404).json({ error: 'Blueprint not found. Run inspect first.' });
    }
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
    const modelId = sessionModels[currentSessionId] || agentId || 'gemini';
    
    let currentLlm = llmService;

    // Se o modelo for local/global (.gguf)
    if (modelId.endsWith('.gguf')) {
        if (!localModels[modelId]) {
            // Busca o caminho real do modelo na lista de modelos detectados
            const projectModelsDir = path.resolve(process.cwd(), 'models');
            const homeDir = process.env.USERPROFILE || process.env.HOME || '/tmp';
            const globalModelsDir = path.join(homeDir, '.callm', 'models');
            
            let modelPath = path.join(projectModelsDir, modelId);
            if (!await fs.pathExists(modelPath)) {
                modelPath = path.join(globalModelsDir, modelId);
            }
            
            // Se ainda não achou, tenta recursivo nas subpastas (hf/...)
            if (!await fs.pathExists(modelPath)) {
                const searchModel = async (dir: string): Promise<string | null> => {
                    if (await fs.pathExists(dir)) {
                        const files = await fs.readdir(dir, { recursive: true });
                        const found = (files as string[]).find(f => f.endsWith(modelId));
                        return found ? path.join(dir, found) : null;
                    }
                    return null;
                };
                modelPath = await searchModel(projectModelsDir) || await searchModel(globalModelsDir) || modelPath;
            }

            localModels[modelId] = new LocalLlamaService({ modelPath });
        }
        currentLlm = localModels[modelId] as any;
    }

    const history = await sessionService.getSessionHistory(currentSessionId);
    const skillDefs = skillLoader.getAllDefinitions();
    
    // Busca instruções do agente se houver
    const agent = agentId && !agentId.endsWith('.gguf') ? agentService.getProfile(agentId) : undefined;
    const systemPrompt = agent?.systemPrompt;

    // LocalLlamaService no core pode precisar de chat history no formato correto
    const chatResponse = await currentLlm.sendMessage(
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
