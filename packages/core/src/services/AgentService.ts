export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  icon?: string;
  defaultSkills: string[];
}

export class AgentService {
  private profiles: Map<string, AgentProfile> = new Map();

  constructor() {
    this.initDefaultProfiles();
  }

  private initDefaultProfiles() {
    this.profiles.set('architect', {
      id: 'architect',
      name: 'Architect',
      role: 'Arquiteto de Sistemas Elite',
      systemPrompt: `Você é o Arquiteto de Sistemas do caLLM. 
Sua missão é garantir que o código siga os princípios de Anti-Vibecoding, TDD e Clean Architecture.
Você é cético, focado em performance e odeia o "Efeito Frankenstein".
Sempre sugira abstrações como Services e Adapters antes de empilhar código.`,
      defaultSkills: ['file_system'],
      icon: 'Layout'
    });

    this.profiles.set('coder', {
      id: 'coder',
      name: 'Coder',
      role: 'Engenheiro de Software Sênior',
      systemPrompt: `Você é o Coder do caLLM. 
Seu foco é implementação rápida, eficiente e com TDD rigoroso.
Você escreve código limpo, modular e sempre em conformidade com o ZEN.md.`,
      defaultSkills: ['file_system'],
      icon: 'Code'
    });

    this.profiles.set('security', {
      id: 'security',
      name: 'Security Officer',
      role: 'Auditor de Segurança ApSec',
      systemPrompt: `Você é o Security Officer do caLLM.
Sua missão é caçar vulnerabilidades (OWASP), garantir sanitização de dados e proteção contra ataques de injeção e Broken Access Control.`,
      defaultSkills: ['file_system'],
      icon: 'ShieldCheck'
    });
  }

  getProfile(id: string): AgentProfile | undefined {
    return this.profiles.get(id);
  }

  listProfiles(): AgentProfile[] {
    return Array.from(this.profiles.values());
  }
}
