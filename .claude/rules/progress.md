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

### Criação de campeonato com times
- `lib/store.ts` — `addCampeonato(nome, temporada, timeIds)`: cria campeonato com status `planejado` e registra participantes
- `lib/actions.ts` — `criarCampeonatoAction`: valida campos, exige ≥2 times, redireciona para detalhe
- `app/campeonatos/novo/page.tsx` — convertido para Server Component, passa `getTimes()` para o form
- `app/campeonatos/novo/novo-campeonato-form.tsx` — Client Component com checkboxes, contador de times e validação no submit

### Cadastro de times
- `lib/store.ts` — `addTime(nome, cidade?)`: cria time e adiciona ao estado global
- `lib/actions.ts` — `criarTimeAction`: valida nome, chama `addTime`, redireciona para `/times`
- `app/times/page.tsx` — Server Component: lista todos os times com botão "Novo time" e link "← Campeonatos"
- `app/times/novo/page.tsx` — Server Component simples que renderiza o form
- `app/times/novo/novo-time-form.tsx` — Client Component: campos nome (obrigatório) e cidade (opcional), submit desabilitado sem nome
- `app/page.tsx` — botão "Times" adicionado ao cabeçalho da home, ao lado de "Novo campeonato"

## Em andamento

_Nenhuma tarefa em andamento._
