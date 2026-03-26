import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AgentOrchestrator } from '../../packages/core/src/services/AgentOrchestrator.js';
import { LlmService } from '../../packages/core/src/services/LlmService.js';
import { MemoryService } from '../../packages/core/src/services/MemoryService.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Mock do Gemini
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        startChat: vi.fn().mockImplementation(() => ({
          sendMessage: vi.fn().mockImplementation(async (prompt) => ({
            response: { text: () => `Resposta para: ${prompt}` }
          }))
        }))
      };
    }
  }
}));

describe('AgentOrchestrator Integration Tests', () => {
  let tempDir: string;
  let llm: LlmService;
  let memory: MemoryService;
  let orchestrator: AgentOrchestrator;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'callm-orchestrator-test-'));
    llm = new LlmService({ apiKey: 'fake' });
    memory = new MemoryService(path.join(tempDir, 'neurons'));
    orchestrator = new AgentOrchestrator(llm, memory);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('deve executar tarefas paralelas para múltiplos agentes', async () => {
    const tasks = [
      { id: '1', agentName: 'architect', prompt: 'Desenhe a arquitetura' },
      { id: '2', agentName: 'coder', prompt: 'Implemente o código' }
    ];

    const results = await orchestrator.runParallel(tasks);

    expect(results['1']).toContain('Desenhe a arquitetura');
    expect(results['2']).toContain('Implemente o código');
    
    expect(orchestrator.getAgent('architect')).toBeDefined();
    expect(orchestrator.getAgent('coder')).toBeDefined();
  });
});
