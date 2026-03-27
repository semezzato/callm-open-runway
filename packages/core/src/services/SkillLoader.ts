import { IBaseSkill } from '../interfaces/ISkill.js';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

export class SkillLoader {
  private skills: Map<string, IBaseSkill> = new Map();

  registerSkill(skill: IBaseSkill) {
    const def = skill.getDefinition();
    this.skills.set(def.name, skill);
    console.log(`[SkillLoader] Skill registrada: ${def.name}`);
  }

  getSkill(name: string): IBaseSkill | undefined {
    return this.skills.get(name);
  }

  getAllDefinitions() {
    return Array.from(this.skills.values()).map(s => s.getDefinition());
  }

  async loadFromDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      console.warn(`[SkillLoader] Diretório não encontrado: ${dirPath}`);
      return;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
    for (const file of files) {
      try {
        const fullPath = path.resolve(dirPath, file);
        const fileUrl = `${pathToFileURL(fullPath).toString()}?t=${Date.now()}`;
        const { default: SkillClass } = await import(fileUrl);
        if (SkillClass && typeof SkillClass === 'function') {
          this.registerSkill(new SkillClass());
        }
      } catch (error: any) {
        console.error(`[SkillLoader] Erro ao carregar skill ${file}:`, error);
      }
    }
  }

  async executeSkill(name: string, params: any): Promise<any> {
    const skill = this.skills.get(name);
    if (!skill) {
      throw new Error(`Skill não encontrada: ${name}`);
    }
    return await skill.execute(params);
  }
}
