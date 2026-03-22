import { getCampeonato, getPartidas } from '@/lib/store'
import { PartidasContent } from './partidas-content'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PartidasPage({ params }: Props) {
  const { id } = await params
  const [partidas, campeonato] = await Promise.all([getPartidas(id), getCampeonato(id)])

  return (
    <PartidasContent
      partidas={partidas}
      campeonatoId={id}
      formato={campeonato?.formato}
      totalRodadas={campeonato?.copaConfig?.totalRodadas}
    />
  )
}
