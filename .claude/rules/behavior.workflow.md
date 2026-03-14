# Comportamento — Workflow

## Antes de implementar

Para tarefas com impacto arquitetural, propor a abordagem e aguardar aprovação
antes de escrever código. Impacto arquitetural inclui: alteração de schema,
novo padrão de projeto, mudança no fluxo crítico de recálculo de classificação.

## Durante a implementação

- Seguir as regras de domínio definidas em context.domain.md.
- Em caso de ambiguidade na instrução da tarefa, perguntar antes de assumir.
- Não introduzir dependências externas sem aprovação explícita.

## Lacunas de especificação

Quando a instrução da tarefa não cobre um detalhe:
1. Verificar se context.domain.md ou arch.structure.md resolve.
2. Se não resolver, perguntar antes de decidir autonomamente.

## Atualização de memória

Ao concluir uma tarefa, atualizar memory/progress.md com o que foi feito.
Se uma decisão técnica relevante foi tomada, registrar em memory/decisions.md
com: data, decisão, raciocínio e consequências futuras esperadas.
Não atualizar arch.structure.md ou arch.data.md autonomamente.
