## [2026-03-26] - Dynamic Skill Engine & Project Sovereignty
- **Problem**: Complexity in adding new tools without modifying the core.
- **Solution**: Implemented `loadFromDirectory` in `SkillLoader`. The caLLM now scans `.callm/skills` for external JS/TS plugins.
- **Infrastructure**: Fixed `tsconfig.json` path mapping and rootDir restrictions to allow seamless integration between `@callm/core` and `@callm/browser`.
- **Status**: Core, Server, and Web UI are fully synced and ready for Tauri distribution.

---

> "Architecture is about the decisions you wish you could get right the first time." - Based on Akitaonrails philosophy.

## 🇧🇷 Português (PT-BR)

### 🧩 Decisões de Arquitetura (Architecture Decisions)
1.  **Monorepo Estruturado**: Isolamento total entre `apps/` e `packages/`. O Core não conhece a UI, a UI apenas consome a API. Isso evita o "Efeito Frankenstein" e permite que o sistema seja portado para Mobile/Tauri sem reescrever lógica.
2.  **Stateless API**: O `apps/server` foi desenhado para ser stateless. Sessões são persistidas no SQLite via `SessionService`, permitindo reinicializações sem perda de contexto.
3.  **Engine Agnóstica**: O `LlmService` foi abstraído para suportar múltiplos provedores (Gemini/Claude/Ollama), seguindo o princípio de *Backing Services*.
4.  **Dynamic Skill Loading**: Implementação de um loader dinâmico no `SkillLoader` que utiliza imports assíncronos para carregar ferramentas em tempo de execução sem recompilar o Core.
5.  **Multi-Agent Context**: Orquestração de perfis (Architect/Coder/Security) através de `systemInstructions` injetadas dinamicamente na `LlmService`.

## 🧠 Camada Cognitiva (Neurônios e Sinapses)
- **Neurons**: Arquivos JSON persistentes em `/.callm/neurons/` que armazenam fatos e decisões.
- **Recall**: Mecanismo de busca semântica/texto que provê contexto de longo prazo aos agentes.
- **Synapses**: Futuras conexões ponderadas entre neurônios para descoberta de padrões.

## 🌐 Automação Browser (Visão)
- **Engine**: Playwright disparado via `BrowserSkill`.
- **Console**: Interface de streaming de ações no Web App para auditoria humana.

## 📋 Orquestração (Playbooks)
- **Recursos**: Receitas JSON sequenciais que unem Skills e Agentes.
- **Workflow**: `/.callm/workflows/` é o diretório de comando para automações em massa.

---
**Status do Projeto: v1.0.0-gold**
O sistema atingiu a soberania funcional. Todas as lógicas básicas e avançadas de orquestração estão ativas.

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
