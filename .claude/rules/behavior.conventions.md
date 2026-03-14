# Comportamento — Convenções

## Stack definida

- **Next.js 16** com App Router (`app/` directory)
- **React 19** com TypeScript (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/postcss` — sem `tailwind.config.*`; customizações de tema vão em `app/globals.css` com `@theme`
- Path alias `@/*` mapeia para a raiz do projeto
- Camada de dados: em memória na v1 — sem banco de dados ainda

## Camada de dados em memória

O estado da aplicação será mantido em memória enquanto o banco de dados não estiver definido.
Isolar toda a lógica de acesso a dados em uma camada dedicada (ex: `src/data/` ou similar),
de forma que a substituição por um banco de dados no futuro não exija reescrever regras de negócio.
Não acoplar lógica de domínio diretamente a estruturas de armazenamento.

## Convenções Next.js

Seguir as convenções do App Router:
- Server Components por padrão; Client Components apenas quando necessário
- Rotas de API em `app/api/`
- Não misturar padrões do Pages Router com App Router

## Estrutura de diretórios

```
tabela-campeonato/
├── app/                    # Next.js App Router — páginas e layouts
│   ├── layout.tsx          # Root layout (fonte Geist, metadados globais)
│   ├── page.tsx            # Home page
│   ├── globals.css         # Tailwind v4 + variáveis CSS (light/dark)
│   └── favicon.ico
├── public/                 # Assets estáticos servidos na raiz
├── .claude/                # Configuração do Claude Code
│   ├── CLAUDE.md
│   └── rules/              # Especificação do projeto (contexto, domínio, regras)
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs       # ESLint v9 flat config
├── tsconfig.json
└── package.json
```