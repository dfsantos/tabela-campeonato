import type { Campeonato, ClassificacaoItem, Partida, Time } from './fake-data'
import { campeonatos as seedCampeonatos, partidas as seedPartidas, times as seedTimes } from './fake-data'

interface Participante {
  campeonatoId: string
  timeId: string
}

function derivarParticipantes(partidas: Partida[]): Participante[] {
  const seen = new Set<string>()
  const result: Participante[] = []
  for (const p of partidas) {
    for (const timeId of [p.mandante.id, p.visitante.id]) {
      const key = `${p.campeonatoId}:${timeId}`
      if (!seen.has(key)) {
        seen.add(key)
        result.push({ campeonatoId: p.campeonatoId, timeId })
      }
    }
  }
  return result
}

const campeonatos: Campeonato[] = [...seedCampeonatos]
const times: Time[] = [...seedTimes]
let partidas: Partida[] = [...seedPartidas]
let participantes: Participante[] = derivarParticipantes(seedPartidas)
let nextId = 100

export function getCampeonatos(): Campeonato[] {
  return campeonatos
}

export function getCampeonato(id: string): Campeonato | undefined {
  return campeonatos.find((c) => c.id === id)
}

export function getTimes(): Time[] {
  return times
}

export function getPartidas(campeonatoId: string): Partida[] {
  return partidas.filter((p) => p.campeonatoId === campeonatoId)
}

export function getPartida(id: string): Partida | undefined {
  return partidas.find((p) => p.id === id)
}

export function addPartida(
  campeonatoId: string,
  rodada: number,
  mandanteId: string,
  visitanteId: string,
  data: string,
): Partida {
  const mandante = times.find((t) => t.id === mandanteId)!
  const visitante = times.find((t) => t.id === visitanteId)!
  const id = String(nextId++)
  const partida: Partida = { id, campeonatoId, rodada, mandante, visitante, data, status: 'agendada' }
  partidas = [...partidas, partida]

  for (const timeId of [mandanteId, visitanteId]) {
    if (!participantes.some((p) => p.campeonatoId === campeonatoId && p.timeId === timeId)) {
      participantes = [...participantes, { campeonatoId, timeId }]
    }
  }

  return partida
}

export function registrarResultado(
  partidaId: string,
  golsMandante: number,
  golsVisitante: number,
): Partida {
  partidas = partidas.map((p) =>
    p.id === partidaId ? { ...p, golsMandante, golsVisitante, status: 'finalizada' } : p,
  )
  return partidas.find((p) => p.id === partidaId)!
}

export function calcularClassificacao(campeonatoId: string): ClassificacaoItem[] {
  const finalizadas = partidas.filter(
    (p) => p.campeonatoId === campeonatoId && p.status === 'finalizada',
  )

  type Stats = {
    time: Time
    pontos: number
    jogos: number
    vitorias: number
    empates: number
    derrotas: number
    golsPro: number
    golsContra: number
  }

  const statsMap = new Map<string, Stats>()

  for (const part of participantes.filter((p) => p.campeonatoId === campeonatoId)) {
    const time = times.find((t) => t.id === part.timeId)!
    statsMap.set(part.timeId, {
      time,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
    })
  }

  for (const p of finalizadas) {
    const gm = p.golsMandante!
    const gv = p.golsVisitante!

    const m = statsMap.get(p.mandante.id) ?? {
      time: p.mandante,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
    }
    const v = statsMap.get(p.visitante.id) ?? {
      time: p.visitante,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
    }

    m.jogos++
    m.golsPro += gm
    m.golsContra += gv

    v.jogos++
    v.golsPro += gv
    v.golsContra += gm

    if (gm > gv) {
      m.vitorias++
      m.pontos += 3
      v.derrotas++
    } else if (gm === gv) {
      m.empates++
      m.pontos += 1
      v.empates++
      v.pontos += 1
    } else {
      v.vitorias++
      v.pontos += 3
      m.derrotas++
    }

    statsMap.set(p.mandante.id, m)
    statsMap.set(p.visitante.id, v)
  }

  return [...statsMap.values()]
    .sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos
      if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias
      const saldoA = a.golsPro - a.golsContra
      const saldoB = b.golsPro - b.golsContra
      if (saldoB !== saldoA) return saldoB - saldoA
      return b.golsPro - a.golsPro
    })
    .map((s, i) => ({
      posicao: i + 1,
      time: s.time,
      pontos: s.pontos,
      jogos: s.jogos,
      vitorias: s.vitorias,
      empates: s.empates,
      derrotas: s.derrotas,
      golsPro: s.golsPro,
      golsContra: s.golsContra,
      saldoGols: s.golsPro - s.golsContra,
    }))
}
