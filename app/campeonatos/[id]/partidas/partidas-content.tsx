'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type Partida } from '@/lib/types'
import { registrarResultadoInlineAction } from '@/lib/actions'

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
  const [gols, setGols] = useState<Record<string, { mandante: string; visitante: string }>>({})
  const [isPending, startTransition] = useTransition()
  const [savingId, setSavingId] = useState<string | null>(null)
  const router = useRouter()

  if (partidas.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-on-surface-variant">
        Nenhuma partida cadastrada.
      </p>
    )
  }

  const rodadaAtual = rodadas[rodadaIdx]
  const partidasDaRodada = porRodada[rodadaAtual]

  function handleGolChange(partidaId: string, campo: 'mandante' | 'visitante', valor: string) {
    if (valor !== '' && !/^\d+$/.test(valor)) return
    const updated = {
      mandante: campo === 'mandante' ? valor : (gols[partidaId]?.mandante ?? ''),
      visitante: campo === 'visitante' ? valor : (gols[partidaId]?.visitante ?? ''),
    }
    setGols((prev) => ({ ...prev, [partidaId]: updated }))

    if (updated.mandante !== '' && updated.visitante !== '') {
      setSavingId(partidaId)
      startTransition(async () => {
        await registrarResultadoInlineAction(
          partidaId,
          campeonatoId,
          parseInt(updated.mandante, 10),
          parseInt(updated.visitante, 10),
        )
        setSavingId(null)
        router.refresh()
      })
    }
  }

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
            className="flex items-center rounded-xl bg-surface-container-lowest px-5 py-3.5 shadow-[0_4px_32px_rgba(20,27,43,0.06)]"
          >
            <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
              <span className="truncate text-right font-medium text-on-surface">
                {p.mandante.cidade && (
                  <span className="mr-1 font-label text-xs font-normal text-on-surface-variant">({p.mandante.cidade})</span>
                )}
                {p.mandante.nome}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={gols[p.id]?.mandante ?? String(p.golsMandante ?? '')}
                  onChange={(e) => handleGolChange(p.id, 'mandante', e.target.value)}
                  className="w-[48px] rounded-lg bg-surface-container-low py-1 text-center font-headline font-bold text-on-surface transition-colors focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isPending && savingId === p.id}
                />
                {isPending && savingId === p.id ? (
                  <svg className="h-[14px] w-[14px] animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span className="text-primary/20">×</span>
                )}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={gols[p.id]?.visitante ?? String(p.golsVisitante ?? '')}
                  onChange={(e) => handleGolChange(p.id, 'visitante', e.target.value)}
                  className="w-[48px] rounded-lg bg-surface-container-low py-1 text-center font-headline font-bold text-on-surface transition-colors focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isPending && savingId === p.id}
                />
              </div>
              <span className="truncate text-left font-medium text-on-surface">
                {p.visitante.nome}
                {p.visitante.cidade && (
                  <span className="ml-1 font-label text-xs font-normal text-on-surface-variant">({p.visitante.cidade})</span>
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
