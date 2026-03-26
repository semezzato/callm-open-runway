import { IBaseSkill } from '../interfaces/ISkill';

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

  async executeSkill(name: string, params: any): Promise<any> {
    const skill = this.skills.get(name);
    if (!skill) {
      throw new Error(`Skill não encontrada: ${name}`);
    }
    return await skill.execute(params);
  }
}
