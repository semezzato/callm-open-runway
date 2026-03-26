import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionService } from '../../packages/core/src/services/SessionService.js';
import { MemoryService } from '../../packages/core/src/services/MemoryService.js';
import { LlmService } from '../../packages/core/src/services/LlmService.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Reutilizando o Mock do Gemini
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        startChat: vi.fn().mockImplementation(() => ({
          sendMessage: vi.fn().mockResolvedValue({
            response: { text: () => 'Sim, eu lembro que você é o Allan e gosta de café.' }
          })
        }))
      };
    }
  }
}));

describe('User Story: Ciclo de Vida do caLLM', () => {
  let tempDir: string;
  let dbPath: string;
  
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'callm-user-story-'));
    dbPath = path.join(tempDir, 'sessions.sqlite');
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('deve simular um fluxo completo de aprendizado e resposta contextual', async () => {
    // 1. Setup dos Serviços
    const session = new SessionService(dbPath);
    const memory = new MemoryService(path.join(tempDir, 'neurons'));
    const llm = new LlmService({ apiKey: 'fake' });
    
    await session.init();
    await memory.init();

    // 2. O usuário "ensina" algo ao caLLM (Salvando Neurônio)
    await memory.learn('Perfil do Usuário', 'O nome do usuário é Allan e ele é um engenheiro de software que ama café.');

    // 3. O usuário faz uma pergunta
    const userPrompt = 'Quem sou eu e o que eu gosto?';
    
    // 4. O sistema busca no histórico de neurônios para "contextualizar" (Simulando o que o Agente faria)
    const context = await memory.recall('quem sou eu');
    const enrichedPrompt = `Contexto das minhas memórias: ${JSON.stringify(context)}\n\nPergunta: ${userPrompt}`;

    // 5. Envia para a LLM
    const response = await llm.sendMessage(enrichedPrompt);

    // 6. Validação
    expect(response).toContain('Allan');
    expect(response).toContain('café');
    
    // 7. Salva a interação no histórico
    await session.addMessage({ session_id: 's-1', role: 'user', content: userPrompt });
    await session.addMessage({ session_id: 's-1', role: 'model', content: response });

    const history = await session.getSessionHistory('s-1');
    expect(history.length).toBe(2);
    
    await session.close();
  });
});
