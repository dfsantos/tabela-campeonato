# Progresso do Projeto

## Status atual

Lógica funcional implementada. Registro de partidas, registro de resultados e cálculo dinâmico de classificação estão operacionais. Interface usa dados reais do store em memória.

## Pendente antes de iniciar implementação

- [x] Definir stack técnica — Next.js + TypeScript, dados em memória na v1
- [x] Definir estrutura de diretórios do projeto
- [x] Definir organização interna de app/ (rotas, componentes, camada de dados)
- [ ] Definir banco de dados e ORM (quando sair da camada em memória)
- [ ] Definir convenções de nomenclatura (arquivos, funções, variáveis)

## Concluído

### Telas de navegação com dados falsos (feat/navigation-screens)
- Tela 1: lista de campeonatos
- Tela 2: detalhe com abas Classificação e Partidas
- Tela 3: formulários de nova partida e registro de resultado (desabilitados)

### Lógica funcional das telas
- `lib/fake-data.ts` — seed puro (types + arrays exportados)
- `lib/store.ts` — store em memória: queries, mutations (`addPartida`, `registrarResultado`), `calcularClassificacao`
- `lib/actions.ts` — Server Actions: `registrarPartidaAction`, `registrarResultadoAction`
- `app/page.tsx` — usa `getCampeonatos()` do store
- `app/campeonatos/[id]/page.tsx` — usa `calcularClassificacao()` do store
- `app/campeonatos/[id]/resultado/[partidaId]/page.tsx` — convertido para Server Component com form action
- `app/campeonatos/[id]/partidas/nova/page.tsx` + `nova-partida-form.tsx` — separado em Server + Client Component; botão habilitado

## Em andamento

_Nenhuma tarefa em andamento._
