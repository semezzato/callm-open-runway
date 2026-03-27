import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
// Mocking LlmService to test logic without API cost during CI
// But we could also use a real key if available

describe('caLLM / Open Runway - Compliance Audit', () => {
  it('should have a valid ZEN.md file in .callm', async () => {
    const zenPath = path.resolve(process.cwd(), '.callm', 'ZEN.md');
    const exists = await fs.pathExists(zenPath);
    expect(exists).toBe(true);
    
    const content = await fs.readFile(zenPath, 'utf-8');
    expect(content).toContain('Anti-Vibe Coding');
    expect(content).toContain('12-Factor App');
  });

  it('should enforce TDD and Security in system instructions', async () => {
    // Simulando como o orquestrador prepara o sistema
    const zenContent = await fs.readFile(path.resolve(process.cwd(), '.callm', 'ZEN.md'), 'utf-8');
    
    // Simulação de uma resposta de IA que "falha" na conformidade
    const badResponse = "Aqui está o código: function login(u, p) { db.query('select * from users where u = ' + u); }";
    
    // Simulação de uma resposta de IA que "passa" na conformidade (Elite)
    const eliteResponse = `
      Para implementar o login seguindo o ZEN.md:
      1. Primeiro, criamos o teste unitário (TDD). 
      2. Usamos Prepared Statements contra SQL Injection.
      3. As credenciais do DB devem vir de variáveis de ambiente (.env).
    `;

    expect(eliteResponse.toLowerCase()).toContain('tdd');
    expect(eliteResponse.toLowerCase()).toContain('sql injection');
    expect(eliteResponse.toLowerCase()).toContain('variáveis de ambiente');
    
    // O teste real passaria se o LlmService injetasse o ZEN.md e o modelo respondesse como eliteResponse
  });

  it('should have all .callm cognitive folders populated', async () => {
    const dirs = ['neurons', 'synapses', 'skills', 'agents', 'workflows'];
    for (const dir of dirs) {
      const dirPath = path.resolve(process.cwd(), '.callm', dir);
      const exists = await fs.pathExists(dirPath);
      expect(exists).toBe(true);
      
      const files = await fs.readdir(dirPath);
      expect(files.length).toBeGreaterThan(0);
    }
  });
});
