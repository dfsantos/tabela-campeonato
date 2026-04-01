import { notFound, redirect } from 'next/navigation'
import { getCampeonato, getParticipantesComTime, getPartidas } from '@/lib/store'
import { calcularByeSlots, proximaPotenciaDe2 } from '@/lib/mata-mata'
import SorteioView from './sorteio-view'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SorteioPage({ params }: Props) {
  const { id } = await params
  const campeonato = await getCampeonato(id)
  if (!campeonato) notFound()

  // Sorteio só faz sentido para copas
  if (campeonato.formato !== 'copa_mata_mata' && campeonato.formato !== 'copa_grupos') {
    redirect(`/campeonatos/${id}`)
  }

  const participantes = await getParticipantesComTime(id)

  if (campeonato.formato === 'copa_grupos') {
    // Agrupar participantes por grupo
    const grupos: Record<number, Array<{ id: string; nome: string }>> = {}
    for (const p of participantes) {
      const g = p.grupo ?? 0
      if (!grupos[g]) grupos[g] = []
      grupos[g].push({ id: p.time.id, nome: p.time.nome })
    }

    return (
      <SorteioView
        campeonatoId={id}
        formato="copa_grupos"
        grupos={grupos}
      />
    )
  }

  // copa_mata_mata: buscar partidas da rodada 1 e byes
  const partidas = await getPartidas(id)
  const rodada1 = partidas.filter((p) => p.rodada === 1 && p.posicaoChave != null)

  const totalSlots = campeonato.copaConfig?.totalSlots ?? proximaPotenciaDe2(participantes.length)
  const byeSlots = calcularByeSlots(participantes.length, totalSlots)

  // Montar confrontos da rodada 1 (incluindo byes)
  const matchesRound1 = totalSlots / 2
  const confrontos: Array<{
    posicao: number
    mandante?: { id: string; nome: string }
    visitante?: { id: string; nome: string }
    isBye: boolean
  }> = []

  // Mapear partidas por posição
  const partidasPorPosicao = new Map(rodada1.map((p) => [p.posicaoChave!, p]))

  // Identificar times com bye (participantes que não aparecem em nenhuma partida da rodada 1)
  const timesEmPartidas = new Set<string>()
  for (const p of rodada1) {
    timesEmPartidas.add(p.mandante.id)
    timesEmPartidas.add(p.visitante.id)
  }
  const timesComBye = participantes
    .filter((p) => !timesEmPartidas.has(p.time.id))
    .map((p) => ({ id: p.time.id, nome: p.time.nome }))

  let byeIdx = 0
  for (let pos = 1; pos <= matchesRound1; pos++) {
    const partida = partidasPorPosicao.get(pos)
    if (partida) {
      confrontos.push({
        posicao: pos,
        mandante: { id: partida.mandante.id, nome: partida.mandante.nome },
        visitante: { id: partida.visitante.id, nome: partida.visitante.nome },
        isBye: false,
      })
    } else if (byeSlots.has(pos) && byeIdx < timesComBye.length) {
      confrontos.push({
        posicao: pos,
        mandante: timesComBye[byeIdx++],
        isBye: true,
      })
    }
  }

  return (
    <SorteioView
      campeonatoId={id}
      formato="copa_mata_mata"
      confrontos={confrontos}
    />
  )
}
