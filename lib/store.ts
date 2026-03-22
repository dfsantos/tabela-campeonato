import { sql } from './db'
import type { Campeonato, CampeonatoFormato, ChaveamentoConfronto, ChaveamentoRodada, ClassificacaoItem, CopaConfig, Pais, Partida, Time, Zonas } from './types'
import { calcularByeSlots, getVencedor, nomeFase, proximaPotenciaDe2, shuffleArray, totalRodadasFromSlots } from './mata-mata'

function parseJsonb<T>(value: unknown): T | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') return JSON.parse(value) as T
  return value as T
}

export async function getCampeonatos(): Promise<Campeonato[]> {
  const rows = await sql`SELECT * FROM campeonatos ORDER BY id`
  return rows.map(mapCampeonatoRow)
}

export async function getCampeonato(id: string): Promise<Campeonato | undefined> {
  const rows = await sql`SELECT * FROM campeonatos WHERE id = ${Number(id)}`
  if (rows.length === 0) return undefined
  return mapCampeonatoRow(rows[0])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCampeonatoRow(r: Record<string, any>): Campeonato {
  const zonas = parseJsonb<Zonas>(r.zonas)
  const copaConfig = parseJsonb<CopaConfig>(r.copa_config)
  return {
    id: String(r.id),
    nome: r.nome as string,
    temporada: r.temporada as string,
    status: r.status as Campeonato['status'],
    formato: (r.formato as CampeonatoFormato) ?? 'liga',
    ...(zonas ? { zonas } : {}),
    ...(copaConfig ? { copaConfig } : {}),
  }
}

export async function getPaises(): Promise<Pais[]> {
  const rows = await sql`SELECT id, nome, codigo, bandeira FROM paises ORDER BY nome`
  return rows.map((r) => ({
    id: String(r.id),
    nome: r.nome as string,
    codigo: (r.codigo as string) ?? null,
    bandeira: (r.bandeira as string) ?? null,
  }))
}

export async function getPais(id: string): Promise<Pais | undefined> {
  const rows = await sql`SELECT id, nome, codigo, bandeira FROM paises WHERE id = ${Number(id)}`
  if (rows.length === 0) return undefined
  const r = rows[0]
  return {
    id: String(r.id),
    nome: r.nome as string,
    codigo: (r.codigo as string) ?? null,
    bandeira: (r.bandeira as string) ?? null,
  }
}

export async function getTimes(): Promise<Time[]> {
  const rows = await sql`SELECT id, nome, cidade FROM times ORDER BY nome`
  return rows.map((r) => ({
    id: String(r.id),
    nome: r.nome as string,
    ...(r.cidade ? { cidade: r.cidade as string } : {}),
  }))
}

export async function getTimesDoCampeonato(campeonatoId: string): Promise<Time[]> {
  const rows = await sql`
    SELECT t.id, t.nome, t.cidade
    FROM participantes p
    JOIN times t ON t.id = p.time_id
    WHERE p.campeonato_id = ${Number(campeonatoId)}
    ORDER BY t.nome
  `
  return rows.map((r) => ({
    id: String(r.id),
    nome: r.nome as string,
    ...(r.cidade ? { cidade: r.cidade as string } : {}),
  }))
}

export async function getPartidas(campeonatoId: string): Promise<Partida[]> {
  const rows = await sql`
    SELECT
      p.*,
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
  const rows = await sql`
    SELECT
      p.*,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPartidaRow(r: Record<string, any>): Partida {
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
    ...(r.posicao_chave != null ? { posicaoChave: r.posicao_chave as number } : {}),
    ...(r.penaltis_mandante != null ? { penaltisMandante: r.penaltis_mandante as number } : {}),
    ...(r.penaltis_visitante != null ? { penaltisVisitante: r.penaltis_visitante as number } : {}),
  }
}

export async function addTime(nome: string, cidade?: string): Promise<Time> {
  const rows = await sql`
    INSERT INTO times (nome, cidade) VALUES (${nome}, ${cidade ?? null})
    RETURNING id, nome, cidade
  `
  const r = rows[0]
  return {
    id: String(r.id),
    nome: r.nome as string,
    ...(r.cidade ? { cidade: r.cidade as string } : {}),
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
  formato?: CampeonatoFormato,
): Promise<Campeonato> {
  const fmt = formato ?? 'liga'

  // Calcular copa_config se mata-mata
  let copaConfig: CopaConfig | undefined
  if (fmt === 'copa_mata_mata') {
    const slots = proximaPotenciaDe2(timeIds.length)
    copaConfig = { totalRodadas: totalRodadasFromSlots(slots), totalSlots: slots }
  }

  let rows
  if (copaConfig) {
    rows = await sql`
      INSERT INTO campeonatos (nome, temporada, status, formato, zonas, copa_config)
      VALUES (${nome}, ${temporada}, 'planejado', ${fmt}, ${zonas ? sql.json(zonas as never) : null}, ${sql.json(copaConfig as never)})
      RETURNING *
    `
  } else {
    rows = await sql`
      INSERT INTO campeonatos (nome, temporada, status, formato, zonas)
      VALUES (${nome}, ${temporada}, 'planejado', ${fmt}, ${zonas ? sql.json(zonas as never) : null})
      RETURNING *
    `
  }
  const campeonato = mapCampeonatoRow(rows[0])

  for (const timeId of timeIds) {
    await sql`INSERT INTO participantes (campeonato_id, time_id) VALUES (${Number(campeonato.id)}, ${Number(timeId)})`
  }

  if (gerarPartidas) {
    if (fmt === 'copa_mata_mata') {
      await gerarPartidasMataMata(campeonato.id, timeIds)
    } else {
      const partidas = gerarPartidasRoundRobin(timeIds)
      for (const p of partidas) {
        await sql`
          INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status)
          VALUES (${Number(campeonato.id)}, ${p.rodada}, ${Number(p.mandanteId)}, ${Number(p.visitanteId)}, '', 'agendada')
        `
      }
    }
  }

  return campeonato
}

async function addPartida(
  campeonatoId: string,
  rodada: number,
  mandanteId: string,
  visitanteId: string,
  data: string,
): Promise<Partida> {
  const rows = await sql`
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

// ── Mata-mata ──────────────────────────────────────────────

async function gerarPartidasMataMata(campeonatoId: string, timeIds: string[]): Promise<void> {
  const shuffled = shuffleArray(timeIds)
  const slots = proximaPotenciaDe2(shuffled.length)
  const byeSlots = calcularByeSlots(shuffled.length, slots)
  const matchesRound1 = slots / 2

  // Distribuir times nas posições do bracket
  // Cada posição (1-indexed) tem mandante e visitante
  // Para posição P: mandante = slot 2P-1, visitante = slot 2P no array de slots
  // Slots com bye não geram partida
  let timeIdx = 0
  for (let pos = 1; pos <= matchesRound1; pos++) {
    if (byeSlots.has(pos)) {
      // Bye: o time avança direto, não cria partida
      // O time do bye ocupa a posição do mandante (será resolvido no getChaveamento)
      timeIdx++
      continue
    }

    const mandanteId = shuffled[timeIdx++]
    const visitanteId = shuffled[timeIdx++]

    await sql`
      INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status, posicao_chave)
      VALUES (${Number(campeonatoId)}, 1, ${Number(mandanteId)}, ${Number(visitanteId)}, '', 'agendada', ${pos})
    `
  }
}

export async function gerarProximaRodadaMataMata(campeonatoId: string): Promise<boolean> {
  const campeonato = await getCampeonato(campeonatoId)
  if (!campeonato?.copaConfig) return false

  const { totalRodadas, totalSlots } = campeonato.copaConfig
  const partidas = await getPartidas(campeonatoId)

  // Encontrar a rodada mais alta com partidas
  const rodadaAtual = partidas.reduce((max, p) => Math.max(max, p.rodada), 0)
  if (rodadaAtual === 0) return false
  if (rodadaAtual >= totalRodadas) return false

  // Verificar se todas as partidas da rodada atual estão finalizadas
  const partidasRodadaAtual = partidas.filter((p) => p.rodada === rodadaAtual)
  if (partidasRodadaAtual.some((p) => p.status !== 'finalizada')) return false

  // Determinar vencedores de cada posição da rodada atual
  const matchesRodadaAtual = totalSlots / Math.pow(2, rodadaAtual)

  // Mapear posição -> vencedor
  const vencedorPorPosicao = new Map<number, string>()

  // Processar partidas finalizadas da rodada atual
  for (const p of partidasRodadaAtual) {
    if (p.posicaoChave == null) continue
    const vencedorId = getVencedor(p)
    if (vencedorId) vencedorPorPosicao.set(p.posicaoChave, vencedorId)
  }

  // Processar byes (rodada 1): times que avançaram sem jogar
  if (rodadaAtual === 1) {
    const timesIds = await getTimeIdsDoCampeonato(campeonatoId)
    const shuffled = getByeTeams(timesIds, totalSlots, partidasRodadaAtual)
    for (const [pos, timeId] of shuffled) {
      vencedorPorPosicao.set(pos, timeId)
    }
  }

  // Gerar partidas da próxima rodada
  const proximaRodada = rodadaAtual + 1
  const matchesProximaRodada = matchesRodadaAtual / 2

  for (let pos = 1; pos <= matchesProximaRodada; pos++) {
    const pos1 = 2 * pos - 1
    const pos2 = 2 * pos
    const mandanteId = vencedorPorPosicao.get(pos1)
    const visitanteId = vencedorPorPosicao.get(pos2)

    if (!mandanteId || !visitanteId) continue

    await sql`
      INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status, posicao_chave)
      VALUES (${Number(campeonatoId)}, ${proximaRodada}, ${Number(mandanteId)}, ${Number(visitanteId)}, '', 'agendada', ${pos})
    `
  }

  return true
}

// Helper para obter IDs de times do campeonato
async function getTimeIdsDoCampeonato(campeonatoId: string): Promise<string[]> {
  const rows = await sql`
    SELECT time_id FROM participantes WHERE campeonato_id = ${Number(campeonatoId)} ORDER BY time_id
  `
  return rows.map((r) => String(r.time_id))
}

// Identifica times que tiveram bye na rodada 1
function getByeTeams(allTimeIds: string[], totalSlots: number, partidasRodada1: Partida[]): Map<number, string> {
  const timesQueJogaram = new Set<string>()
  for (const p of partidasRodada1) {
    timesQueJogaram.add(p.mandante.id)
    timesQueJogaram.add(p.visitante.id)
  }

  const timesComBye = allTimeIds.filter((id) => !timesQueJogaram.has(id))
  const matchesRound1 = totalSlots / 2
  const byeSlots = calcularByeSlots(allTimeIds.length, totalSlots)

  const result = new Map<number, string>()
  let byeIdx = 0
  for (let pos = 1; pos <= matchesRound1; pos++) {
    if (byeSlots.has(pos) && byeIdx < timesComBye.length) {
      result.set(pos, timesComBye[byeIdx++])
    }
  }
  return result
}

export async function registrarResultadoMataMata(
  partidaId: string,
  golsMandante: number,
  golsVisitante: number,
  penaltisMandante?: number,
  penaltisVisitante?: number,
): Promise<Partida> {
  // Se empate no tempo normal, pênaltis são obrigatórios
  if (golsMandante === golsVisitante) {
    if (penaltisMandante == null || penaltisVisitante == null) {
      throw new Error('Pênaltis são obrigatórios quando o placar é empatado')
    }
    if (penaltisMandante === penaltisVisitante) {
      throw new Error('Pênaltis não podem ser iguais')
    }
  }

  await sql`
    UPDATE partidas
    SET gols_mandante = ${golsMandante},
        gols_visitante = ${golsVisitante},
        penaltis_mandante = ${golsMandante === golsVisitante ? penaltisMandante! : null},
        penaltis_visitante = ${golsMandante === golsVisitante ? penaltisVisitante! : null},
        status = 'finalizada'
    WHERE id = ${Number(partidaId)}
  `

  const partida = await getPartida(partidaId)
  if (!partida) throw new Error('Partida não encontrada')

  // Tentar avançar o bracket
  await gerarProximaRodadaMataMata(partida.campeonatoId)

  return partida
}

export async function getChaveamento(campeonatoId: string): Promise<ChaveamentoRodada[]> {
  const campeonato = await getCampeonato(campeonatoId)
  if (!campeonato?.copaConfig) return []

  const { totalRodadas: numRodadas, totalSlots } = campeonato.copaConfig
  const partidas = await getPartidas(campeonatoId)
  const allTimeIds = await getTimeIdsDoCampeonato(campeonatoId)
  const byeSlots = calcularByeSlots(allTimeIds.length, totalSlots)

  // Mapear partidas por rodada e posição
  const partidasPorRodadaPosicao = new Map<string, Partida>()
  for (const p of partidas) {
    if (p.posicaoChave != null) {
      partidasPorRodadaPosicao.set(`${p.rodada}-${p.posicaoChave}`, p)
    }
  }

  // Identificar times com bye
  const partidasRodada1 = partidas.filter((p) => p.rodada === 1)
  const byeTeams = getByeTeams(allTimeIds, totalSlots, partidasRodada1)

  const rodadas: ChaveamentoRodada[] = []

  for (let rodada = 1; rodada <= numRodadas; rodada++) {
    const numConfrontos = totalSlots / Math.pow(2, rodada)
    const confrontos: ChaveamentoConfronto[] = []

    for (let pos = 1; pos <= numConfrontos; pos++) {
      const partida = partidasPorRodadaPosicao.get(`${rodada}-${pos}`)

      if (rodada === 1 && byeSlots.has(pos)) {
        // Bye — buscar nome do time
        const byeTeamId = byeTeams.get(pos)
        let byeTimeName = 'BYE'
        if (byeTeamId) {
          const times = await getTimesDoCampeonato(campeonatoId)
          const time = times.find((t) => t.id === byeTeamId)
          if (time) byeTimeName = time.nome
        }

        confrontos.push({
          posicao: pos,
          isBye: true,
          mandanteLabel: byeTimeName,
          visitanteLabel: 'BYE',
        })
      } else if (partida) {
        confrontos.push({ posicao: pos, partida })
      } else {
        // Partida futura — labels de origem
        const pos1 = 2 * pos - 1
        const pos2 = 2 * pos
        const rodadaAnterior = rodada - 1
        const fasAnterior = nomeFase(rodadaAnterior, numRodadas)
        confrontos.push({
          posicao: pos,
          mandanteLabel: `Venc. ${fasAnterior} #${pos1}`,
          visitanteLabel: `Venc. ${fasAnterior} #${pos2}`,
        })
      }
    }

    rodadas.push({
      rodada,
      nomeFase: nomeFase(rodada, numRodadas),
      confrontos,
    })
  }

  return rodadas
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
