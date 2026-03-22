export type CampeonatoStatus = 'planejado' | 'em_andamento' | 'finalizado'
export type CampeonatoFormato = 'liga' | 'copa_grupos' | 'copa_mata_mata'
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
  posicaoChave?: number
  penaltisMandante?: number
  penaltisVisitante?: number
  grupo?: number
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

export interface GruposConfig {
  numGrupos: number
  timesPorGrupo: number
  classificadosPorGrupo: number
  melhoresRestantes: number
  turnoRetorno: boolean
}

export interface CopaConfig {
  totalRodadas: number
  totalSlots: number
  gruposConfig?: GruposConfig
}

export interface Campeonato {
  id: string
  nome: string
  temporada: string
  status: CampeonatoStatus
  formato: CampeonatoFormato
  zonas?: Zonas
  copaConfig?: CopaConfig
}

export interface GrupoInfo {
  numero: number
  nome: string
  times: Time[]
  classificacao: ClassificacaoItem[]
}

export interface ChaveamentoConfronto {
  posicao: number
  partida?: Partida
  mandanteLabel?: string
  visitanteLabel?: string
  isBye?: boolean
}

export interface ChaveamentoRodada {
  rodada: number
  nomeFase: string
  confrontos: ChaveamentoConfronto[]
}
