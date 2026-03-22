import { notFound } from 'next/navigation'
import { getCampeonato, getChaveamento } from '@/lib/store'
import { BracketView } from './bracket-view'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ChaveamentoPage({ params }: Props) {
  const { id } = await params
  const campeonato = await getCampeonato(id)
  if (!campeonato || campeonato.formato !== 'copa_mata_mata') notFound()

  const chaveamento = await getChaveamento(id)

  return (
    <div>
      <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">
        Chaveamento
      </h2>

      {chaveamento.length === 0 ? (
        <p className="py-12 text-center text-sm text-on-surface-variant">
          Nenhum confronto gerado.
        </p>
      ) : (
        <BracketView chaveamento={chaveamento} campeonatoId={id} />
      )}
    </div>
  )
}
