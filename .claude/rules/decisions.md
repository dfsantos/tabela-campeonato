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

_Registrar aqui decisões técnicas tomadas durante o desenvolvimento,
não apenas decisões do produto._