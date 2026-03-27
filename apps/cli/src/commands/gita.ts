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

    // 3. Detecção de Stack Inteligente
    const pkgPath = path.join(rootDir, 'package.json');
    let blueprint: any = {
      project: path.basename(rootDir),
      stack: {
        frontend: 'Desconhecido',
        backend: 'Desconhecido',
        runtime: 'Node.js'
      },
      database: 'Desconhecido',
      detectedAt: new Date().toISOString()
    };
    
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['react']) blueprint.stack.frontend = 'React';
      if (deps['vue']) blueprint.stack.frontend = 'Vue';
      if (deps['next']) blueprint.stack.frontend = 'Next.js';
      
      if (deps['express'] || deps['@nestjs/core']) blueprint.stack.backend = 'Express/NestJS';
      if (deps['prisma']) blueprint.database = 'Prisma';
      if (deps['mongoose']) blueprint.database = 'MongoDB';
      if (deps['knex'] || deps['sqlite3']) blueprint.database = 'SQLite/SQL';
    }

    if (await fs.pathExists(path.join(rootDir, 'requirements.txt'))) {
      blueprint.stack.backend = 'Python';
    }

    // Gravar Blueprint
    await fs.writeJson(path.join(callmDir, 'blueprint.json'), blueprint, { spaces: 2 });

    if (await fs.pathExists(path.join(rootDir, 'requirements.txt'))) {
      blueprint.stack.backend = 'Python';
    }

    // 4. Salvar arquivos de configuração
    await fs.writeFile(path.join(callmDir, 'frontend', 'FRONTEND.md'), `# FRONTEND.md - Configurações de UI/UX\n\nFrontend: ${blueprint.stack.frontend}\n\n## Diretrizes Elite\n- Performance: Throttling e Debouncing.\n- UX: Micro-interações Framer Motion.\n- SEO: Semantic HTML único H1.`);
    
    await fs.writeFile(path.join(callmDir, 'backend', 'BACKEND.md'), `# BACKEND.md - Configurações de API/DB\n\nBackend: ${blueprint.stack.backend}\n\n## Diretrizes Elite\n- Arquitetura: Hexagonal (Domain Driven).\n- Segurança: OWASP Top 10 Sanitization.\n- DB: Caching estratégico (Redis/SQLite).`);
    
    await fs.writeFile(path.join(callmDir, 'hygiene', 'HYGIENE.md'), '# HYGIENE.md - Higiene do Projeto\n\nLogs de limpeza e organização do projeto para desembaraço de cadeias de contexto.');

    console.log(chalk.green('✔ Diretório .callm inicializado com sucesso!'));
    console.log(chalk.blue(`Stack identificada: ${blueprint.stack.frontend} | ${blueprint.stack.backend}`));
    console.log(chalk.magenta(`Banco de dados sugerido: ${blueprint.database}`));
    console.log(chalk.gray(`Blueprint gerado em: .callm/blueprint.json`));
    
  } catch (error) {
    console.error(chalk.red('Erro ao inicializar o check-up:'), error);
  }
}
