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

export interface Zonas {
  campeao?: boolean
  elite?: number
  segundoPelotao?: number
  rebaixamento?: number
}

export interface Pais {
  id: string
  nome: string
  codigo: string | null
  bandeira: string | null
}

export interface Campeonato {
  id: string
  nome: string
  temporada: string
  status: CampeonatoStatus
  zonas?: Zonas
}
