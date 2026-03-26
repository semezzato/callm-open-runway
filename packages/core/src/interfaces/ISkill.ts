export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
}

export interface SkillDefinition {
  name: string;
  description: string;
  parameters: SkillParameter[];
}

export interface IBaseSkill {
  getDefinition(): SkillDefinition;
  execute(params: any): Promise<any>;
}
