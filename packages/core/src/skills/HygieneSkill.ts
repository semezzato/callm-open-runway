import { IBaseSkill, SkillDefinition } from '../interfaces/ISkill';
import fs from 'fs-extra';
import path from 'path';

export class HygieneSkill implements IBaseSkill {
  getDefinition(): SkillDefinition {
    return {
      name: 'project_hygiene',
      description: 'Realiza limpezas e organizações no projeto para manter o ambiente saudável e as cadeias de contexto limpas.',
      parameters: [
        {
          name: 'action',
          type: 'string',
          description: 'Ação: "clean_logs" ou "organize_temp"',
          required: true
        }
      ]
    };
  }

  async execute(params: { action: string }): Promise<any> {
    const { action } = params;
    const projectRoot = process.cwd();

    try {
      if (action === 'clean_logs') {
        // Exemplo: Limpar arquivos de log fantasmas
        const logsDir = path.join(projectRoot, 'logs');
        if (await fs.pathExists(logsDir)) {
          await fs.emptyDir(logsDir);
          return { success: true, message: 'Diretório de logs limpo com sucesso.' };
        }
        return { success: true, message: 'Nenhum diretório de log encontrado para limpar.' };
      }
      return { success: false, error: 'Ação de higiene desconhecida.' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
