import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryService } from '../../packages/core/src/services/MemoryService.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('MemoryService Unit Tests', () => {
  let tempDir: string;
  let service: MemoryService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'callm-memory-test-'));
    service = new MemoryService(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('deve salvar um neurônio e recuperá-lo corretamente', async () => {
    await service.learn('Gosto de Café', 'O usuário gosta de café preto.', ['pessoal']);
    const results = await service.recall('café');

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('gosto_de_caf_');
  });

  it('deve listar todos os neurônios salvos', async () => {
    await service.learn('Info 1', 'Conteúdo 1');
    await service.learn('Info 2', 'Conteúdo 2');

    const all = await service.recall(''); // Recall vazio retorna tudo por causa do includes('')
    expect(all.length).toBe(2);
  });

  it('deve realizar busca por palavra-chave nos neurônios', async () => {
    await service.learn('Segredo', 'Segredo do Estado');
    await service.learn('Bolo', 'Receita de Bolo');

    const results = await service.recall('Estado');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('segredo');
  });
});
