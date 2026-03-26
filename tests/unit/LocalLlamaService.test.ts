import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalLlamaService } from '../../packages/core/src/services/LocalLlamaService.js';
import fs from 'fs-extra';
import * as nodeLlama from 'node-llama-cpp';

// Mock do node-llama-cpp
vi.mock('node-llama-cpp', () => {
    return {
        getLlama: vi.fn().mockResolvedValue({
            loadModel: vi.fn().mockResolvedValue({
                createContext: vi.fn().mockResolvedValue({
                    getSequence: vi.fn().mockReturnValue({})
                })
            })
        }),
        LlamaChatSession: class {
            prompt = vi.fn().mockResolvedValue('Resposta Local Mockada');
        },
        LlamaModel: class {},
        LlamaContext: class {},
        LlamaGrammar: class {}
    };
});

// Mock do fs-extra com controle manual
vi.mock('fs-extra', () => ({
    default: {
        pathExists: vi.fn().mockResolvedValue(true),
        ensureDir: vi.fn().mockResolvedValue(undefined)
    },
    pathExists: vi.fn().mockResolvedValue(true),
    ensureDir: vi.fn().mockResolvedValue(undefined)
}));

describe('LocalLlamaService Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset pathExists to default true
        (fs.pathExists as any).mockResolvedValue(true);
    });

    it('deve inicializar e enviar uma mensagem (Mocked)', async () => {
        const service = new LocalLlamaService({ modelPath: '/path/to/model.gguf' });
        const response = await service.sendMessage('Olá local!');
        
        expect(response).toBe('Resposta Local Mockada');
    });

    it('deve simular o stream de mensagens (Mocked)', async () => {
        const service = new LocalLlamaService({ modelPath: '/path/to/model.gguf' });
        const chunks: string[] = [];
        
        for await (const chunk of service.sendMessageStream('Olá stream!')) {
            chunks.push(chunk);
        }
        
        expect(chunks.join('')).toContain('Resposta Local Mockada');
    });

    it('deve lançar erro se o modelo não existir', async () => {
        // Agora o mock é compartilhado e acessível via o import 'fs'
        (fs.pathExists as any).mockResolvedValue(false);

        const service = new LocalLlamaService({ modelPath: '/invalid/path' });
        await expect(service.sendMessage('oi')).rejects.toThrow('Modelo não encontrado');
    });
});
