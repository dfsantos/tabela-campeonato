'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { getCampeonato, getPartida } from '@/lib/fake-data'

export default function ResultadoPage() {
  const params = useParams<{ id: string; partidaId: string }>()
  const router = useRouter()

  const partida = getPartida(params.partidaId)
  const campeonato = getCampeonato(params.id)

  const [golsMandante, setGolsMandante] = useState('')
  const [golsVisitante, setGolsVisitante] = useState('')

  if (!partida || !campeonato) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">Partida não encontrada.</p>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/campeonatos/${params.id}?aba=partidas`)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-md px-4 py-12">
        {/* Back link */}
        <Link
          href={`/campeonatos/${params.id}?aba=partidas`}
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

          {/* Match header */}
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
            <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {partida.mandante.nome}
            </span>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600">×</span>
            <span className="flex-1 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {partida.visitante.nome}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex items-end gap-4">
              {/* Gols mandante */}
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {partida.mandante.nome}
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  required
                  value={golsMandante}
                  onChange={(e) => setGolsMandante(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-center text-2xl font-semibold text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
                />
              </div>

              <div className="mb-2.5 shrink-0 text-lg font-medium text-zinc-300 dark:text-zinc-700">×</div>

              {/* Gols visitante */}
              <div className="flex-1">
                <label className="mb-1.5 block text-right text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {partida.visitante.nome}
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  required
                  value={golsVisitante}
                  onChange={(e) => setGolsVisitante(e.target.value)}
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
                href={`/campeonatos/${params.id}?aba=partidas`}
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
