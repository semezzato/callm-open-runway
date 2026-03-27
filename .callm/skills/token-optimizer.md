# token-optimizer.md - Habilidade de Otimização de Custo

Redutores de custo de API e aumento de eficiência de contexto.

## 🎯 Estratégias
- **Compressão de Contexto:** Resumir históricos de chat longos sem perder a essência.
- **Prompt Caching:** Identificar partes estáticas dos prompts para aproveitar o cache das APIs (Gemini/Claude).
- **Roteamento Inteligente:** Direcionar tarefas simples para modelos Flash/Haiku e tarefas complexas para modelos Pro/Opus.

## 📊 Métricas
- Token reduction ratio (objetivo: 90% via Códice).
- Latency minimization via hardware awareness.
