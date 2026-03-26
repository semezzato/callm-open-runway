import { Llama, LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";
import fs from "fs-extra";

export interface LocalLlamaConfig {
    modelPath: string;
    gpu?: boolean;
}

export class LocalLlamaService {
    private llama: Llama | null = null;
    private model: LlamaModel | null = null;
    private context: LlamaContext | null = null;

    constructor(private config: LocalLlamaConfig) {}

    private async init() {
        if (this.llama) return;

        const { getLlama } = await import("node-llama-cpp");
        this.llama = await getLlama();
        
        if (!await fs.pathExists(this.config.modelPath)) {
            throw new Error(`Modelo não encontrado em: ${this.config.modelPath}`);
        }

        this.model = await this.llama.loadModel({
            modelPath: this.config.modelPath
        });

        this.context = await this.model.createContext();
    }

    async sendMessage(prompt: string, history: any[] = []): Promise<string> {
        await this.init();
        if (!this.context) throw new Error("Falha ao inicializar contexto Llama.");

        const session = new LlamaChatSession({
            contextSequence: this.context.getSequence()
        });

        const response = await session.prompt(prompt);
        return response;
    }

    async *sendMessageStream(prompt: string, history: any[] = []): AsyncGenerator<string> {
        await this.init();
        if (!this.context) throw new Error("Falha ao inicializar contexto Llama.");

        const session = new LlamaChatSession({
            contextSequence: this.context.getSequence()
        });

        const response = await session.prompt(prompt);
        
        // Simulação de stream yieldando palavras para compatibilidade de interface
        const words = response.split(' ');
        for (const word of words) {
            yield word + ' ';
            await new Promise(r => setTimeout(r, 10)); 
        }
    }
    
    async close() {
        if (this.context) {
            // Em v3, o descarte é opcional para contextos simples, mas boa prática
        }
    }
}
