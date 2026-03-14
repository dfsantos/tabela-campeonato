# Arquitetura — Dados

## Consistência (regra crítica)

A classificação deve ser **sempre derivada dos resultados das partidas**.
Nunca armazenar classificação como estado definitivo independente dos resultados.
Nunca permitir divergência entre resultados registrados e estatísticas da classificação.

## Performance esperada

O recálculo da classificação deve ocorrer em menos de 1 segundo para:
- até 40 times por campeonato
- até 780 partidas por campeonato

Não otimizar prematuramente além desse limite — estamos em fase MVP.

## Regras sobre alterações de dados

- Alterar o resultado de uma partida já finalizada deve disparar novo recálculo da classificação.
- Não implementar soft delete ou versionamento de resultados na v1.

## Migrations

Não executar migrations automaticamente sem revisão explícita.
Toda alteração de schema deve ser aprovada antes da implementação.
