# Progresso do Projeto

## Status atual

MVP funcional com persistência em Vercel Postgres. Registro de partidas, registro de resultados (formulário e inline) e cálculo dinâmico de classificação estão operacionais. Design system implementado (paleta emerald, tipografia Space Grotesk/Inter/Manrope). Navegação com sidebar contextual e layout responsivo.

## Pendente antes de iniciar implementação

- [x] Definir stack técnica — Next.js + TypeScript, dados em memória na v1
- [x] Definir estrutura de diretórios do projeto
- [x] Definir organização interna de app/ (rotas, componentes, camada de dados)
- [x] Definir banco de dados e ORM — Vercel Postgres, SQL direto via pacote `postgres` (sem ORM)
- [ ] Definir convenções de nomenclatura (arquivos, funções, variáveis)

## Concluído

### Telas de navegação com dados falsos (feat/navigation-screens)
- Tela 1: lista de campeonatos
- Tela 2: detalhe com abas Classificação e Partidas
- Tela 3: formulários de nova partida e registro de resultado (desabilitados)

### Lógica funcional das telas
- `lib/fake-data.ts` — seed puro (types + arrays exportados) _(renomeado para `lib/types.ts` na migração)_
- `lib/store.ts` — store em memória: queries, mutations (`addPartida`, `registrarResultado`), `calcularClassificacao`
- `lib/actions.ts` — Server Actions: `registrarPartidaAction`, `registrarResultadoAction`
- `app/page.tsx` — usa `getCampeonatos()` do store
- `app/campeonatos/[id]/page.tsx` — usa `calcularClassificacao()` do store _(refatorado para redirect na etapa de sub-rotas)_
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

### Geração automática de tabela (turno e returno)
- `lib/store.ts` — `gerarPartidasRoundRobin` (interno, método círculo): gera N*(N-1) partidas para N times
- `lib/store.ts` — `addCampeonato` aceita `gerarPartidas?: boolean`; quando `true`, chama `gerarPartidasRoundRobin` e registra as partidas via `addPartida`
- `lib/actions.ts` — `criarCampeonatoAction` lê `gerarPartidas` do formData
- `app/campeonatos/novo/novo-campeonato-form.tsx` — checkbox "Gerar tabela automaticamente" + texto informativo com contagem de partidas e rodadas

### Migração de store em memória para Vercel Postgres
- `lib/fake-data.ts` renomeado para `lib/types.ts` — apenas types exportados
- `lib/db/schema.sql` — DDL das tabelas (times, campeonatos, participantes, partidas)
- `lib/db/index.ts` — conexão Postgres via pacote `postgres` (v3.4.8)
- `lib/db/seed.ts` — script executável que cria tabelas e insere dados seed (`npm run db:seed`)
- `lib/store.ts` — reescrito: todas as funções agora são `async` e usam SQL via pacote `postgres`
- `lib/actions.ts` — adicionado `await` nas chamadas ao store
- Todas as pages com queries ao store agora usam `await` + `export const dynamic = 'force-dynamic'`
- Todos os imports de `@/lib/fake-data` atualizados para `@/lib/types`
- IDs mantidos como `string` na interface (convertidos via `String(id)` no store)

### Refatoração para sub-rotas com sidebar contextual
- `app/campeonatos/[id]/page.tsx` — redireciona para `/classificacao`
- `app/campeonatos/[id]/layout.tsx` — layout com breadcrumbs e header do campeonato
- `app/campeonatos/[id]/classificacao/page.tsx` — tabela de classificação com zonas
- `app/campeonatos/[id]/partidas/page.tsx` + `partidas-content.tsx` — lista de partidas com inputs inline
- `app/sidebar.tsx` — sidebar com navegação contextual (desktop + hamburger mobile)
- `app/api/campeonatos/[id]/route.ts` — API para nome do campeonato (usado pela sidebar)

### Inputs inline de placar
- `app/campeonatos/[id]/partidas/partidas-content.tsx` — Client Component com campos de gol inline para registro direto
- `lib/actions.ts` — `registrarResultadoInlineAction` retorna JSON em vez de redirect

### Sistema de zonas de classificação
- `lib/zonas.ts` — lógica de validação e estilização de zonas (campeão, elite, 2º pelotão, rebaixamento)
- `lib/types.ts` — type `Zonas` adicionado
- `lib/store.ts` — `addCampeonato` aceita `zonas` (armazenado como JSONB no banco)
- Visualização na tabela de classificação com cores por zona

### Exclusão de campeonato
- `lib/actions.ts` — `excluirCampeonatoAction` com cascade delete
- `lib/store.ts` — `deleteCampeonato(id)`

### Design system implementado
- `app/globals.css` — paleta emerald, tipografia (Space Grotesk, Inter, Manrope), variáveis CSS, tema Tailwind v4
- Layout responsivo com sidebar (desktop) e hamburger menu (mobile)
- Tonal layering para elevação (sem borders de 1px), gradient buttons

### Formato Copa Mata-Mata (eliminatórias)
- `lib/db/schema.sql` — novas colunas: `posicao_chave`, `penaltis_mandante`, `penaltis_visitante` em `partidas`; `copa_config` JSONB em `campeonatos`
- `lib/types.ts` — interfaces `CopaConfig`, `ChaveamentoRodada`, `ChaveamentoConfronto`; campos `posicaoChave`, `penaltisMandante`, `penaltisVisitante` em `Partida`; `copaConfig` em `Campeonato`
- `lib/mata-mata.ts` — **novo**: helpers puros (`proximaPotenciaDe2`, `totalRodadasFromSlots`, `nomeFase`, `shuffleArray`, `calcularByeSlots`, `getVencedor`, `gerarLabelsFases`)
- `lib/store.ts` — novas funções: `gerarPartidasMataMata`, `gerarProximaRodadaMataMata`, `registrarResultadoMataMata`, `getChaveamento`; `addCampeonato` adaptado para copa; `mapPartidaRow`, `getPartidas`, `getPartida`, `getCampeonato(s)` incluem novas colunas
- `lib/actions.ts` — `criarCampeonatoAction` aceita `copa_mata_mata`; `registrarResultadoInlineAction` e `registrarResultadoAction` suportam pênaltis
- `app/campeonatos/novo/wizard/step-formato.tsx` — copa_mata_mata habilitado (removido "Em breve")
- `app/campeonatos/novo/wizard/step-participantes.tsx` — info contextual: byes, fases, chaveamento
- `app/campeonatos/novo/wizard/step-resumo.tsx` — resumo com estrutura do bracket para copa
- `app/campeonatos/novo/novo-campeonato-form.tsx` — `canSubmit` e `canAdvanceFromStep` permitem copa_mata_mata
- `app/campeonatos/[id]/page.tsx` — redirect condicional: liga→classificacao, copa→chaveamento
- `app/campeonatos/[id]/chaveamento/page.tsx` — **novo**: Server Component para visualização do bracket
- `app/campeonatos/[id]/chaveamento/bracket-view.tsx` — **novo**: Client Component com bracket horizontal, inputs inline, pênaltis, indicador de campeão
- `app/campeonatos/[id]/partidas/page.tsx` — passa formato e totalRodadas para o content
- `app/campeonatos/[id]/partidas/partidas-content.tsx` — nomes de fase para mata-mata, indicador de pênaltis
- `app/sidebar.tsx` — menu condicional: "Chaveamento" para copa, "Classificação" para liga
- `app/api/campeonatos/[id]/route.ts` — retorna `formato` na resposta

### Formato Copa Grupos + Mata-Mata
- `lib/db/schema.sql` — ADD COLUMN `grupo INTEGER` em `participantes` e `partidas`
- `lib/types.ts` — interfaces `GruposConfig`, `GrupoInfo`; campo `grupo?` em `Partida`; `gruposConfig?` em `CopaConfig`
- `lib/grupos.ts` — **novo**: helpers puros (`nomeGrupo`, `distribuirTimesEmGrupos`, `divisoresValidosParaGrupo`, `calcularInfoBracket`, `selecionarMelhoresRestantes`, `totalPartidasGrupos`, `totalRodadasGrupos`, `labelPosicaoComplemento`)
- `lib/store.ts` — `mapPartidaRow` inclui grupo; `gerarPartidasRoundRobin` com parâmetro `turnoRetorno`; `addCampeonato` suporta `copa_grupos` com distribuição aleatória de grupos; novas funções: `getTimesPorGrupo`, `gerarPartidasGrupos`, `getGruposInfo`, `verificarFaseGruposConcluida`, `gerarMataMataAposGrupos`, `seedBracket`; `calcularClassificacao` com filtro por grupo; `getChaveamento` e `gerarProximaRodadaMataMata` com rodadaOffset para copa_grupos
- `lib/actions.ts` — `criarCampeonatoAction` aceita `copa_grupos` com parsing de GruposConfig; `registrarResultadoAction/InlineAction` detectam grupo vs eliminatória e disparam geração automática do bracket
- `app/campeonatos/novo/wizard/step-formato.tsx` — `copa_grupos` habilitado (removido "Em breve")
- `app/campeonatos/novo/wizard/step-grupos.tsx` — **novo**: step de configuração de grupos (times/grupo, classificados, turno/returno, info bracket, alerta complemento)
- `app/campeonatos/novo/novo-campeonato-form.tsx` — estados e actions para grupos; `canAdvanceFromStep` com validação; hidden inputs para grupo config
- `app/campeonatos/novo/wizard/step-participantes.tsx` — info contextual para copa_grupos
- `app/campeonatos/novo/wizard/step-resumo.tsx` — resumo com estrutura de grupos e bracket
- `app/campeonatos/[id]/grupos/page.tsx` — **novo**: mini-tabelas de classificação por grupo com destaque nos classificados
- `app/campeonatos/[id]/page.tsx` — redirect `copa_grupos` → `/grupos`
- `app/campeonatos/[id]/chaveamento/page.tsx` — suporte a `copa_grupos`; mensagem "aguardando fase de grupos"
- `app/campeonatos/[id]/partidas/partidas-content.tsx` — labels contextuais (grupo + fase eliminatória), badge de grupo por partida
- `app/sidebar.tsx` — nav condicional: Grupos + Chaveamento + Partidas para `copa_grupos`

## Em andamento

### Pendente: migration do banco
- As novas colunas precisam ser criadas no Vercel Postgres (ALTER TABLE). O schema.sql já está atualizado. Executar quando houver acesso ao banco.
