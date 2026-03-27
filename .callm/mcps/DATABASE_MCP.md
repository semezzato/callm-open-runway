# DATABASE_MCP.md - Integração de Dados via MCP

Configuração de acesso direto ao banco de dados para a IA.

## 🎯 Objetivo
Permitir que o caLLM inspecione schemas e execute queries de diagnóstico sem intervenção manual.

## 🛠️ Configuração
- **Server:** `@modelcontextprotocol/server-sqlite`
- **Path:** `apps/server/database.sqlite`

## 🛡️ Segurança
- Apenas operações de `SELECT` e `PRAGMA` permitidas para diagnóstico.
- Proibido `DROP` ou `TRUNCATE` via MCP sem aprovação explícita.
