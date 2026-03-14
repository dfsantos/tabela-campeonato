export type CampeonatoStatus = 'planejado' | 'em_andamento' | 'finalizado'
export type PartidaStatus = 'agendada' | 'finalizada'

export interface Time {
  id: string
  nome: string
  cidade?: string
}

export interface Partida {
  id: string
  campeonatoId: string
  rodada: number
  mandante: Time
  visitante: Time
  data: string
  golsMandante?: number
  golsVisitante?: number
  status: PartidaStatus
}

export interface ClassificacaoItem {
  posicao: number
  time: Time
  pontos: number
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  golsPro: number
  golsContra: number
  saldoGols: number
}

export interface Campeonato {
  id: string
  nome: string
  temporada: string
  status: CampeonatoStatus
}

export const times: Time[] = [
  { id: 't1', nome: 'Atlético Palmital', cidade: 'Palmital' },
  { id: 't2', nome: 'União Esportiva', cidade: 'São Paulo' },
  { id: 't3', nome: 'EC Esperança', cidade: 'Campinas' },
  { id: 't4', nome: 'Recreativo Novo Mundo', cidade: 'Sorocaba' },
  { id: 't5', nome: 'Grêmio Amigos', cidade: 'Santos' },
  { id: 't6', nome: 'AD Central', cidade: 'Guarulhos' },
  { id: 't7', nome: 'Sporting Club', cidade: 'Osasco' },
  { id: 't8', nome: 'Bola de Ouro FC', cidade: 'São Bernardo' },
]

export const campeonatos: Campeonato[] = [
  { id: 'c1', nome: 'Campeonato Municipal', temporada: '2025', status: 'em_andamento' },
  { id: 'c2', nome: 'Copa da Amizade', temporada: '2025', status: 'planejado' },
  { id: 'c3', nome: 'Torneio de Verão', temporada: '2024', status: 'finalizado' },
]

export const partidas: Partida[] = [
  // Rodada 1 — finalizada
  { id: 'p1', campeonatoId: 'c1', rodada: 1, mandante: times[0], visitante: times[1], data: '2025-03-01', golsMandante: 2, golsVisitante: 1, status: 'finalizada' },
  { id: 'p2', campeonatoId: 'c1', rodada: 1, mandante: times[2], visitante: times[3], data: '2025-03-01', golsMandante: 0, golsVisitante: 0, status: 'finalizada' },
  { id: 'p3', campeonatoId: 'c1', rodada: 1, mandante: times[4], visitante: times[5], data: '2025-03-02', golsMandante: 3, golsVisitante: 1, status: 'finalizada' },
  { id: 'p4', campeonatoId: 'c1', rodada: 1, mandante: times[6], visitante: times[7], data: '2025-03-02', golsMandante: 1, golsVisitante: 2, status: 'finalizada' },
  // Rodada 2 — finalizada
  { id: 'p5', campeonatoId: 'c1', rodada: 2, mandante: times[1], visitante: times[2], data: '2025-03-08', golsMandante: 1, golsVisitante: 1, status: 'finalizada' },
  { id: 'p6', campeonatoId: 'c1', rodada: 2, mandante: times[3], visitante: times[4], data: '2025-03-08', golsMandante: 0, golsVisitante: 2, status: 'finalizada' },
  { id: 'p7', campeonatoId: 'c1', rodada: 2, mandante: times[5], visitante: times[6], data: '2025-03-09', golsMandante: 1, golsVisitante: 0, status: 'finalizada' },
  { id: 'p8', campeonatoId: 'c1', rodada: 2, mandante: times[7], visitante: times[0], data: '2025-03-09', golsMandante: 0, golsVisitante: 1, status: 'finalizada' },
  // Rodada 3 — agendada
  { id: 'p9', campeonatoId: 'c1', rodada: 3, mandante: times[0], visitante: times[2], data: '2025-03-15', status: 'agendada' },
  { id: 'p10', campeonatoId: 'c1', rodada: 3, mandante: times[1], visitante: times[3], data: '2025-03-15', status: 'agendada' },
  { id: 'p11', campeonatoId: 'c1', rodada: 3, mandante: times[4], visitante: times[6], data: '2025-03-16', status: 'agendada' },
  { id: 'p12', campeonatoId: 'c1', rodada: 3, mandante: times[5], visitante: times[7], data: '2025-03-16', status: 'agendada' },
]
