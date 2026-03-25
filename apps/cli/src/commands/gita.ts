import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function gitaCommand() {
  const rootDir = process.cwd();
  const callmDir = path.join(rootDir, '.callm');

  console.log(chalk.blue('Iniciando check-up do projeto caLLM...'));

  try {
    // 1. Criar estrutura de pastas
    const folders = [
      '',
      'frontend',
      'backend',
      'skills',
      'workflows',
      'plugins',
      'mcps',
      'llms',
      'agents',
      'group-agents',
      'neurons',
      'synapses',
      'hygiene',
      'git'
    ];

    for (const folder of folders) {
      await fs.ensureDir(path.join(callmDir, folder));
    }

    // 2. Criar ZEN.md
    const zenContent = `# ZEN.md - O Livro de Regras do caLLM

## Conceitos de Anti-Vibecoding
- **Precisão sobre Emoção**: Não codar por "vibe", mas por lógica e evidência.
- **Economia de Tokens**: Diretrizes diretas e automatizadas para reduzir 90% do gasto.
- **TDD (Test Driven Development)**: Testes primeiro, código depois.
- **Segurança by Design**: Mente de hacker de elite em cada linha.

## Arquitetura
- **Hexagonal / Ports and Adapters**: Quando cabível.
- **12 Factor App**: Princípios modernos para apps resilientes.
- **Design Patterns**: Uso consciente de padrões consagrados.

## Higiene Mental do Projeto
- Evitar arquivos Frankenstein.
- Manter cadeias de contexto limpas.
- Corrigir alucinações e derivas de pensamento do LLM.
`;
    await fs.writeFile(path.join(callmDir, 'ZEN.md'), zenContent);

    // 3. Criar FRONTEND.md e BACKEND.md
    await fs.writeFile(path.join(callmDir, 'frontend', 'FRONTEND.md'), '# Configurações de Frontend\nIdentifique frameworks (React, Vue, Svelte) e suas versões aqui.');
    await fs.writeFile(path.join(callmDir, 'backend', 'BACKEND.md'), '# Configurações de Backend\nIdentifique stacks (Node, Python, PHP) e bancos de dados aqui.');
    await fs.writeFile(path.join(callmDir, 'hygiene', 'HYGIENE.md'), '# Higiene do Projeto\nLogs de limpeza e organização do projeto.');

    console.log(chalk.green('✔ Diretório .callm inicializado com sucesso!'));
    console.log(chalk.gray(`Localizado em: ${callmDir}`));
    
  } catch (error) {
    console.error(chalk.red('Erro ao inicializar o check-up:'), error);
  }
}
