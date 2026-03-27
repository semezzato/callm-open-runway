import fs from 'fs-extra';
import path from 'path';

export default class ProjectGitaSkill {
  getDefinition() {
    return {
      name: 'gita_inspect',
      description: 'Realiza uma inspeção profunda no projeto para identificar a stack, frameworks e banco de dados.',
      parameters: [
        {
          name: 'directory',
          type: 'string',
          description: 'O diretório raiz para inspecionar.',
          required: true
        }
      ]
    };
  }

  async execute({ directory }: { directory: string }) {
    const root = path.resolve(process.cwd(), directory);
    const packageJsonPath = path.join(root, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return { error: 'package.json não encontrado no diretório especificado.' };
    }

    const pkg = await fs.readJson(packageJsonPath);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    const blueprint = {
      name: pkg.name,
      stack: this.detectStack(deps),
      database: this.detectDatabase(deps),
      timestamp: new Date().toISOString()
    };

    // Salva o blueprint no diretório .callm
    const callmPath = path.join(root, '.callm', 'blueprint.json');
    await fs.ensureDir(path.dirname(callmPath));
    await fs.writeJson(callmPath, blueprint, { spaces: 2 });

    return blueprint;
  }

  private detectStack(deps: any) {
    if (deps['next']) return 'Next.js';
    if (deps['react']) return 'React';
    if (deps['vue']) return 'Vue';
    if (deps['@angular/core']) return 'Angular';
    return 'Unknown Node.js';
  }

  private detectDatabase(deps: any) {
    if (deps['prisma']) return 'Prisma';
    if (deps['sequelize']) return 'Sequelize';
    if (deps['knex']) return 'Knex / SQLite';
    if (deps['mongoose']) return 'MongoDB';
    return 'None detected';
  }
}
