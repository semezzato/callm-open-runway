# MAKITA.md - caLLM / Open Runway (Elite Engineering Log)

> "Architecture is about the decisions you wish you could get right the first time." - Based on Akitaonrails philosophy.

## 🇧🇷 Português (PT-BR)

### 🧩 Decisões de Arquitetura (Architecture Decisions)
1.  **Monorepo Estruturado**: Isolamento total entre `apps/` e `packages/`. O Core não conhece a UI, a UI apenas consome a API. Isso evita o "Efeito Frankenstein" e permite que o sistema seja portado para Mobile/Tauri sem reescrever lógica.
2.  **Stateless API**: O `apps/server` foi desenhado para ser stateless. Sessões são persistidas no SQLite via `SessionService`, permitindo reinicializações sem perda de contexto.
3.  **Engine Agnóstica**: O `LlmService` foi abstraído para suportar múltiplos provedores (Gemini/Claude/Ollama), seguindo o princípio de *Backing Services*.

### 🚧 Hurdles (Obstáculos Vencidos)
- **Desafio de Navegação**: Sincronizar o background fixo (Aurora/Shaders) com a mudança de rotas no React. Solução: Implementação do `MainLayout` com `Outlet` do React Router para manter o canvas WebGL persistente.
- **Sincronismo CLI-Server**: Garantir que o comando `callm server` disparasse o processo de forma não bloqueante e com logs espelhados. Solução: Uso de `child_process.spawn` com `stdio: inherit`.

### 🧪 Estado do TDD (Test-Driven Development)
- **Ratio de Teste**: ~1.3x (Meta: 1.5x). 
- **Cobertura**: Focada em `SessionService` e `BrowserService`. Próximo passo: Testes de integração na camada de API.

---

## 🇺🇸 English (EN-US)

### 🧩 Architecture Decisions
1.  **Structured Monorepo**: Total isolation between `apps/` and `packages/`. Core is UI-agnostic; UI only consumes the API. This prevents the "Frankenstein Effect" and ensures portability to Mobile/Tauri.
2.  **Stateless API**: `apps/server` is designed to be stateless. Sessions are persisted in SQLite via `SessionService`, allowing restarts without context loss.
3.  **Agnostic Engine**: `LlmService` is abstracted to support multiple providers (Gemini/Claude/Ollama), following the *Backing Services* principle.

### 🚧 Hurdles (Technical Obstacles)
- **Navigation Challenge**: Syncing the fixed background (Aurora/Shaders) with React route changes. Solution: Implemented `MainLayout` with React Router's `Outlet` to keep the WebGL canvas persistent.
- **CLI-Server Sync**: Ensuring `callm server` triggers the process non-blockingly with mirrored logs. Solution: Used `child_process.spawn` with `stdio: inherit`.

### 🧪 TDD Status (Test-Driven Development)
- **Test Ratio**: ~1.3x (Target: 1.5x). 
- **Coverage**: Focused on `SessionService` and `BrowserService`. Next: Integration tests in the API layer.

---

**Current ENV Vars Required:**
- `GEMINI_API_KEY`: Required for LlmService.
- `PORT`: Default 3001 for API Server.

**ZEN.md Protocol Active | Anti-Vibecoding Enabled**
