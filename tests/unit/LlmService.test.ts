import { describe, it, expect, vi } from 'vitest';
import { LlmService } from '../../packages/core/src/services/LlmService.js';

// Mock do Google Generative AI
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          startChat: vi.fn().mockImplementation(() => ({
            sendMessage: vi.fn().mockResolvedValue({
              response: {
                text: () => 'Resposta Simulada do Gemini'
              }
            }),
            sendMessageStream: vi.fn().mockResolvedValue({
              stream: (async function* () {
                yield { text: () => 'Chu' };
                yield { text: () => 'nk' };
              })()
            })
          }))
        };
      }
    }
  };
});

describe('LlmService Unit Tests', () => {
  it('deve enviar uma mensagem e retornar o texto da resposta', async () => {
    const service = new LlmService({ apiKey: 'fake-key' });
    const response = await service.sendMessage('Olá!');
    
    expect(response).toBe('Resposta Simulada do Gemini');
  });

  it('deve enviar uma mensagem via stream e retornar chunks', async () => {
    const service = new LlmService({ apiKey: 'fake-key' });
    const chunks: string[] = [];
    
    for await (const chunk of service.sendMessageStream('Olá Stream!')) {
      chunks.push(chunk);
    }
    
    expect(chunks).toEqual(['Chu', 'nk']);
  });
});
