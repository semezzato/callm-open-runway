# caLLM / Open Runway - Tabela de Comandos

Esta tabela lista todos os comandos disponíveis na CLI do caLLM, seus aliases (atalhos) e aplicações práticas.

| Comando | Alias | Descrição | Aplicação Prática |
| :--- | :--- | :--- | :--- |
| `callm` | - | Inicia o Fluxo de Boas-Vindas | Ponto de entrada interativo com menu e Trust Check. |
| `callm gita` | `gi` | Check-up e Inicialização | Prepara a pasta `.callm` e audita o projeto atual. |
| `callm chat` | - | Dashboard Interativo | Chat de alta performance com suporte a ferramentas. |
| `callm local [alias]` | - | Inferência Local (GGUF) | Chat privado usando modelos locais sem internet. |
| `callm gemini [prompt]` | - | Prompt Google Gemini | Interação direta com a API do Gemini Pro. |
| `callm install hf <repo>` | `i` | Download Hugging Face | Baixa modelos GGUF diretamente do HF para a pasta `/models`. |
| `callm web` | - | Web App (Vite) | Inicia a interface gráfica no navegador (Porta 5050). |
| `callm run` | `r` | Desktop App | Inicia a versão nativa (Tauri) do caLLM. |
| `callm server` | `s` | caLLM API Server | Sobe o servidor core para integração com outros apps. |
| `callm config` | `c` | Configurações | Gestão de API Keys (Gemini, Claude) e preferências. |
| `callm update` | `up` | Atualização | Atualiza modelos locais ou o core da aplicação. |
| `callm uninstall` | `u` | Desinstalação | Remove modelos ou ferramentas instaladas. |
| `callm backup` | `b` | Backup | Salva suas configurações e modelos instalados. |
| `callm restore` | `res` | Restauração | Recupera dados de backups anteriores. |

---

### Exemplos de Uso Rápidos:

- **Iniciar do zero:** `callm`
- **Diagnóstico do projeto:** `callm gita`
- **Baixar um modelo:** `callm install hf TheBloke/Llama-2-7B-Chat-GGUF`
- **Chat local:** `callm local llama-2`
- **Pergunta rápida via Nuvem:** `callm gemini "Como fazer um loop em TS?"`
