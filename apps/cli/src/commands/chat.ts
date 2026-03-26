import chalk from 'chalk';
import readline from 'readline';
import { LlmService, LocalLlamaService } from '@callm/core';
import { renderHeader, renderSeparator, COLORS } from '../ui/DashboardUI.js';
import ora from 'ora';

export async function chatCommand(options: { local?: string } = {}) {
  // Limpar tela para o modo Dashboard
  console.clear();
  renderHeader('1.0.0');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.hex(COLORS.primary)('\ncaLLM ❯ ')
  });

  // Inicializar serviço de LLM
  let llm: any;
  if (options.local) {
    llm = new LocalLlamaService({ modelPath: options.local });
    console.log(chalk.gray(`[Modo Local] Usando modelo: ${options.local}`));
  } else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error(chalk.red('\nErro: GEMINI_API_KEY não configurada no ambiente.'));
      process.exit(1);
    }
    llm = new LlmService({ apiKey });
    console.log(chalk.gray('[Modo Remoto] Usando Gemini Pro via API'));
  }

  renderSeparator('Chat Ativo');

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log(chalk.yellow('\nEncerrando sessão caLLM. Até logo!'));
      process.exit(0);
    }

    if (input.startsWith('/')) {
        handleInternalCommand(input);
        rl.prompt();
        return;
    }

    const spinner = ora(chalk.cyan('Pensando...')).start();

    try {
      let fullResponse = '';
      spinner.stop();
      process.stdout.write(chalk.bold.hex(COLORS.success)('\ncaLLM Response:\n'));

      const stream = llm.sendMessageStream(input);
      for await (const chunk of stream) {
        process.stdout.write(chunk);
        fullResponse += chunk;
      }
      
      console.log('\n');
      renderSeparator();
    } catch (error: any) {
      spinner.fail(chalk.red('Erro: ' + error.message));
    }

    rl.prompt();
  });
}

function handleInternalCommand(cmd: string) {
    const command = cmd.substring(1).toLowerCase();
    switch (command) {
        case 'help':
            console.log(chalk.blue('\nComandos internos:'));
            console.log(' /help - Mostra esta ajuda');
            console.log(' /clear - Limpa a tela');
            console.log(' /exit - Encerra o chat\n');
            break;
        case 'clear':
            console.clear();
            renderHeader('1.0.0');
            break;
        default:
            console.log(chalk.yellow(`\nComando interno "/${command}" não reconhecido.`));
    }
}
