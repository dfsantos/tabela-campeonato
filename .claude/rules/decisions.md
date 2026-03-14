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

---

_Registrar aqui decisões técnicas tomadas durante o desenvolvimento,
não apenas decisões do produto._