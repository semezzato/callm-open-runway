import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações (Resolução absoluta via import.meta.url)
// src/index.ts -> src -> apps/server -> apps -> root
const rootDir = path.resolve(__dirname, '..', '..', '..');

const app = express();
const port = process.env.PORT || 3888;

app.use(cors());
app.use(bodyParser.json());

const dbPath = path.resolve(rootDir, 'callm.sqlite');
const memoryPath = path.resolve(rootDir, '.callm', 'neurons');
const llmService = new LlmService({ apiKey: process.env.GEMINI_API_KEY || '' });
const sessionService = new SessionService(dbPath);
const memoryService = new MemoryService(memoryPath);
const skillLoader = new SkillLoader();
const agentService = new AgentService(llmService, memoryService);
const orchestrator = new AgentOrchestrator(llmService, memoryService);
const playbookService = new PlaybookService();
const hfService = new HuggingFaceService(path.resolve(rootDir, 'models'));

// Cache de instâncias de modelos locais para evitar recarregar
const localModels: Record<string, { service: LocalLlamaService, lastUsed: number }> = {};
const sessionModels: Record<string, string> = {}; // session_id -> model_id

// Limpeza automática de modelos inativos (10 minutos)
setInterval(() => {
  const now = Date.now();
  const timeout = 10 * 60 * 1000;
  for (const id in localModels) {
    if (now - localModels[id].lastUsed > timeout) {
      console.log(`[Server] Unloading inactive model: ${id}`);
      localModels[id].service.close();
      delete localModels[id];
    }
  }
}, 60000);

// Registrar Skills Padrão
skillLoader.registerSkill(new FileSystemSkill());
skillLoader.registerSkill(new BrowserSkill());
skillLoader.registerSkill(new MemorySkill());
skillLoader.registerSkill(new HygieneSkill());

// Carregar Skills Dinâmicas da Raiz
const externalSkillsPath = path.resolve(rootDir, '.callm', 'skills');
skillLoader.loadFromDirectory(externalSkillsPath);

// Inicializa o banco de dados
sessionService.init().then(() => {
  console.log('Database initialized at:', dbPath);
});

// Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'caLLM Open Runway' });
});

app.get('/api/agents', (req, res) => {
  res.json(agentService.listProfiles());
});

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await sessionService.listSessions();
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:id/messages', async (req, res) => {
  try {
    const messages = await sessionService.getSessionHistory(req.params.id);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/models/local', async (req, res) => {
  try {
    const projectModelsDir = path.resolve(rootDir, 'models');
    const homeDir = process.env.USERPROFILE || process.env.HOME || '/tmp';
    const globalModelsDir = path.join(homeDir, '.callm', 'models');
    
    const allModels: any[] = [];
    const scanDir = async (dir: string, type: 'local' | 'global') => {
      if (await fs.pathExists(dir)) {
        const files = await fs.readdir(dir);
        files.filter(f => f.endsWith('.gguf')).forEach(f => {
          allModels.push({ id: f, name: path.basename(f), path: path.join(dir, f), type });
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

app.get('/api/gita/blueprint', async (req, res) => {
  try {
    const blueprintPath = path.resolve(rootDir, '.callm', 'blueprint.json');
    if (await fs.pathExists(blueprintPath)) {
      const blueprint = await fs.readJson(blueprintPath);
      res.json(blueprint);
    } else {
      res.status(404).json({ error: 'Blueprint not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gita/audit', async (req, res) => {
  try {
    const auditResults = [];
    const filesToAudit = ['apps/server/src/index.ts', 'packages/core/src/services/LlmService.ts', 'tests/canary.ts'];
    const auditSkill = skillLoader.getSkill('security_audit');
    if (!auditSkill) throw new Error('Security Audit Skill não carregada.');
    for (const file of filesToAudit) {
      const fullPath = path.join(rootDir, file);
      if (await fs.pathExists(fullPath)) {
        const result = await auditSkill.execute({ filePath: fullPath });
        // Sobrescreve o path absoluto pelo relativo para exibição amigável
        result.file = file;
        auditResults.push(result);
      }
    }
    res.json({
      summary: { total: auditResults.length, passed: auditResults.filter(r => r.status === 'PASS').length, failed: auditResults.filter(r => r.status === 'FAIL').length },
      results: auditResults,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const { prompt, sessionId, agentId } = req.body;
  try {
    const currentSessionId = sessionId || `session_${Date.now()}`;
    const modelId = sessionModels[currentSessionId] || agentId || 'gemini';
    let currentLlm = llmService;
    if (modelId.endsWith('.gguf')) {
        if (!localModels[modelId]) {
            const projectModelsDir = path.resolve(rootDir, 'models');
            const homeDir = process.env.USERPROFILE || process.env.HOME || '/tmp';
            const globalModelsDir = path.join(homeDir, '.callm', 'models');
            let modelPath = path.join(projectModelsDir, modelId);
            if (!await fs.pathExists(modelPath)) modelPath = path.join(globalModelsDir, modelId);
            localModels[modelId] = { service: new LocalLlamaService({ modelPath }), lastUsed: Date.now() };
        } else {
            localModels[modelId].lastUsed = Date.now();
        }
        currentLlm = localModels[modelId].service as any;
    }
    const history = await sessionService.getSessionHistory(currentSessionId);
    const skillDefs = skillLoader.getAllDefinitions();
    const chatResponse = await currentLlm.sendMessage(prompt, history, skillDefs, (name, params) => skillLoader.executeSkill(name, params));
    await sessionService.addMessage({ session_id: currentSessionId, role: 'user', content: prompt });
    await sessionService.addMessage({ session_id: currentSessionId, role: 'model', content: chatResponse });
    res.json({ sessionId: currentSessionId, content: chatResponse });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`caLLM API Server running at http://localhost:${port}`);
  console.log(`Project Root: ${rootDir}`);
});
