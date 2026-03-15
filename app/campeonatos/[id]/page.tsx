import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CampeonatoStatus, ClassificacaoItem, Zonas } from '@/lib/fake-data'
import { calcularClassificacao, getCampeonato, getPartidas } from '@/lib/store'
import { getZona, zonaTextClass } from '@/lib/zonas'
import { PartidasTab } from './partidas-tab'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ aba?: string }>
}

const statusConfig: Record<CampeonatoStatus, { label: string; className: string }> = {
  em_andamento: {
    label: 'Em andamento',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  planejado: {
    label: 'Planejado',
    className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
  finalizado: {
    label: 'Finalizado',
    className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
  },
}

function ClassificacaoTab({ items, zonas }: { items: ClassificacaoItem[]; zonas: Zonas | undefined }) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-600">
        Nenhuma classificação disponível.
      </p>
    )
  }

  return (
    <>
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">#</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Time</th>
            <th className="px-4 py-3 text-center font-medium text-zinc-500 dark:text-zinc-400">P</th>
            <th className="px-4 py-3 text-center font-medium text-zinc-500 dark:text-zinc-400">J</th>
            <th className="px-4 py-3 text-center font-medium text-zinc-500 dark:text-zinc-400">V</th>
            <th className="px-4 py-3 text-center font-medium text-zinc-500 dark:text-zinc-400">E</th>
            <th className="px-4 py-3 text-center font-medium text-zinc-500 dark:text-zinc-400">D</th>
            <th className="px-4 py-3 text-center font-medium text-zinc-500 dark:text-zinc-400">GP</th>
            <th className="px-4 py-3 text-center font-medium text-zinc-500 dark:text-zinc-400">GC</th>
            <th className="px-4 py-3 text-center font-medium text-zinc-500 dark:text-zinc-400">SG</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {items.map((item) => (
            <tr
              key={item.time.id}
              className="bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/30"
            >
              <td className={`px-4 py-3 ${(() => { const z = getZona(item.posicao, items.length, zonas); return z ? zonaTextClass[z] : 'text-zinc-400 dark:text-zinc-600' })()}`}>{item.posicao}</td>
              <td className="px-4 py-3">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.time.nome}</span>
                {item.time.cidade && (
                  <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-600">{item.time.cidade}</span>
                )}
              </td>
              <td className="px-4 py-3 text-center font-semibold text-zinc-900 dark:text-zinc-100">
                {item.pontos}
              </td>
              <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{item.jogos}</td>
              <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{item.vitorias}</td>
              <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{item.empates}</td>
              <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{item.derrotas}</td>
              <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{item.golsPro}</td>
              <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{item.golsContra}</td>
              <td
                className={`px-4 py-3 text-center font-medium ${
                  item.saldoGols > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : item.saldoGols < 0
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-zinc-500 dark:text-zinc-500'
                }`}
              >
                {item.saldoGols > 0 ? `+${item.saldoGols}` : item.saldoGols}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {zonas && (
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
        {zonas.campeao && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Campeão</span>}
        {zonas.elite && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Elite</span>}
        {zonas.segundoPelotao && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" />2º Pelotão</span>}
        {zonas.rebaixamento && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Rebaixamento</span>}
      </div>
    )}
    </>
  )
}


export default async function CampeonatoPage({ params, searchParams }: Props) {
  const { id } = await params
  const { aba = 'classificacao' } = await searchParams

  const campeonato = getCampeonato(id)
  if (!campeonato) notFound()

  const status = statusConfig[campeonato.status]
  const classificacao = calcularClassificacao(id)
  const partidasList = getPartidas(id)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Campeonatos
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{campeonato.nome}</h1>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{campeonato.temporada}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/campeonatos/${id}/partidas/nova`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Registrar partida
              </Link>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/campeonatos/${id}?aba=classificacao`}
            className={`px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
              aba === 'classificacao'
                ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            Classificação
          </Link>
          <Link
            href={`/campeonatos/${id}?aba=partidas`}
            className={`px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
              aba === 'partidas'
                ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            Partidas
          </Link>
        </div>

        {/* Tab content */}
        {aba === 'classificacao' ? (
          <ClassificacaoTab items={classificacao} zonas={campeonato.zonas} />
        ) : (
          <PartidasTab partidas={partidasList} campeonatoId={id} />
        )}
      </div>
    </div>
  )
}
