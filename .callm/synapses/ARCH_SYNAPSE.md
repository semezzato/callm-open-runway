# ARCH_SYNAPSE.md - Sinapse de Coerência Arquitetural

Conexão entre a estrutura de pastas e os princípios ZEN.

## 🔗 Conexão
Liga o diretório `packages/core` com a diretriz de **Arquitetura Hexagonal** definida em `ZEN.md`.

## ⚡ Efeito
Sempre que o núcleo do sistema for alterado, esta sinapse dispara um alerta de "Dependência de Domínio", forçando a IA a validar se as regras de negócio permanecem isoladas de adaptadores externos (banco de dados, API).
