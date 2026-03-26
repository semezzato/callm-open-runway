import { IBaseSkill, SkillDefinition } from '../interfaces/ISkill';
import { BrowserService } from '@callm/browser';
import path from 'path';

export class BrowserSkill implements IBaseSkill {
  private browserService: BrowserService;
  private screenshotDir: string;

  constructor() {
    this.browserService = new BrowserService();
    this.screenshotDir = path.resolve(process.cwd(), 'screenshots');
  }

  getDefinition(): SkillDefinition {
    return {
      name: 'browser_automation',
      description: 'Navega em URLs, extrai conteúdo texto e captura screenshots de páginas web.',
      parameters: [
        {
          name: 'url',
          type: 'string',
          description: 'A URL completa para navegar (ex: https://google.com)',
          required: true
        },
        {
          name: 'action',
          type: 'string',
          description: 'A ação a ser realizada: "snapshot" (padrão) ou "screenshot"',
          required: false
        }
      ]
    };
  }

  async execute(params: { url: string, action?: string }): Promise<any> {
    const { url, action = 'snapshot' } = params;
    
    try {
      // Garante que o diretório de screenshots existe se necessário
      const snapshot = await this.browserService.getSnapshot(url, action === 'screenshot' ? this.screenshotDir : undefined);
      
      return {
        success: true,
        data: snapshot
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
