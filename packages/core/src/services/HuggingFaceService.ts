import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface HuggingFaceModel {
  id: string;
  author: string;
  name: string;
  lastModified: string;
  downloads: number;
}

export class HuggingFaceService {
  private baseDir: string;

  constructor(baseDir?: string) {
    // Diretório padrão: ~/.callm/models/hf
    const homeDir = process.env.USERPROFILE || process.env.HOME || '/tmp';
    this.baseDir = baseDir || path.join(homeDir, '.callm', 'models', 'hf');
  }

  /**
   * Busca metadados de um repositório no Hugging Face Hub
   */
  async getModelInfo(repoId: string): Promise<HuggingFaceModel> {
    const response = await fetch(`https://huggingface.co/api/models/${repoId}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar modelo ${repoId}: ${response.statusText}`);
    }
    const data: any = await response.json();
    return {
      id: data.id,
      author: data.author,
      name: data.id.split('/')[1],
      lastModified: data.lastModified,
      downloads: data.downloads
    };
  }

  /**
   * Lista arquivos de um repositório
   */
  async listFiles(repoId: string): Promise<string[]> {
    const response = await fetch(`https://huggingface.co/api/models/${repoId}/tree/main`);
    if (!response.ok) {
      throw new Error(`Erro ao listar arquivos de ${repoId}`);
    }
    const items: any[] = await response.json();
    return items.map(i => i.path);
  }

  /**
   * Realiza o download de um arquivo específico do repositório
   */
  async downloadFile(repoId: string, filename: string, onProgress?: (percent: number) => void): Promise<string> {
    const url = `https://huggingface.co/${repoId}/resolve/main/${filename}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Falha no download: ${response.statusText}`);
    }

    const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
    const destPath = path.join(this.baseDir, repoId.replace(/\//g, '_'), filename);
    
    await fs.mkdir(path.dirname(destPath), { recursive: true });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Não foi possível iniciar o stream de leitura.');

    const writer = createWriteStream(destPath);
    let downloaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      writer.write(Buffer.from(value));
      downloaded += value.length;
      
      if (totalSize > 0 && onProgress) {
        onProgress(Math.round((downloaded / totalSize) * 100));
      }
    }

    writer.end();
    return destPath;
  }
}
