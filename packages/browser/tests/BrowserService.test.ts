import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { BrowserService } from '../src/services/BrowserService';
import path from 'path';
import fs from 'fs';

describe('BrowserService', () => {
  let browserService: BrowserService;
  const tempDir = path.join(__dirname, 'temp_screenshots');

  beforeAll(async () => {
    browserService = new BrowserService();
    await browserService.init();
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  });

  afterAll(async () => {
    await browserService.close();
    // Limpar pasta temporária
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('deve navegar até uma URL e capturar o título e conteúdo', async () => {
    // Usando uma URL estática e confiável para testes
    const snapshot = await browserService.getSnapshot('https://example.com');
    
    expect(snapshot.url).toBe('https://example.com');
    expect(snapshot.title).toContain('Example Domain');
    expect(snapshot.content.toLowerCase()).toContain('example');
  }, 30000); // Aumentando timeout para rede

  it('deve gerar um screenshot se solicitado', async () => {
    const snapshot = await browserService.getSnapshot('https://example.com', tempDir);
    
    expect(snapshot.screenshotPath).toBeDefined();
    expect(fs.existsSync(snapshot.screenshotPath!)).toBe(true);
  }, 30000);
});
