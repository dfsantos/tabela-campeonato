import { notFound } from 'next/navigation'
import type { ClassificacaoItem, Zonas } from '@/lib/types'
import { calcularClassificacao, getCampeonato } from '@/lib/store'
import { getZona, zonaBorderClass, zonaTextClass } from '@/lib/zonas'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

function ClassificacaoTable({ items, zonas }: { items: ClassificacaoItem[]; zonas: Zonas | undefined }) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-on-surface-variant">
        Nenhuma classificação disponível.
      </p>
    )
  }

  return (
    <>
    <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-[0_4px_32px_rgba(20,27,43,0.06)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-container-low">
            <th className="px-4 py-3 text-left font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">#</th>
            <th className="px-4 py-3 text-left font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Time</th>
            <th className="px-4 py-3 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">P</th>
            <th className="px-4 py-3 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">J</th>
            <th className="px-4 py-3 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">V</th>
            <th className="px-4 py-3 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">E</th>
            <th className="px-4 py-3 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">D</th>
            <th className="px-4 py-3 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">GP</th>
            <th className="px-4 py-3 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">GC</th>
            <th className="px-4 py-3 text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">SG</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {items.map((item) => {
            const zona = getZona(item.posicao, items.length, zonas)
            const zonaBorder = zona ? zonaBorderClass[zona] : ''
            const zonaText = zona ? zonaTextClass[zona] : 'text-on-surface-variant'
            return (
              <tr
                key={item.time.id}
                className={`transition-colors hover:bg-surface-container-high/30 ${zonaBorder}`}
              >
                <td className={`px-4 py-3 font-headline font-bold ${zonaText}`}>
                  {String(item.posicao).padStart(2, '0')}
                </td>
                <td className="px-4 py-3">
                  <span className="font-body font-medium text-on-surface">{item.time.nome}</span>
                  {item.time.cidade && (
                    <span className="ml-2 font-label text-[10px] text-on-surface-variant">{item.time.cidade}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-headline text-lg font-bold text-primary">
                  {item.pontos}
                </td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{item.jogos}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{item.vitorias}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{item.empates}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{item.derrotas}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{item.golsPro}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{item.golsContra}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    item.saldoGols > 0
                      ? 'text-primary'
                      : item.saldoGols < 0
                        ? 'text-error'
                        : 'text-on-surface-variant'
                  }`}
                >
                  {item.saldoGols > 0 ? `+${item.saldoGols}` : item.saldoGols}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    {zonas && (
      <div className="mt-3 flex flex-wrap gap-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        {zonas.campeao && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Campeão</span>}
        {zonas.elite && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Elite</span>}
        {zonas.segundoPelotao && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" />2º Pelotão</span>}
        {zonas.rebaixamento && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-error" />Rebaixamento</span>}
      </div>
    )}
    </>
  )
}

export default async function ClassificacaoPage({ params }: Props) {
  const { id } = await params

  const campeonato = await getCampeonato(id)
  if (!campeonato) notFound()

  const classificacao = await calcularClassificacao(id)

  return <ClassificacaoTable items={classificacao} zonas={campeonato.zonas} />
}
