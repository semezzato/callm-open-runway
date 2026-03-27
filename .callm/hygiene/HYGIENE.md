# HYGIENE.md - Higiene do Contexto e Projeto

Protocolo de limpeza para manter o desenvolvimento desembaraçado e livre de ruído.

## 🧼 Limpeza de Contexto
- **Session Cleanup:** Descarregar modelos inativos após 10 minutos (Auto-Unload).
- **Context Pruning:** Remover blocos de código redundantes e dados efêmeros da memória.
- **Anti-Hallucination:** Verificação periódica de referências de arquivos e variáveis.

## 🔨 Manutenção de Código
- **Refactoring Contínuo:** Princípio do Escoteiro (deixe o código mais limpo do que encontrou).
- **Dependency Audit:** Auditoria semanal de pacotes vulneráveis via `npm audit`.
- **Project Structure:** Garantir que novos arquivos respeitem a separação `apps/` e `packages/`.

## 🧠 Estagnação e Alucinação
- Quando a IA apresentar comportamentos erráticos ("浪" ou chinês), aplicar Rollback imediato para o último commit estável.
- Limpar cache de build e diretórios `tmp`.