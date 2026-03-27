# BACKEND.md - Arquitetura de API e Serviços

Este documento configura as diretrizes de backend e infraestrutura.

## 🏗️ Arquitetura
- **Methodology:** The 12-Factor App Compliance.
- **Design Pattern:** Arquitetura Hexagonal (Portas e Adaptadores).
- **Runtime:** Node.js (Stateless).

## 🗄️ Dados e Persistência
- **Database:** SQLite (Local) via Knex.
- **Migrations:** Controle rigoroso de versão do banco de dados.
- **Connection Pooling:** Gerenciamento eficiente de pools para evitar EADDRINUSE.
- **Security:** Prepared Statements contra SQL Injection.

## ⚙️ Processamento e Workers
- **Assincronismo:** Uso de Filas/Workers para tarefas pesadas (download de modelos, envios complexos).
- **Caching:** Redis/SQLite para cache de respostas e sessões frequentes.
- **Error Handling:** Recuperação automática (Circuit Breaker) para APIs externas.

## 📊 Observabilidade
- **Logs:** Formato JSON estruturado via `stdout`.
- **Correlation IDs:** Para rastreabilidade de requisições.
- **Monitoring:** Healthcheck endpoints em `/api/health`.