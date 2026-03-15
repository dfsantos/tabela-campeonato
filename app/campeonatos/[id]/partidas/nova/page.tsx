import { notFound } from 'next/navigation'
import { getCampeonato, getPartidas, getTimesDoCampeonato } from '@/lib/store'
import { NovaPartidaForm } from './nova-partida-form'

type Props = {
  params: Promise<{ id: string }>
}

export default async function NovaPartidaPage({ params }: Props) {
  const { id } = await params
  const campeonato = getCampeonato(id)
  if (!campeonato) notFound()

  const times = getTimesDoCampeonato(id)
  const partidas = getPartidas(id)
  const proximaRodada =
    partidas.length > 0 ? Math.max(...partidas.map((p) => p.rodada)) : 1

  return <NovaPartidaForm campeonato={campeonato} times={times} proximaRodada={proximaRodada} />
}
