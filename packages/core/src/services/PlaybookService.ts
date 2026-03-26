import fs from 'fs-extra';
import path from 'path';

export interface PlaybookStep {
  skill?: string;
  agent?: string;
  action?: string;
  params?: any;
  prompt?: string;
}

export interface Playbook {
  name: string;
  description?: string;
  steps: PlaybookStep[];
}

export class PlaybookService {
  private playbookDir: string;

  constructor(basePath: string = '.callm/workflows') {
    this.playbookDir = path.resolve(process.cwd(), basePath);
  }

  async init() {
    await fs.ensureDir(this.playbookDir);
  }

  async listPlaybooks(): Promise<{ id: string, name: string }[]> {
    await this.init();
    if (!await fs.pathExists(this.playbookDir)) return [];
    
    const files = await fs.readdir(this.playbookDir);
    const playbooks: { id: string, name: string }[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readJson(path.join(this.playbookDir, file));
          playbooks.push({ id: file, name: content.name || file });
        } catch (e) {
          console.error(`[PlaybookService] Falha ao ler ${file}:`, e);
        }
      }
    }
    return playbooks;
  }

  async getPlaybook(id: string): Promise<Playbook> {
    const filePath = path.join(this.playbookDir, id);
    return await fs.readJson(filePath);
  }

  async savePlaybook(name: string, playbook: Playbook): Promise<void> {
    await this.init();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.json';
    const filePath = path.join(this.playbookDir, id);
    await fs.writeJson(filePath, playbook, { spaces: 2 });
  }
}
