import { redirect } from 'next/navigation'
import { getCampeonato } from '@/lib/store'

type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function CampeonatoPage({ params }: Props) {
  const { id } = await params
  const campeonato = await getCampeonato(id)

  if (campeonato?.formato === 'copa_mata_mata') {
    redirect(`/campeonatos/${id}/chaveamento`)
  } else {
    redirect(`/campeonatos/${id}/classificacao`)
  }
}
