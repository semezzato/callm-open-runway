import { describe, it, expect, vi } from 'vitest';
import { HuggingFaceService } from '../../packages/core/src/services/HuggingFaceService.js';

// Mock do fetch global (Node 18+)
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HuggingFaceService Unit Tests', () => {
  it('deve buscar metadados de um modelo do Hugging Face Hub (Mocked)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'user/model-repo',
        author: 'user',
        lastModified: '2024',
        downloads: 100
      })
    });

    const service = new HuggingFaceService();
    const info = await service.getModelInfo('user/model-repo');

    expect(info.id).toBe('user/model-repo');
    expect(info.downloads).toBe(100);
    expect(mockFetch).toHaveBeenCalledWith('https://huggingface.co/api/models/user/model-repo');
  });

  it('deve lançar erro se a resposta do Hub não for ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    });

    const service = new HuggingFaceService();
    await expect(service.getModelInfo('invalid/repo')).rejects.toThrow('Erro ao buscar modelo invalid/repo: Not Found');
  });
});
