import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export default async function CampeonatoPage({ params }: Props) {
  const { id } = await params
  redirect(`/campeonatos/${id}/classificacao`)
}
