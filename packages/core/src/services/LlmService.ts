import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LlmConfig {
  apiKey: string;
  modelName?: string;
}

export class LlmService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(config: LlmConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.modelName || 'gemini-pro' });
  }

  async sendMessage(prompt: string, history: any[] = []) {
    const chat = this.model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.parts || msg.content
      })),
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  }

  async *sendMessageStream(prompt: string, history: any[] = []) {
    const chat = this.model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.parts || msg.content
      })),
    });

    const result = await chat.sendMessageStream(prompt);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
}
