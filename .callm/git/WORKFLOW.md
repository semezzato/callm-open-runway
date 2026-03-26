# Workflow caLLM: CT/CI/CD Standard

Este documento define o processo padrão de **Continuous Testing (CT)**, **Continuous Integration (CI)** e **Continuous Deployment (CD)** para o ecossistema caLLM.

## 🎯 Objetivo
Garantir que todas as alterações no código sejam validadas por agentes automatizados antes de chegarem ao usuário final, seguindo os preceitos de **Anti-Vibecoding**.

## 🛠️ O Ciclo CT (Continuous Testing)
No caLLM, o teste não é apenas unitário; é orquestrado:
1. **Agent Review**: O agente `Security Officer` analisa o diff via Playbook.
2. **Unit Tests**: Execução de Vitest em cada workspace (`npm test`).
3. **Integration**: O `BrowserSkill` valida se a UI continua respondendo corretamente.

## 🚀 Pipeline de Integração (CI)
O arquivo `.github/workflows/callm-ci.yml` automatiza:
- Instalação e cache de dependências.
- Verificação de Lint corporativo.
- Build progressivo dos pacotes Core e Browser.
- Auditoria de segurança de dependências.

## 📦 Deployment (CD)
- **Modo Local**: Utilização do comando `callm server` para sincronização imediata.
- **Desktop**: Preparação dos binários Tauri via GitHub Actions (Em breve).

---
*Assinado: Arquiteto caLLM*
