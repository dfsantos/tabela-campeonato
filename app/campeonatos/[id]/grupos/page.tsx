import { notFound } from 'next/navigation'
import type { ClassificacaoItem } from '@/lib/types'
import { getCampeonato, getGruposInfo, verificarFaseGruposConcluida } from '@/lib/store'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

function MiniClassificacaoTable({
  items,
  classificadosPorGrupo,
}: {
  items: ClassificacaoItem[]
  classificadosPorGrupo: number
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-on-surface-variant">
        Nenhuma partida finalizada.
      </p>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-surface-container-low">
          <th className="px-3 py-2 text-left font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">#</th>
          <th className="px-3 py-2 text-left font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Time</th>
          <th className="px-3 py-2 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">P</th>
          <th className="px-3 py-2 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">J</th>
          <th className="px-3 py-2 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">V</th>
          <th className="px-3 py-2 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">E</th>
          <th className="px-3 py-2 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">D</th>
          <th className="px-3 py-2 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">SG</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {items.map((item) => {
          const classificado = item.posicao <= classificadosPorGrupo
          return (
            <tr
              key={item.time.id}
              className={`transition-colors hover:bg-surface-container-high/30 ${
                classificado ? 'border-l-2 border-l-primary' : ''
              }`}
            >
              <td className={`px-3 py-2 font-headline font-bold ${classificado ? 'text-primary' : 'text-on-surface-variant'}`}>
                {item.posicao}
              </td>
              <td className="px-3 py-2">
                <span className={`font-body font-medium ${classificado ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {item.time.nome}
                </span>
              </td>
              <td className={`px-3 py-2 text-right font-headline font-bold ${classificado ? 'text-primary' : 'text-on-surface'}`}>
                {item.pontos}
              </td>
              <td className="px-3 py-2 text-right text-on-surface-variant">{item.jogos}</td>
              <td className="px-3 py-2 text-right text-on-surface-variant">{item.vitorias}</td>
              <td className="px-3 py-2 text-right text-on-surface-variant">{item.empates}</td>
              <td className="px-3 py-2 text-right text-on-surface-variant">{item.derrotas}</td>
              <td className={`px-3 py-2 text-right font-medium ${
                item.saldoGols > 0 ? 'text-primary' : item.saldoGols < 0 ? 'text-error' : 'text-on-surface-variant'
              }`}>
                {item.saldoGols > 0 ? `+${item.saldoGols}` : item.saldoGols}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default async function GruposPage({ params }: Props) {
  const { id } = await params

  const campeonato = await getCampeonato(id)
  if (!campeonato || campeonato.formato !== 'copa_grupos') notFound()

  const gruposInfo = await getGruposInfo(id)
  const faseGruposConcluida = await verificarFaseGruposConcluida(id)
  const classificadosPorGrupo = campeonato.copaConfig?.gruposConfig?.classificadosPorGrupo ?? 1

  return (
    <div className="space-y-6">
      {faseGruposConcluida && (
        <div className="rounded-xl bg-primary/5 p-4">
          <p className="text-sm font-medium text-primary">
            Fase de grupos concluída — chaveamento eliminatório gerado automaticamente.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {gruposInfo.map((grupo) => (
          <div
            key={grupo.numero}
            className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_4px_32px_rgba(20,27,43,0.06)]"
          >
            <div className="bg-surface-container-low px-4 py-3">
              <h3 className="font-headline text-sm font-bold text-on-surface">
                {grupo.nome}
              </h3>
            </div>
            <MiniClassificacaoTable
              items={grupo.classificacao}
              classificadosPorGrupo={classificadosPorGrupo}
            />
          </div>
        ))}
      </div>

      {gruposInfo.length > 0 && (
        <div className="flex items-center gap-3 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-primary" />
            Classificado para o mata-mata
          </span>
        </div>
      )}
    </div>
  )
}
