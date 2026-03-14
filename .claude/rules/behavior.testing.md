# Comportamento — Testes

## Prioridade de cobertura

O fluxo de recálculo de classificação é o núcleo do sistema e deve ter cobertura
de testes prioritária. Qualquer alteração nesse fluxo exige testes antes de concluir a tarefa.

## O que testar obrigatoriamente

- Recálculo de classificação após registro de resultado
- Recálculo de classificação após alteração de resultado já registrado
- Ordenação da classificação: pontos → vitórias → saldo de gols → gols pró
- Regras de participação: mínimo de 2 times, time não duplicado no mesmo campeonato

## O que não priorizar em testes na v1

- Telas e navegação (sem testes e2e obrigatórios no MVP)
- Performance além do limite definido em arch.data.md

## Observação

Stack de testes a definir junto com as convenções técnicas do projeto.
