# git-flow.md - Fluxo de Trabalho Git Elite

Padronização de colaboração e versionamento.

## 🌿 Branches
- `main`: Estável, pronta para produção. Protegida contra push direto.
- `feat/*`: Novas funcionalidades.
- `fix/*`: Correções de bugs.
- `hotfix/*`: Correções críticas em produção.

## 📦 Commit Pattern
Seguir **Conventional Commits**:
- `feat:` (nova funcionalidade)
- `fix:` (correção)
- `docs:` (documentação)
- `refactor:` (refatoração sem mudar funcionalidade)
- `test:` (adição de testes)

## 🔄 Pull Requests
- Exige aprovação de 1 engenheiro senior.
- Sucesso obrigatório na pipeline de CI.
- Revisão de segurança incluída.
