import fs from 'fs-extra';
import path from 'path';

export interface Neuron {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export class MemoryService {
  private neuronDir: string;

  constructor(basePath: string = '.callm/neurons') {
    this.neuronDir = path.resolve(process.cwd(), basePath);
  }

  async init() {
    await fs.ensureDir(this.neuronDir);
  }

  async learn(title: string, content: string, tags: string[] = []): Promise<void> {
    await this.init();
    const id = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const neuron: Neuron = {
      id,
      content,
      tags,
      createdAt: new Date().toISOString()
    };

    const filePath = path.join(this.neuronDir, `${id}.json`);
    await fs.writeJson(filePath, neuron, { spaces: 2 });
    console.log(`[MemoryService] Novo neurônio formado: ${id}`);
  }

  async recall(query: string): Promise<Neuron[]> {
    await this.init();
    const files = await fs.readdir(this.neuronDir);
    const neurons: Neuron[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const neuron: Neuron = await fs.readJson(path.join(this.neuronDir, file));
        if (neuron.content.toLowerCase().includes(query.toLowerCase()) || 
            neuron.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))) {
          neurons.push(neuron);
        }
      }
    }

    return neurons;
  }
}
