import Link from 'next/link'
import { notFound } from 'next/navigation'
import { registrarResultadoAction } from '@/lib/actions'
import { getCampeonato, getPartida } from '@/lib/store'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string; partidaId: string }>
}

export default async function ResultadoPage({ params }: Props) {
  const { id, partidaId } = await params

  const partida = await getPartida(partidaId)
  const campeonato = await getCampeonato(id)
  if (!partida || !campeonato) notFound()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-md px-4 py-12">
        <Link
          href={`/campeonatos/${id}?aba=partidas`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {campeonato.nome}
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Registrar resultado
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Rodada {partida.rodada} · {partida.data.split('-').reverse().join('/')}
          </p>

          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
            <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {partida.mandante.nome}
            </span>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600">×</span>
            <span className="flex-1 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {partida.visitante.nome}
            </span>
          </div>

          <form action={registrarResultadoAction}>
            <input type="hidden" name="partidaId" value={partida.id} />
            <input type="hidden" name="campeonatoId" value={id} />

            <div className="mb-6 flex items-end gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {partida.mandante.nome}
                </label>
                <input
                  type="number"
                  name="golsMandante"
                  min={0}
                  max={99}
                  required
                  placeholder="0"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-center text-2xl font-semibold text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
                />
              </div>

              <div className="mb-2.5 shrink-0 text-lg font-medium text-zinc-300 dark:text-zinc-700">×</div>

              <div className="flex-1">
                <label className="mb-1.5 block text-right text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {partida.visitante.nome}
                </label>
                <input
                  type="number"
                  name="golsVisitante"
                  min={0}
                  max={99}
                  required
                  placeholder="0"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-center text-2xl font-semibold text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Salvar resultado
              </button>
              <Link
                href={`/campeonatos/${id}?aba=partidas`}
                className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
