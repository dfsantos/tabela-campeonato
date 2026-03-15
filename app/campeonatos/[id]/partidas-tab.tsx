'use client'

import Link from 'next/link'
import { useState } from 'react'
import { type Partida } from '@/lib/fake-data'

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

interface Props {
  partidas: Partida[]
  campeonatoId: string
}

export function PartidasTab({ partidas, campeonatoId }: Props) {
  const porRodada = partidas.reduce<Record<number, Partida[]>>((acc, p) => {
    ;(acc[p.rodada] ??= []).push(p)
    return acc
  }, {})
  const rodadas = Object.keys(porRodada).map(Number).sort((a, b) => a - b)

  const primeiraRodadaPendenteIdx = rodadas.findIndex((r) =>
    porRodada[r].some((p) => p.status === 'agendada'),
  )
  const initialIdx =
    primeiraRodadaPendenteIdx !== -1 ? primeiraRodadaPendenteIdx : rodadas.length - 1

  const [rodadaIdx, setRodadaIdx] = useState(initialIdx)

  if (partidas.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-600">
        Nenhuma partida cadastrada.
      </p>
    )
  }

  const rodadaAtual = rodadas[rodadaIdx]
  const partidasDaRodada = porRodada[rodadaAtual]

  return (
    <div>
      {/* Navegação entre rodadas */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setRodadaIdx((i) => i - 1)}
          disabled={rodadaIdx === 0}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Anterior
        </button>

        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Rodada {rodadaAtual}
          <span className="ml-1.5 text-xs font-normal text-zinc-400 dark:text-zinc-600">
            de {rodadas.length}
          </span>
        </span>

        <button
          onClick={() => setRodadaIdx((i) => i + 1)}
          disabled={rodadaIdx === rodadas.length - 1}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Próxima
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Partidas da rodada */}
      <ul className="space-y-2">
        {partidasDaRodada.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {p.status === 'finalizada' ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {p.mandante.nome}
                  </span>
                  <span className="shrink-0 rounded-md bg-zinc-100 px-2.5 py-0.5 font-mono font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    {p.golsMandante} × {p.golsVisitante}
                  </span>
                  <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {p.visitante.nome}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {p.mandante.nome}
                  </span>
                  <span className="shrink-0 text-zinc-400 dark:text-zinc-600">×</span>
                  <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {p.visitante.nome}
                  </span>
                </div>
              )}
            </div>

            <div className="ml-4 flex shrink-0 items-center gap-3">
              <span className="text-xs text-zinc-400 dark:text-zinc-600">{formatDate(p.data)}</span>
              {p.status === 'finalizada' ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Finalizada
                </span>
              ) : (
                <Link
                  href={`/campeonatos/${campeonatoId}/resultado/${p.id}`}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  Registrar resultado
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
