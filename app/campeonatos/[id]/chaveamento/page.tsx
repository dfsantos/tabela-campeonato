import { notFound } from 'next/navigation'
import { getCampeonato, getChaveamento, verificarFaseGruposConcluida } from '@/lib/store'
import { BracketView } from './bracket-view'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ChaveamentoPage({ params }: Props) {
  const { id } = await params
  const campeonato = await getCampeonato(id)
  if (!campeonato || (campeonato.formato !== 'copa_mata_mata' && campeonato.formato !== 'copa_grupos')) notFound()

  // Copa grupos: verificar se fase de grupos concluiu
  if (campeonato.formato === 'copa_grupos') {
    const gruposConcluidos = await verificarFaseGruposConcluida(id)
    if (!gruposConcluidos) {
      return (
        <div>
          <h2 className="mb-6 font-headline text-lg font-bold text-on-surface">
            Chaveamento
          </h2>
          <div className="rounded-xl bg-surface-container-low p-8 text-center">
            <p className="text-sm text-on-surface-variant">
              O chaveamento será gerado automaticamente após a conclusão da fase de grupos.
            </p>
          </div>
        </div>
      )
    }
  }

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
