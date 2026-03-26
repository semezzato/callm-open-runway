import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { SessionService } from '../src/services/SessionService';
import path from 'path';
import fs from 'fs';

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(async () => {
    sessionService = new SessionService(':memory:');
    await sessionService.init();
  });

  afterAll(async () => {
    await sessionService.close();
  });

  it('deve inicializar o banco e adicionar uma mensagem', async () => {
    const msg = { session_id: 'test-1', role: 'user' as const, content: 'Olá TDD' };
    await sessionService.addMessage(msg);
    
    const history = await sessionService.getSessionHistory('test-1');
    expect(history.length).toBe(1);
    expect(history[0].content).toBe('Olá TDD');
  });

  it('deve recuperar o histórico em ordem cronológica', async () => {
    await sessionService.addMessage({ session_id: 'test-2', role: 'user', content: 'Msg 1' });
    await sessionService.addMessage({ session_id: 'test-2', role: 'model', content: 'Msg 2' });
    
    const history = await sessionService.getSessionHistory('test-2');
    expect(history.length).toBe(2);
    expect(history[0].content).toBe('Msg 1');
    expect(history[1].content).toBe('Msg 2');
  });
});
