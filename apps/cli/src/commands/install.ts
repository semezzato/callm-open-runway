import chalk from 'chalk';
import { HuggingFaceService } from '@callm/core';
import inquirer from 'inquirer';

export async function installHfCommand(repoId: string, filename?: string) {
  const hf = new HuggingFaceService();

  try {
    console.log(chalk.blue(`\n[caLLM] Buscando informações de ${repoId}...`));
    const info = await hf.getModelInfo(repoId);

    console.log(chalk.gray(`Autor: ${info.author}`));
    console.log(chalk.gray(`Downloads: ${info.downloads}`));
    console.log(chalk.gray(`Última Modificação: ${info.lastModified}`));

    let selectedFile = filename;

    if (!selectedFile) {
        // Listar arquivos para que o usuário escolha o GGUF correto (geralmente há vários)
        const files = await hf.listFiles(repoId);
        const ggufFiles = files.filter(f => f.endsWith('.gguf'));

        if (ggufFiles.length === 0) {
            console.log(chalk.yellow('\n⚠ Nenhum arquivo .gguf encontrado neste repositório. O caLLM foca em modelos GGUF para execução local leve.'));
            return;
        }

        const answers = await (inquirer as any).prompt([
            {
                type: 'list',
                name: 'selectedFile',
                message: 'Qual arquivo de modelo (GGUF) deseja baixar?',
                choices: ggufFiles
            }
        ]);
        selectedFile = answers.selectedFile;
    }

    if (!selectedFile) {
        throw new Error('Nenhum arquivo selecionado para download.');
    }

    console.log(chalk.cyan(`\nIniciando download de ${selectedFile}...`));
    
    const filePath = await hf.downloadFile(repoId, selectedFile, (percent) => {
      // Simples barra de progresso textual
      process.stdout.write(`\rProgresso: [${'#'.repeat(Math.floor(percent / 5))}${'-'.repeat(20 - Math.floor(percent / 5))}] ${percent}%`);
    });

    console.log(chalk.green('\n\n✔ Download concluído com sucesso!'));
    console.log(chalk.gray(`Local: ${filePath}`));

    // Futuro: Registrar alias no banco de dados
    console.log(chalk.yellow('\n[caLLM] Sugestão: Você pode apelidar este modelo nas configurações para usá-lo com "callm <alias>".'));

  } catch (error: any) {
    console.error(chalk.red('\nErro na instalação:'), error.message);
  }
}
