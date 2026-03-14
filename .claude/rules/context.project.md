# Contexto do Projeto

## O que é

Sistema web para gerenciar campeonatos de futebol no modelo de pontos corridos.
Permite registrar partidas e visualizar automaticamente a classificação dos times.

## Público-alvo

Organizadores de campeonatos amadadores: ligas locais, grupos de amigos, campeonatos escolares,
pequenos clubes. Não há autenticação de usuários na v1 — o sistema é de uso único por organizador.

## Fase atual

MVP (v1). Foco em funcionar corretamente, com simplicidade e consistência de dados.
Otimizações de performance só são relevantes dentro dos limites definidos em arch.data.md.

## O que é crítico preservar

- A classificação deve ser **sempre derivada dos resultados das partidas**, nunca armazenada
  como estado definitivo independente.
- Nunca deve existir divergência entre resultados registrados e estatísticas da classificação.
- Navegação deve exigir no máximo 3 interações para registrar um resultado.

## Fora do escopo na v1

Não implementar:
- geração automática de tabela (round-robin)
- autenticação de usuários
- estatísticas avançadas (artilharia, cartões)
- playoffs ou mata-mata
- múltiplos formatos de competição
- API pública
