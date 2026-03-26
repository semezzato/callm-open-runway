import { IBaseSkill, SkillDefinition } from '../interfaces/ISkill.js';
import { MemoryService } from '../services/MemoryService.js';

export class MemorySkill implements IBaseSkill {
  private memoryService: MemoryService;

  constructor() {
    this.memoryService = new MemoryService();
  }

  getDefinition(): SkillDefinition {
    return {
      name: 'cognitive_memory',
      description: 'Permite que a IA salve memórias persistentes (Neurônios) e recupere conhecimentos de sessões passadas.',
      parameters: [
        {
          name: 'action',
          type: 'string',
          description: 'Ação: "learn" ou "recall"',
          required: true
        },
        {
          name: 'content',
          type: 'string',
          description: 'O que deve ser lembrado (para "learn") ou o termo de busca (para "recall")',
          required: true
        },
        {
          name: 'title',
          type: 'string',
          description: 'Título sumário da memória (apenas para "learn")',
          required: false
        }
      ]
    };
  }

  async execute(params: { action: string, content: string, title?: string }): Promise<any> {
    const { action, content, title = 'Conhecimento Geral' } = params;

    try {
      if (action === 'learn') {
        await this.memoryService.learn(title, content);
        return { success: true, message: `Neurônio '${title}' armazenado com sucesso.` };
      } else if (action === 'recall') {
        const results = await this.memoryService.recall(content);
        return { success: true, results };
      }
      return { success: false, error: 'Ação inválida. Use "learn" ou "recall".' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
