'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { getCampeonato, getPartidas } from '@/lib/fake-data'

const times = [
  { id: 't1', nome: 'Atlético Palmital' },
  { id: 't2', nome: 'União Esportiva' },
  { id: 't3', nome: 'EC Esperança' },
  { id: 't4', nome: 'Recreativo Novo Mundo' },
  { id: 't5', nome: 'Grêmio Amigos' },
  { id: 't6', nome: 'AD Central' },
  { id: 't7', nome: 'Sporting Club' },
  { id: 't8', nome: 'Bola de Ouro FC' },
]

export default function NovaPartidaPage() {
  const params = useParams<{ id: string }>()
  const campeonato = getCampeonato(params.id)
  const partidas = getPartidas(params.id)
  const proximaRodada = partidas.length > 0
    ? Math.max(...partidas.map((p) => p.rodada))
    : 1

  const [rodada, setRodada] = useState(String(proximaRodada))
  const [mandanteId, setMandanteId] = useState('')
  const [visitanteId, setVisitanteId] = useState('')
  const [data, setData] = useState('')

  if (!campeonato) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">Campeonato não encontrado.</p>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500'

  const selectClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-md px-4 py-12">
        <Link
          href={`/campeonatos/${params.id}?aba=partidas`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {campeonato.nome}
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-6 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Registrar partida
          </h1>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label htmlFor="rodada" className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Rodada
              </label>
              <input
                id="rodada"
                type="number"
                min={1}
                value={rodada}
                onChange={(e) => setRodada(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="mandante" className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Time mandante
              </label>
              <select
                id="mandante"
                value={mandanteId}
                onChange={(e) => setMandanteId(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Selecione o mandante</option>
                {times.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === visitanteId}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="visitante" className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Time visitante
              </label>
              <select
                id="visitante"
                value={visitanteId}
                onChange={(e) => setVisitanteId(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Selecione o visitante</option>
                {times.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === mandanteId}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="data" className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Data
              </label>
              <input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled
                className="flex-1 cursor-not-allowed rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white opacity-30 dark:bg-zinc-50 dark:text-zinc-900"
              >
                Registrar partida
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
