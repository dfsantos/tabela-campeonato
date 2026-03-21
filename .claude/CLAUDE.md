# CLAUDE.md

Este arquivo provê orientação ao Claude Code para trabalhar neste repositório.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint (v9 flat config via eslint.config.mjs)
npx tsc --noEmit # Type-check without emitting files
```

## Rules

Toda a especificação do projeto está em `.claude/rules/`. Leia os arquivos relevantes antes de implementar:

| Arquivo                         | Conteúdo                                                           |
| ------------------------------- | ------------------------------------------------------------------ |
| `rules/context.project.md`      | O que é o sistema, público-alvo, fase atual, escopo da v1          |
| `rules/context.domain.md`       | Glossário, entidades e regras de negócio críticas                  |
| `rules/arch.structure.md`       | Telas do sistema e fluxo crítico de navegação                      |
| `rules/arch.data.md`            | Regras de consistência de dados e limites de performance           |
| `rules/behavior.workflow.md`    | Como propor e implementar tarefas; quando perguntar                |
| `rules/behavior.testing.md`     | O que testar obrigatoriamente (núcleo: recálculo de classificação) |
| `rules/behavior.conventions.md` | Convenções técnicas da stack (a preencher)                         |
| `rules/ui.design.md`           | Design system: paleta, tipografia, elevação, componentes e regras  |
| `rules/decisions.md`            | Decisões arquiteturais registradas com data e raciocínio           |
| `rules/progress.md`             | Status atual e tarefas pendentes                                   |

## Referência visual

A pasta `docs/stitch_design/` contém mockups HTML + screenshots das telas de referência: `classificacao/`, `dashboard/`, `tabela_de_jogos/`, `cadastro/`. Consulte antes de implementar mudanças visuais.

## Regra crítica de domínio

A classificação é **sempre derivada dos resultados das partidas** — nunca armazenada como estado definitivo. Registrar ou alterar um resultado dispara recálculo imediato. Nunca deixar classificação e resultados divergirem. Ver `rules/arch.data.md` e `rules/context.domain.md` para detalhes.

## Workflow

Antes de tarefas com impacto arquitetural (alteração de schema, novo padrão, mudança no fluxo de recálculo): propor abordagem e aguardar aprovação. Ao concluir uma tarefa, atualizar `rules/progress.md` e, se houver decisão técnica relevante, registrar em `rules/decisions.md`. Ver `rules/behavior.workflow.md`.
