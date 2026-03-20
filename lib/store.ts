import { sql } from './db'
import type { Campeonato, ClassificacaoItem, Partida, Time, Zonas } from './types'

export async function getCampeonatos(): Promise<Campeonato[]> {
  const { rows } = await sql`SELECT id, nome, temporada, status, zonas FROM campeonatos ORDER BY id`
  return rows.map((r) => ({
    id: String(r.id),
    nome: r.nome,
    temporada: r.temporada,
    status: r.status,
    ...(r.zonas ? { zonas: r.zonas as Zonas } : {}),
  }))
}

export async function getCampeonato(id: string): Promise<Campeonato | undefined> {
  const { rows } = await sql`SELECT id, nome, temporada, status, zonas FROM campeonatos WHERE id = ${Number(id)}`
  if (rows.length === 0) return undefined
  const r = rows[0]
  return {
    id: String(r.id),
    nome: r.nome,
    temporada: r.temporada,
    status: r.status,
    ...(r.zonas ? { zonas: r.zonas as Zonas } : {}),
  }
}

export async function getTimes(): Promise<Time[]> {
  const { rows } = await sql`SELECT id, nome, cidade FROM times ORDER BY nome`
  return rows.map((r) => ({
    id: String(r.id),
    nome: r.nome,
    ...(r.cidade ? { cidade: r.cidade } : {}),
  }))
}

export async function getTimesDoCampeonato(campeonatoId: string): Promise<Time[]> {
  const { rows } = await sql`
    SELECT t.id, t.nome, t.cidade
    FROM participantes p
    JOIN times t ON t.id = p.time_id
    WHERE p.campeonato_id = ${Number(campeonatoId)}
    ORDER BY t.nome
  `
  return rows.map((r) => ({
    id: String(r.id),
    nome: r.nome,
    ...(r.cidade ? { cidade: r.cidade } : {}),
  }))
}

export async function getPartidas(campeonatoId: string): Promise<Partida[]> {
  const { rows } = await sql`
    SELECT
      p.id, p.campeonato_id, p.rodada, p.data, p.gols_mandante, p.gols_visitante, p.status,
      m.id AS m_id, m.nome AS m_nome, m.cidade AS m_cidade,
      v.id AS v_id, v.nome AS v_nome, v.cidade AS v_cidade
    FROM partidas p
    JOIN times m ON m.id = p.mandante_id
    JOIN times v ON v.id = p.visitante_id
    WHERE p.campeonato_id = ${Number(campeonatoId)}
    ORDER BY p.rodada, p.id
  `
  return rows.map(mapPartidaRow)
}

export async function getPartida(id: string): Promise<Partida | undefined> {
  const { rows } = await sql`
    SELECT
      p.id, p.campeonato_id, p.rodada, p.data, p.gols_mandante, p.gols_visitante, p.status,
      m.id AS m_id, m.nome AS m_nome, m.cidade AS m_cidade,
      v.id AS v_id, v.nome AS v_nome, v.cidade AS v_cidade
    FROM partidas p
    JOIN times m ON m.id = p.mandante_id
    JOIN times v ON v.id = p.visitante_id
    WHERE p.id = ${Number(id)}
  `
  if (rows.length === 0) return undefined
  return mapPartidaRow(rows[0])
}

function mapPartidaRow(r: Record<string, unknown>): Partida {
  return {
    id: String(r.id),
    campeonatoId: String(r.campeonato_id),
    rodada: r.rodada as number,
    mandante: {
      id: String(r.m_id),
      nome: r.m_nome as string,
      ...(r.m_cidade ? { cidade: r.m_cidade as string } : {}),
    },
    visitante: {
      id: String(r.v_id),
      nome: r.v_nome as string,
      ...(r.v_cidade ? { cidade: r.v_cidade as string } : {}),
    },
    data: (r.data as string) ?? '',
    ...(r.gols_mandante != null ? { golsMandante: r.gols_mandante as number } : {}),
    ...(r.gols_visitante != null ? { golsVisitante: r.gols_visitante as number } : {}),
    status: r.status as Partida['status'],
  }
}

export async function addTime(nome: string, cidade?: string): Promise<Time> {
  const { rows } = await sql`
    INSERT INTO times (nome, cidade) VALUES (${nome}, ${cidade ?? null})
    RETURNING id, nome, cidade
  `
  const r = rows[0]
  return {
    id: String(r.id),
    nome: r.nome,
    ...(r.cidade ? { cidade: r.cidade } : {}),
  }
}

function gerarPartidasRoundRobin(
  timeIds: string[],
): Array<{ rodada: number; mandanteId: string; visitanteId: string }> {
  const ids = [...timeIds]
  if (ids.length % 2 === 1) ids.push('bye')

  const n = ids.length
  const rounds = n - 1
  const matchesPerRound = n / 2
  const result: Array<{ rodada: number; mandanteId: string; visitanteId: string }> = []

  for (let r = 0; r < rounds; r++) {
    for (let m = 0; m < matchesPerRound; m++) {
      const home = ids[m]
      const away = ids[n - 1 - m]
      if (home !== 'bye' && away !== 'bye') {
        result.push({ rodada: r + 1, mandanteId: home, visitanteId: away })
      }
    }
    ids.splice(1, 0, ids.pop()!)
  }

  const firstTurn = [...result]
  for (const p of firstTurn) {
    result.push({ rodada: p.rodada + rounds, mandanteId: p.visitanteId, visitanteId: p.mandanteId })
  }

  return result
}

export async function addCampeonato(
  nome: string,
  temporada: string,
  timeIds: string[],
  gerarPartidas?: boolean,
  zonas?: Zonas,
): Promise<Campeonato> {
  const zonasJson = zonas ? JSON.stringify(zonas) : null

  const { rows } = await sql`
    INSERT INTO campeonatos (nome, temporada, status, zonas)
    VALUES (${nome}, ${temporada}, 'planejado', ${zonasJson}::jsonb)
    RETURNING id, nome, temporada, status, zonas
  `
  const campeonato: Campeonato = {
    id: String(rows[0].id),
    nome: rows[0].nome,
    temporada: rows[0].temporada,
    status: rows[0].status,
    ...(rows[0].zonas ? { zonas: rows[0].zonas as Zonas } : {}),
  }

  for (const timeId of timeIds) {
    await sql`INSERT INTO participantes (campeonato_id, time_id) VALUES (${Number(campeonato.id)}, ${Number(timeId)})`
  }

  if (gerarPartidas) {
    const partidas = gerarPartidasRoundRobin(timeIds)
    for (const p of partidas) {
      await sql`
        INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status)
        VALUES (${Number(campeonato.id)}, ${p.rodada}, ${Number(p.mandanteId)}, ${Number(p.visitanteId)}, '', 'agendada')
      `
    }
  }

  return campeonato
}

export async function addPartida(
  campeonatoId: string,
  rodada: number,
  mandanteId: string,
  visitanteId: string,
  data: string,
): Promise<Partida> {
  const { rows } = await sql`
    INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status)
    VALUES (${Number(campeonatoId)}, ${rodada}, ${Number(mandanteId)}, ${Number(visitanteId)}, ${data}, 'agendada')
    RETURNING id
  `

  // Ensure both teams are participants
  for (const timeId of [mandanteId, visitanteId]) {
    await sql`
      INSERT INTO participantes (campeonato_id, time_id)
      VALUES (${Number(campeonatoId)}, ${Number(timeId)})
      ON CONFLICT DO NOTHING
    `
  }

  const partida = await getPartida(String(rows[0].id))
  return partida!
}

export async function registrarResultado(
  partidaId: string,
  golsMandante: number,
  golsVisitante: number,
): Promise<Partida> {
  await sql`
    UPDATE partidas
    SET gols_mandante = ${golsMandante}, gols_visitante = ${golsVisitante}, status = 'finalizada'
    WHERE id = ${Number(partidaId)}
  `
  const partida = await getPartida(partidaId)
  return partida!
}

export async function deleteCampeonato(id: string): Promise<void> {
  await sql`DELETE FROM campeonatos WHERE id = ${Number(id)}`
}

export async function calcularClassificacao(campeonatoId: string): Promise<ClassificacaoItem[]> {
  const times = await getTimesDoCampeonato(campeonatoId)
  const partidas = await getPartidas(campeonatoId)
  const finalizadas = partidas.filter((p) => p.status === 'finalizada')

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

  for (const time of times) {
    statsMap.set(time.id, {
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
