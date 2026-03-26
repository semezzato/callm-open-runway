import { Command } from 'commander';
import chalk from 'chalk';
import { gitaCommand } from '../commands/gita';
import { geminiCommand } from '../commands/gemini';

const program = new Command();

program
  .name('callm')
  .description('caLLM / Open Runway - Universal LLM Orchestrator')
  .version('1.0.0');

// Comando: callm gita
program
  .command('gita')
  .alias('gi')
  .description('Inicia o diretório .callm e faz um check-up do projeto')
  .action(async () => {
    await gitaCommand();
  });

// Comandos de LLM
program
  .command('gemini')
  .description('Interage com o modelo Gemini (Modo Interativo)')
  .argument('[prompt]', 'O prompt para o modelo')
  .action(async (prompt) => {
    await geminiCommand(prompt);
  });

const otherLlms = ['claude', 'ollama', 'local'];
otherLlms.forEach(llm => {
  program
    .command(llm)
    .description(`Interage com o modelo ${llm}`)
    .argument('[prompt]', 'O prompt para o modelo')
    .action((prompt) => {
      console.log(chalk.yellow(`\n[caLLM] Conectando ao ${llm}...`));
      if (prompt) {
        console.log(chalk.gray(`Prompt: ${prompt}`));
        console.log(chalk.blue('\nResposta (Simulada):'));
        console.log(`Olá! Eu sou o componente ${llm} do caLLM. Em breve estarei integrado via API!`);
      } else {
        console.log(chalk.cyan(`Modo interativo com ${llm} iniciado (Simulação).`));
      }
    });
});

// Comandos de Apps e Server
program
  .command('run')
  .alias('r')
  .description('Abre o app de desktop')
  .action(() => console.log(chalk.green('Iniciando Desktop App...')));

program
  .command('web')
  .alias('w')
  .description('Abre o app web')
  .action(() => console.log(chalk.green('Iniciando Web App...')));

program
  .command('server')
  .alias('s')
  .description('Abre o servidor caLLM API')
  .action(() => {
    console.log(chalk.blue('Iniciando Servidor caLLM API...'));
    const { spawn } = require('child_process');
    const server = spawn('npm', ['run', 'dev', '-w', 'apps/server'], { 
      stdio: 'inherit',
      shell: true 
    });
    
    server.on('close', (code: number) => {
      console.log(chalk.yellow(`Servidor encerrado com código ${code}`));
    });
  });

// Comandos de Gerenciamento
const managementCmds = [
  { name: 'install', alias: 'i', desc: 'Instala modelos ou ferramentas' },
  { name: 'uninstall', alias: 'u', desc: 'Desinstala modelos ou ferramentas' },
  { name: 'update', alias: 'up', desc: 'Atualiza modelos ou ferramentas' },
  { name: 'upgrade', alias: 'upg', desc: 'Upgrade de modelos ou ferramentas' },
  { name: 'downgrade', alias: 'dow', desc: 'Downgrade de modelos ou ferramentas' },
  { name: 'rollback', alias: 'r', desc: 'Rollback de modelos ou ferramentas' },
  { name: 'backup', alias: 'b', desc: 'Faz backup de modelos ou configurações' },
  { name: 'restore', alias: 'res', desc: 'Restaura modelos ou configurações' },
  { name: 'config', alias: 'c', desc: 'Configurações do caLLM' }
];

managementCmds.forEach(cmd => {
  program
    .command(cmd.name)
    .alias(cmd.alias)
    .description(cmd.desc)
    .argument('[target]', 'O alvo da ação (ex: qwen3.1:8b)')
    .action((target) => {
      console.log(chalk.magenta(`\n[caLLM] Executando ${cmd.name} para ${target || 'alvo padrão'}...`));
      console.log(chalk.gray(`Processo ${cmd.name} iniciado (Simulação). Concluiremos em breve.`));
    });
});

// Comandos de ajuda e fallback
program.on('--help', () => {
  console.log('');
  console.log('Exemplos:');
  console.log(`  $ ${chalk.cyan('callm gita')}`);
  console.log(`  $ ${chalk.cyan('callm run')}`);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
