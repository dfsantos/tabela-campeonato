# Arquitetura — Estrutura

## Telas do sistema

**Tela 1 — Lista de Campeonatos**
- Lista campeonatos com: nome, temporada, status
- Botão para criar campeonato

**Tela 2 — Detalhe do Campeonato**
- Aba Classificação: tabela de classificação
- Aba Partidas: lista por rodada
- Ações: registrar partida, registrar resultado

**Tela 3 — Registro de Resultado**
- Formulário: gols mandante / gols visitante
- Ao salvar: recalcula classificação e retorna à tela do campeonato

## Fluxo crítico

Registro de resultado → recálculo da classificação → retorno ao detalhe do campeonato.
Esse fluxo não deve ter etapas intermediárias adicionais.

## Decisões estruturais

- Múltiplos campeonatos simultâneos são suportados desde a v1.
