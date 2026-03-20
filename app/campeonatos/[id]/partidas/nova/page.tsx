import { notFound } from 'next/navigation'
import { getCampeonato, getPartidas, getTimesDoCampeonato } from '@/lib/store'
import { NovaPartidaForm } from './nova-partida-form'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function NovaPartidaPage({ params }: Props) {
  const { id } = await params
  const campeonato = await getCampeonato(id)
  if (!campeonato) notFound()

  const times = await getTimesDoCampeonato(id)
  const partidas = await getPartidas(id)
  const proximaRodada =
    partidas.length > 0 ? Math.max(...partidas.map((p) => p.rodada)) : 1

  return <NovaPartidaForm campeonato={campeonato} times={times} proximaRodada={proximaRodada} />
}
