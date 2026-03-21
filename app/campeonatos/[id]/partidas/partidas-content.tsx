'use client'

import Link from 'next/link'
import { useState } from 'react'
import { type Partida } from '@/lib/types'

interface Props {
  partidas: Partida[]
  campeonatoId: string
}

export function PartidasContent({ partidas, campeonatoId }: Props) {
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
      <p className="py-12 text-center text-sm text-on-surface-variant">
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
          className="flex items-center gap-1.5 rounded-lg bg-secondary-container px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Anterior
        </button>

        <span className="font-headline text-sm font-bold text-on-surface">
          Rodada {rodadaAtual}
          <span className="ml-1.5 font-label text-[10px] font-normal uppercase tracking-widest text-on-surface-variant">
            de {rodadas.length}
          </span>
        </span>

        <button
          onClick={() => setRodadaIdx((i) => i + 1)}
          disabled={rodadaIdx === rodadas.length - 1}
          className="flex items-center gap-1.5 rounded-lg bg-secondary-container px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-30"
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
            className="flex items-center justify-between rounded-xl bg-surface-container-lowest px-5 py-3.5 shadow-[0_4px_32px_rgba(20,27,43,0.06)]"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {p.status === 'finalizada' ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="truncate font-medium text-on-surface">
                    {p.mandante.nome}
                  </span>
                  <span className="shrink-0 rounded-lg bg-surface-container px-2.5 py-0.5 font-headline font-bold text-on-surface">
                    {p.golsMandante} <span className="text-primary/20">×</span> {p.golsVisitante}
                  </span>
                  <span className="truncate font-medium text-on-surface">
                    {p.visitante.nome}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <span className="truncate font-medium text-on-surface">
                    {p.mandante.nome}
                  </span>
                  <span className="shrink-0 text-primary/20">×</span>
                  <span className="truncate font-medium text-on-surface">
                    {p.visitante.nome}
                  </span>
                </div>
              )}
            </div>

            <div className="ml-4 flex shrink-0 items-center gap-3">

              {p.status === 'finalizada' ? (
                <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest text-on-primary-fixed-variant">
                  Finalizada
                </span>
              ) : (
                <Link
                  href={`/campeonatos/${campeonatoId}/resultado/${p.id}`}
                  className="rounded-lg bg-primary px-3 py-1 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
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
