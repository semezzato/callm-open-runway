import readline from 'readline';
import chalk from 'chalk';
import { LlmService } from '@callm/core/src/services/LlmService';
import { SessionService } from '@callm/core/src/services/SessionService';

export async function startRepl(llm: LlmService, session: SessionService, sessionId: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.blue('caLLM > ')
  });

  console.log(chalk.cyan(`\n--- Sessão Iniciada: ${sessionId} ---`));
  console.log(chalk.gray('Digite sua mensagem ou "sair" para encerrar.\n'));

  // Carregar histórico
  const history = await session.getSessionHistory(sessionId);
  if (history.length > 0) {
    console.log(chalk.gray(`[Histórico: ${history.length} mensagens carregadas]`));
  }

  rl.prompt();

  rl.on('line', async (line) => {
    const prompt = line.trim();
    if (prompt.toLowerCase() === 'sair' || prompt.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    if (!prompt) {
      rl.prompt();
      return;
    }

    try {
      // Adicionar mensagem do usuário ao banco
      await session.addMessage({ session_id: sessionId, role: 'user', content: prompt });

      // Pegar histórico para contexto
      const currentHistory = await session.getSessionHistory(sessionId);

      process.stdout.write(chalk.magenta('\ncaLLM: '));
      
      let fullResponse = '';
      for await (const chunk of llm.sendMessageStream(prompt, currentHistory)) {
        process.stdout.write(chunk);
        fullResponse += chunk;
      }
      process.stdout.write('\n\n');

      // Adicionar resposta do modelo ao banco
      await session.addMessage({ session_id: sessionId, role: 'model', content: fullResponse });

    } catch (error) {
      console.error(chalk.red('\nErro ao processar mensagem:'), error);
    }

    rl.prompt();
  }).on('close', () => {
    console.log(chalk.yellow('\nSessão encerrada. Até logo!'));
    process.exit(0);
  });
}
