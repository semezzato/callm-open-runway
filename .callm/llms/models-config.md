# models-config.md - Configuração de Orquestração de LLMs

Hardware Acceleration e Roteamento para caLLM.

## 🏎️ Local LLMs (GGUF/Ollama)
- **GPU Offloading:** 32 camadas por padrão para GPUs NVIDIA.
- **Threads:** 8 threads para processamento paralelo.
- **Auto-Unload:** 10 minutos de inatividade para liberar VRAM.

## 🌐 Remote LLMs
- **Gemini 1.5 Pro:** Prioridade para análise profunda de código e Gita Inspect.
- **Claude 3.5 Sonnet:** Prioridade para refatoração e escrita criativa técnica.
- **GPT-4o:** Backup para tarefas gerais de lógica.

## 💰 Economia
- Ativar Context Caching sempre que disponível.
- Preferir modelos "Flash" para tarefas de resumo e limpeza de higiene.
