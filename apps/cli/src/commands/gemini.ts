import path from 'path';
import { LlmService } from '@callm/core/src/services/LlmService';
import { SessionService } from '@callm/core/src/services/SessionService';
import { startRepl } from '../repl';
import chalk from 'chalk';

export async function geminiCommand(prompt?: string) {
  // Configuração rápida (No futuro virá do callm config)
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error(chalk.red('\nErro: GEMINI_API_KEY não configurada.'));
    console.log(chalk.gray('Use: export GEMINI_API_KEY=sua_chave'));
    return;
  }

  const dbPath = path.join(process.cwd(), '.callm', 'sessions.sqlite');
  const sessionService = new SessionService(dbPath);
  await sessionService.init();

  const llmService = new LlmService({ apiKey });
  const sessionId = 'default-session'; // Futuramente dinâmico

  if (prompt) {
    // Modo prompt único
    console.log(chalk.yellow(`\n[caLLM] Enviando prompt para Gemini...`));
    try {
      const response = await llmService.sendMessage(prompt);
      console.log(chalk.blue('\nResposta:'));
      console.log(response);
      await sessionService.addMessage({ session_id: sessionId, role: 'user', content: prompt });
      await sessionService.addMessage({ session_id: sessionId, role: 'model', content: response });
    } catch (error) {
      console.error(chalk.red('Erro:'), error);
    }
    process.exit(0);
  } else {
    // Modo interativo
    await startRepl(llmService, sessionService, sessionId);
  }
}
