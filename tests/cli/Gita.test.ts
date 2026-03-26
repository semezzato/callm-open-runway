import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { gitaCommand } from '../../apps/cli/src/commands/gita.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('CLI - Gita Command Test', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Criar diretório temporário para o teste
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'callm-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  it('deve criar a estrutura de pastas .callm corretamente', async () => {
    // Simular o comando gita
    await gitaCommand();

    const callmPath = path.join(tempDir, '.callm');
    const exists = await fs.pathExists(callmPath);
    expect(exists).toBe(true);

    const folders = [
      'frontend',
      'backend',
      'skills',
      'workflows',
      'neurons',
      'git'
    ];

    for (const folder of folders) {
      const folderPath = path.join(callmPath, folder);
      expect(await fs.pathExists(folderPath)).toBe(true);
    }

    // Verificar se o ZEN.md foi criado
    expect(await fs.pathExists(path.join(callmPath, 'ZEN.md'))).toBe(true);
  });

  it('deve inicializar com stack detectada se houver package.json', async () => {
    // Criar um package.json fake com react
    await fs.writeJson(path.join(tempDir, 'package.json'), {
      dependencies: {
        'react': '^18.0.0'
      }
    });

    await gitaCommand();

    const frontendMd = await fs.readFile(path.join(tempDir, '.callm', 'frontend', 'FRONTEND.md'), 'utf-8');
    expect(frontendMd).toContain('React detected');
  });
});
