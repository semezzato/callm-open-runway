import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionService } from '../../packages/core/src/services/SessionService.js';
import fs from 'fs/promises';
import path from 'path';

describe('SessionService Unit Tests', () => {
  const testDbPath = path.join(process.cwd(), 'tests', 'test_sessions.sqlite');

  let service: SessionService;

  beforeEach(async () => {
    // Limpar banco antes de cada teste
    if (await fs.stat(testDbPath).catch(() => null)) {
      await fs.unlink(testDbPath);
    }
    service = new SessionService(testDbPath);
  });

  afterEach(async () => {
    if (service) await service.close();
    // Limpar após testes
    if (await fs.stat(testDbPath).catch(() => null)) {
      await fs.unlink(testDbPath);
    }
  });

  it('deve inicializar o banco de dados e criar tabelas corretamente', async () => {
    await service.init();
    
    const sessions = await service.listSessions();
    expect(sessions).toBeInstanceOf(Array);
    expect(sessions.length).toBe(0);
  });

  it('deve adicionar e recuperar mensagens de uma sessão', async () => {
    await service.init();

    const testMessage = {
      session_id: 'test-session-1',
      role: 'user' as const,
      content: 'Olá caLLM!'
    };

    await service.addMessage(testMessage);
    const history = await service.getSessionHistory('test-session-1');

    expect(history.length).toBe(1);
    expect(history[0].role).toBe('user');
    expect(history[0].content).toBe('Olá caLLM!');
  });
});
