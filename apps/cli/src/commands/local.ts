import { Command } from "commander";
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import { LocalLlamaService } from "@callm/core";
import chalk from "chalk";

export function localCommand(program: Command) {
    program
        .command("local")
        .description("Inicia uma sessão de chat com uma LLM local (GGUF)")
        .argument("[alias]", "Apelido do modelo ou caminho do arquivo GGUF")
        .action(async (alias) => {
            console.log(chalk.cyan("Iniciando motor de inferência local..."));
            
            const modelsDir = path.join(process.cwd(), "models");
            if (!await fs.pathExists(modelsDir)) {
                await fs.ensureDir(modelsDir);
            }

            const files = await fs.readdir(modelsDir);
            const ggufFiles = files.filter(f => f.endsWith(".gguf"));

            if (ggufFiles.length === 0 && !alias) {
                console.log(chalk.yellow("Nenhum modelo GGUF encontrado na pasta /models."));
                console.log(chalk.gray("Dica: Use 'callm install hf <repo>' para baixar um modelo primeiro."));
                return;
            }

            let modelPath = "";
            if (alias) {
                modelPath = path.isAbsolute(alias) ? alias : path.join(modelsDir, alias.endsWith(".gguf") ? alias : `${alias}.gguf`);
            } else {
                const { selectedModel } = await inquirer.prompt([{
                    type: "list",
                    name: "selectedModel",
                    message: "Escolha o modelo local para carregar:",
                    choices: ggufFiles
                }]);
                modelPath = path.join(modelsDir, selectedModel);
            }

            if (!await fs.pathExists(modelPath)) {
                console.error(chalk.red(`Modelo não encontrado: ${modelPath}`));
                return;
            }

            const service = new LocalLlamaService({ modelPath });

            console.log(chalk.green(`\nCarregando modelo: ${path.basename(modelPath)}...`));
            
            // Loop de chat persistente
            const chatLoop = async () => {
                const { userInput } = await inquirer.prompt([{
                    type: "input",
                    name: "userInput",
                    message: chalk.blue("Você:"),
                }]);

                if (userInput.toLowerCase() === "sair" || userInput.toLowerCase() === "exit") {
                    console.log(chalk.yellow("Encerrando motor local."));
                    process.exit(0);
                }

                process.stdout.write(chalk.magenta("caLLM: "));
                try {
                    for await (const chunk of service.sendMessageStream(userInput)) {
                        process.stdout.write(chunk);
                    }
                } catch (error: any) {
                    console.error(chalk.red(`\nErro na inferência: ${error.message}`));
                }
                
                console.log("\n");
                chatLoop();
            };

            await chatLoop();
        });
}
