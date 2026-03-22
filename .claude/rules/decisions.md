# Decisões Arquiteturais

## Formato

Data | Decisão | Raciocínio | Consequências futuras

---

## 2025 — Decisões do PRD v1

**Classificação derivada, não persistida**
- Decisão: A classificação será sempre recalculada a partir das partidas finalizadas,
em vez de ser armazenada como entidade com estado próprio.
- Raciocínio: elimina risco de inconsistência entre resultados e classificação.
- Consequência: recálculo ocorre a cada registro ou alteração de resultado —
performance deve ser monitorada conforme volume de partidas cresce.

**Camada de dados em memória na v1**
- Decisão: O projeto inicia sem banco de dados. O estado será mantido em memória.
- Raciocínio: reduz fricção no início do desenvolvimento; permite validar o modelo de domínio
antes de comprometer com um banco de dados específico.
- Consequência: a camada de acesso a dados deve ser isolada desde o início para que
a migração para um banco de dados não exija reescrita das regras de negócio.

## 2026-03-20 — Migração para Vercel Postgres

**Store em memória substituído por Vercel Postgres**
- Decisão: Migrar `globalThis.__store` para `@vercel/postgres` com SQL direto (sem ORM).
- Raciocínio: O modelo serverless da Vercel reinicializa `globalThis` entre invocações Lambda,
  causando perda de dados criados pelo usuário. Postgres resolve a persistência.
- Consequência: Todas as funções do store agora são `async`. Pages usam `force-dynamic`.
  O pacote `@vercel/postgres` está deprecated em favor de `@neondatabase/serverless` —
  migração futura pode ser necessária.

**IDs mantidos como string na interface**
- Decisão: IDs no banco são `SERIAL` (integer), mas a interface TypeScript mantém `string`.
  A conversão é feita no store via `String(id)`.
- Raciocínio: Evita mudanças em cascata nos Client Components que recebem IDs como props.
- Consequência: O store converte `Number(id)` ao fazer queries e `String(id)` ao retornar.

---

## 2026-03-22 — Copa Mata-Mata

**Bracket via `posicao_chave` na tabela `partidas`**
- Decisão: Reutilizar a tabela `partidas` com uma coluna `posicao_chave` (posição no bracket) em vez de criar tabela separada de confrontos.
- Raciocínio: Menor impacto no schema existente. A progressão do bracket é derivada dos resultados (princípio do projeto). Winners de posições 2k-1 e 2k alimentam posição k da rodada seguinte.
- Consequência: Byes não geram partida (time avança direto). A geração de rodadas seguintes é automática após todas as partidas da rodada atual serem finalizadas.

**Pênaltis como colunas na partida (não entidade separada)**
- Decisão: `penaltis_mandante` e `penaltis_visitante` como colunas INTEGER nullable em `partidas`.
- Raciocínio: Simplicidade. Só preenchidos quando placar empata em mata-mata. Para liga são sempre NULL.
- Consequência: O vencedor é determinado por: gols (se diferentes) ou pênaltis (se gols iguais).

**Single-leg primeiro, ida-e-volta depois**
- Decisão: Copa mata-mata v1 é apenas jogo de ida (single-leg).
- Raciocínio: Ida e volta exigiria vincular pares de partidas, placar agregado e regras de desempate adicionais. Complexidade desproporcional para o MVP.
- Consequência: Futuro suporte a ida-e-volta pode exigir coluna `confronto_id` para vincular partidas.

---

## 2026-03-22 — Copa Grupos + Mata-Mata

**Divisão exata de times em grupos obrigatória**
- Decisão: O wizard exige que `totalTimes % timesPorGrupo === 0`. Apenas divisores válidos são oferecidos como opção.
- Raciocínio: Grupos desiguais complicam regras de classificação (times com mais jogos teriam vantagem/desvantagem). Exigir divisão exata simplifica comparações entre grupos.
- Consequência: Limita combinações possíveis, mas garante equidade.

**Melhores restantes para complementar bracket**
- Decisão: Quando `classificadosPorGrupo × numGrupos < bracketSlots`, a aplicação seleciona os N melhores entre os não-classificados de todos os grupos, usando critério padrão (pontos → vitórias → saldo → gols pró).
- Raciocínio: Permite brackets maiores sem forçar mais classificados diretos por grupo. Padrão em copas reais (ex: melhores terceiros na Euro/Copa do Mundo).
- Consequência: Requer que o usuário aceite explicitamente o complemento no wizard.

**Rodada offset para copa_grupos**
- Decisão: Partidas de grupo usam rodadas 1..N e partidas eliminatórias usam rodadas N+1..N+M. Funções de bracket calculam `rodadaOffset` a partir da menor rodada com `posicao_chave IS NOT NULL`.
- Raciocínio: Evita criar coluna separada para "fase" — a rodada numérica codifica a ordem temporal. O offset permite reusar toda a lógica de mata-mata sem mudanças.
- Consequência: Labels de rodada precisam considerar se é grupo ou eliminatória (implementado em `getRodadaLabel`).

**Turno/returno configurável na fase de grupos**
- Decisão: Usuário escolhe se a fase de grupos é turno único ou turno+returno. `gerarPartidasRoundRobin` recebeu parâmetro `turnoRetorno` (default `true` para backward compatibility com liga).
- Raciocínio: Grupos pequenos (3 times) com turno único têm apenas 3 partidas, aceitável. Grupos maiores podem precisar de mais jogos.
- Consequência: Total de rodadas e partidas varia conforme escolha.

_Registrar aqui decisões técnicas tomadas durante o desenvolvimento,
não apenas decisões do produto._