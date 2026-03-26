import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { SkillDefinition } from '../interfaces/ISkill.js';

export interface LlmConfig {
  apiKey: string;
  modelName?: string;
}

export class LlmService {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(config: LlmConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.modelName = config.modelName || 'gemini-1.5-pro';
  }

  private getFormattedTools(skillDefinitions: SkillDefinition[]) {
    if (skillDefinitions.length === 0) return undefined;
    
    return [{
      functionDeclarations: skillDefinitions.map(def => ({
        name: def.name,
        description: def.description,
        parameters: {
          type: SchemaType.OBJECT,
          properties: def.parameters.reduce((acc: any, p: any) => {
            acc[p.name] = { 
              type: this.mapTypeToSchemaType(p.type), 
              description: p.description 
            };
            return acc;
          }, {}),
          required: def.parameters.filter((p: any) => p.required).map((p: any) => p.name)
        }
      }))
    }];
  }

  private mapTypeToSchemaType(type: string): SchemaType {
    switch (type.toLowerCase()) {
      case 'string': return SchemaType.STRING;
      case 'number': return SchemaType.NUMBER;
      case 'boolean': return SchemaType.BOOLEAN;
      case 'object': return SchemaType.OBJECT;
      case 'array': return SchemaType.ARRAY;
      default: return SchemaType.STRING;
    }
  }

  async sendMessage(prompt: string, history: any[] = [], skillDefinitions: SkillDefinition[] = [], executeTool?: (name: string, params: any) => Promise<any>, systemInstruction?: string) {
    const tools = this.getFormattedTools(skillDefinitions);
    const model = this.genAI.getGenerativeModel({ 
      model: this.modelName, 
      tools,
      systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined
    });
    
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content || (typeof msg.parts === 'string' ? msg.parts : msg.parts?.[0]?.text) }]
      })),
    });

    let result = await chat.sendMessage(prompt);
    let response = result.response;
    
    // Loop de recursão para Function Calling
    while (response.candidates?.[0]?.content?.parts?.[0]?.functionCall && executeTool) {
      const call = response.candidates[0].content.parts[0].functionCall;
      console.log(`[LlmService] Executando Tool: ${call.name}`, call.args);
      
      try {
        const toolResult = await executeTool(call.name, call.args);
        
        // Envia o resultado de volta para o Gemini
        result = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: { result: toolResult }
          }
        }]);
        response = result.response;
      } catch (error: any) {
        console.error(`[LlmService] Erro na Tool ${call.name}:`, error);
        result = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: { error: error.message }
          }
        }]);
        response = result.response;
      }
    }

    return response.text();
  }

  async *sendMessageStream(prompt: string, history: any[] = [], skillDefinitions: SkillDefinition[] = []) {
    const tools = this.getFormattedTools(skillDefinitions);
    const model = this.genAI.getGenerativeModel({ model: this.modelName, tools });

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content || (typeof msg.parts === 'string' ? msg.parts : msg.parts?.[0]?.text) }]
      })),
    });

    const result = await chat.sendMessageStream(prompt);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
}
