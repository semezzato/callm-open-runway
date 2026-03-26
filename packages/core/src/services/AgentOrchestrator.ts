import { AgentService } from "./AgentService.js";
import { LlmService } from "./LlmService.js";
import { MemoryService } from "./MemoryService.js";

export interface OrchestrationTask {
    id: string;
    agentName: string;
    prompt: string;
    profileId?: string;
}

export class AgentOrchestrator {
    private agents: Map<string, AgentService> = new Map();

    constructor(
        private llm: LlmService,
        private memory: MemoryService
    ) {}

    async spawnAgent(name: string): Promise<AgentService> {
        // Agora o AgentService recebe llm e memory no constructor
        const agent = new AgentService(this.llm, this.memory);
        this.agents.set(name, agent);
        return agent;
    }

    async runParallel(tasks: OrchestrationTask[]): Promise<Record<string, string>> {
        const promises = tasks.map(async (task) => {
            const agent = this.agents.get(task.agentName) || await this.spawnAgent(task.agentName);
            const response = await agent.think(task.prompt, task.profileId || 'coder');
            return { id: task.id, response };
        });

        const results = await Promise.all(promises);
        return results.reduce((acc, curr) => {
            acc[curr.id] = curr.response;
            return acc;
        }, {} as Record<string, string>);
    }

    getAgent(name: string): AgentService | undefined {
        return this.agents.get(name);
    }
}
