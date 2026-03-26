import { IBaseSkill, SkillDefinition } from '../interfaces/ISkill';
import fs from 'fs/promises';
import path from 'path';

export class FileSystemSkill implements IBaseSkill {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  getDefinition(): SkillDefinition {
    return {
      name: 'file_system',
      description: 'Permite ler e escrever arquivos no projeto local.',
      parameters: [
        {
          name: 'action',
          type: 'string',
          description: 'Ação a realizar: read ou write',
          required: true
        },
        {
          name: 'filePath',
          type: 'string',
          description: 'Caminho do arquivo relativo à raiz do projeto',
          required: true
        },
        {
          name: 'content',
          type: 'string',
          description: 'Conteúdo para escrita (obrigatório se action for write)',
          required: false
        }
      ]
    };
  }

  async execute(params: { action: 'read' | 'write', filePath: string, content?: string }): Promise<any> {
    const fullPath = path.resolve(this.baseDir, params.filePath);

    // Proteção básica: não permitir sair do diretório base
    if (!fullPath.startsWith(this.baseDir)) {
      throw new Error('Acesso negado: Tentativa de acessar arquivo fora do projeto.');
    }

    if (params.action === 'read') {
      try {
        const data = await fs.readFile(fullPath, 'utf-8');
        return { success: true, content: data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    } else if (params.action === 'write') {
      if (!params.content) throw new Error('Conteúdo é necessário para escrita.');
      try {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, params.content, 'utf-8');
        return { success: true, message: 'Arquivo salvo com sucesso.' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }

    throw new Error('Ação inválida.');
  }
}
