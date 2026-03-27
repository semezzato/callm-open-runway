# FRONTEND.md - Engenharia de UI/UX Elite

Este documento configura as diretrizes visuais e técnicas da interface do caLLM.

## 🎨 Design System: Aurora
- **Estética:** Glassmorphism, Dark Mode, Neon Accents.
- **Micro-interações:** Framer Motion para animações suaves e micro-feedbacks.
- **Tipografia:** Fira Code (Hacker Style) e Inter (Sans-serif funcional).

## 🛠️ Stack Técnica
- **Framework:** React + Vite.
- **Estimização:** Vanilla CSS + Tailwind (quando requisitado explicitamente).
- **Desktop Wrapper:** Tauri (Rust) para performance nativa.

## ⚡ Performance & UX
- **Throttling & Debouncing:** Obrigatórios em campos de busca e scrolls.
- **Lazy Loading:** Carregamento dinâmico de componentes pesados.
- **SEO:** H1 único por página, Meta Tags descritivas e IDs únicos para testes E2E.

## 🛡️ Segurança de Borda
- **Sanitização de Input:** Proteção XSS (Cross-Site Scripting).
- **CSP (Content Security Policy):** Diretrizes rígidas para fontes e scripts externos.
- **CSRF Tokens:** Implementação em todos os formulários e chamadas de API.