import chalk from 'chalk';
import readline from 'readline';
import { LlmService, LocalLlamaService } from '@callm/core';
import { renderHeader, renderSeparator, COLORS } from '../ui/DashboardUI.js';
import ora from 'ora';
import inquirer from 'inquirer';
import { gitaCommand } from './gita.js';
import { installHfCommand } from './install.js';
import fs from 'fs-extra';
import path from 'path';

export async function welcomeFlow() {
  console.clear();
  renderHeader('1.0.0');

  console.log(chalk.yellow('\n[Segurança] Este diretório é confiável?'));
  console.log(chalk.gray('caLLM Code poderá ler, editar e executar arquivos aqui.'));

  const { trust } = await (inquirer as any).prompt([
    {
      type: 'list',
      name: 'trust',
      message: 'Deseja prosseguir?',
      choices: [
        { name: 'Sim, eu confio nos autores e neste diretório', value: true },
        { name: 'Não, sair', value: false }
      ]
    }
  ]);

  if (!trust) {
    console.log(chalk.red('\nAção cancelada por segurança.'));
    process.exit(0);
  }

  await mainMenu();
}

export async function mainMenu() {
  const { action } = await (inquirer as any).prompt([
    {
      type: 'list',
      name: 'action',
      message: 'O que deseja fazer agora?',
      choices: [
        { name: '🚀 Iniciar Chat (Modo Interativo)', value: 'chat' },
        { name: '🛠️  Inicializar /.callm (Check-up do Projeto)', value: 'gita' },
        { name: '📥 Instalar Modelo Local (Hugging Face)', value: 'install' },
        { name: '⚙️  Configurar Chaves API', value: 'config' },
        { name: '❌ Sair', value: 'exit' }
      ]
    }
  ]);

  switch (action) {
    case 'chat':
      await chatCommand();
      break;
    case 'gita':
      await gitaCommand();
      console.log('\n');
      await mainMenu();
      break;
    case 'install':
      const { repo } = await (inquirer as any).prompt([{ name: 'repo', message: 'ID do repositório HF (ex: user/repo):' }]);
      if (repo) await installHfCommand(repo);
      await mainMenu();
      break;
    case 'config':
      const { key } = await (inquirer as any).prompt([
        {
          type: 'input',
          name: 'key',
          message: 'Digite sua GEMINI_API_KEY:',
          default: process.env.GEMINI_API_KEY
        }
      ]);
      if (key) {
        const dotCallmDir = path.join(process.cwd(), '.callm');
        await fs.ensureDir(dotCallmDir);
        const envPath = path.join(dotCallmDir, '.env');
        
        let envContent = '';
        if (await fs.pathExists(envPath)) {
            envContent = await fs.readFile(envPath, 'utf-8');
        }

        if (envContent.includes('GEMINI_API_KEY=')) {
            envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${key}`);
        } else {
            envContent += `\nGEMINI_API_KEY=${key}`;
        }

        await fs.writeFile(envPath, envContent.trim() + '\n');
        process.env.GEMINI_API_KEY = key;
        console.log(chalk.green('\nConfiguração salva com sucesso em .callm/.env'));
      }
      await mainMenu();
      break;
    case 'exit':
      process.exit(0);
      break;
    default:
      console.log(chalk.yellow('\nFuncionalidade em desenvolvimento.'));
      await mainMenu();
  }
}

export async function chatCommand(options: { local?: string } = {}) {
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
