# Domínio — Glossário e Regras de Negócio

## Entidades principais

**Campeonato**
Competição independente no formato de pontos corridos.
Possui: nome, temporada, status, lista de times participantes.
Status possíveis: `planejado`, `em_andamento`, `finalizado`.

**Time**
Equipe que pode participar de múltiplos campeonatos.
Dados: nome, cidade (opcional).

**Participante**
Relação entre um time e um campeonato específico.
Um time não pode participar duas vezes do mesmo campeonato.
Um campeonato deve ter no mínimo 2 times.

**Partida**
Confronto entre dois times participantes de um campeonato.
Dados: campeonato, rodada, time mandante, time visitante, data, gols mandante,
gols visitante, status.
Status possíveis: `agendada`, `finalizada`.

**Resultado**
Placar de uma partida finalizada. Registrar ou alterar um resultado
dispara o recálculo da classificação do campeonato.

**Classificação**
Tabela derivada de todas as partidas finalizadas de um campeonato.
Não é uma entidade persistida como estado definitivo.

## Regras de negócio críticas

- A classificação é **sempre recalculada** ao registrar ou alterar um resultado.
- O recálculo considera **apenas partidas com status `finalizada`**.
- A ordenação da classificação segue obrigatoriamente:
  1. pontos
  2. vitórias
  3. saldo de gols
  4. gols pró

## Colunas da tabela de classificação

posição, time, pontos, jogos, vitórias, empates, derrotas, gols pró, gols contra, saldo de gols.
