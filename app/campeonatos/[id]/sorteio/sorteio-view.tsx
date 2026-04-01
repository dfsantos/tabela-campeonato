'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { nomeGrupo } from '@/lib/grupos'

type SorteioStatus = 'aguardando' | 'sorteando' | 'pausado' | 'concluido'

interface TimeInfo {
  id: string
  nome: string
}

interface Confronto {
  posicao: number
  mandante?: TimeInfo
  visitante?: TimeInfo
  isBye: boolean
}

type SorteioViewProps =
  | {
      campeonatoId: string
      formato: 'copa_grupos'
      grupos: Record<number, TimeInfo[]>
      confrontos?: never
    }
  | {
      campeonatoId: string
      formato: 'copa_mata_mata'
      grupos?: never
      confrontos: Confronto[]
    }

// Itens a revelar: cada item é um time em um destino (grupo ou posição no bracket)
interface RevealItem {
  time: TimeInfo
  grupoIndex?: number
  posicao?: number
  lado?: 'mandante' | 'visitante'
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function buildRevealItems(props: SorteioViewProps): RevealItem[] {
  if (props.formato === 'copa_grupos') {
    const items: RevealItem[] = []
    for (const [grupoIdx, times] of Object.entries(props.grupos)) {
      for (const time of times) {
        items.push({ time, grupoIndex: Number(grupoIdx) })
      }
    }
    return shuffleArray(items)
  }

  // copa_mata_mata
  const items: RevealItem[] = []
  for (const c of props.confrontos) {
    if (c.mandante) {
      items.push({ time: c.mandante, posicao: c.posicao, lado: 'mandante' })
    }
    if (c.visitante) {
      items.push({ time: c.visitante, posicao: c.posicao, lado: 'visitante' })
    }
  }
  return shuffleArray(items)
}

const INTERVAL_NORMAL = 3000
const INTERVAL_FAST = 150

export default function SorteioView(props: SorteioViewProps) {
  const revealItems = useMemo(() => buildRevealItems(props), []) // eslint-disable-line react-hooks/exhaustive-deps
  const totalItems = revealItems.length

  const [revealedCount, setRevealedCount] = useState(0)
  const [status, setStatus] = useState<SorteioStatus>('aguardando')
  const [fastMode, setFastMode] = useState(false)

  // Set de IDs revelados para lookup rápido: "timeId-grupoIndex" ou "timeId-posicao-lado"
  const revealedSet = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < revealedCount; i++) {
      const item = revealItems[i]
      if (item.grupoIndex != null) {
        set.add(`${item.time.id}-g${item.grupoIndex}`)
      } else {
        set.add(`${item.time.id}-p${item.posicao}-${item.lado}`)
      }
    }
    return set
  }, [revealedCount, revealItems])

  // Item sendo revelado atualmente (o último revelado)
  const currentItem = revealedCount > 0 ? revealItems[revealedCount - 1] : null

  const currentItemKey = currentItem
    ? currentItem.grupoIndex != null
      ? `${currentItem.time.id}-g${currentItem.grupoIndex}`
      : `${currentItem.time.id}-p${currentItem.posicao}-${currentItem.lado}`
    : null

  // Timer de revelação
  useEffect(() => {
    if (status !== 'sorteando') return

    const interval = setInterval(() => {
      setRevealedCount((prev) => {
        const next = prev + 1
        if (next >= totalItems) {
          setStatus('concluido')
          return totalItems
        }
        return next
      })
    }, fastMode ? INTERVAL_FAST : INTERVAL_NORMAL)

    return () => clearInterval(interval)
  }, [status, fastMode, totalItems])

  const handleStart = useCallback(() => {
    setStatus('sorteando')
    setRevealedCount(1)
  }, [])

  const handlePause = useCallback(() => {
    setStatus('pausado')
  }, [])

  const handleResume = useCallback(() => {
    setStatus('sorteando')
  }, [])

  const handleFastForward = useCallback(() => {
    setFastMode(true)
    if (status === 'pausado' || status === 'aguardando') {
      setStatus('sorteando')
      if (revealedCount === 0) setRevealedCount(1)
    }
  }, [status, revealedCount])

  const isCopa = props.formato === 'copa_grupos' || props.formato === 'copa_mata_mata'

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-primary">
          Sorteio
        </h2>
        <p className="mt-1 font-label text-xs uppercase tracking-widest text-on-surface-variant">
          {props.formato === 'copa_grupos'
            ? 'Distribuicao dos times nos grupos'
            : 'Distribuicao dos times no chaveamento'}
        </p>
      </div>

      {/* Progress */}
      {status !== 'aguardando' && (
        <div className="mb-6">
          <div className="mb-1 flex items-center justify-between font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            <span>{revealedCount} de {totalItems} times</span>
            <span>{Math.round((revealedCount / totalItems) * 100)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(revealedCount / totalItems) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Conteudo do sorteio */}
      <div className="mb-8">
        {props.formato === 'copa_grupos' ? (
          <GruposView
            grupos={props.grupos}
            revealedSet={revealedSet}
            currentItemKey={currentItemKey}
            status={status}
          />
        ) : (
          <BracketView
            confrontos={props.confrontos}
            revealedSet={revealedSet}
            currentItemKey={currentItemKey}
            status={status}
          />
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {status === 'aguardando' && (
          <button
            type="button"
            onClick={handleStart}
            className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-8 py-3 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
          >
            Iniciar Sorteio
          </button>
        )}

        {status === 'sorteando' && (
          <>
            <button
              type="button"
              onClick={handlePause}
              className="rounded-lg bg-secondary-container px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-surface-container-high"
            >
              Pausar
            </button>
            {!fastMode && (
              <button
                type="button"
                onClick={handleFastForward}
                className="rounded-lg bg-secondary-container px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-surface-container-high"
              >
                Concluir Rapidamente
              </button>
            )}
          </>
        )}

        {status === 'pausado' && (
          <>
            <button
              type="button"
              onClick={handleResume}
              className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
            >
              Retomar
            </button>
            {!fastMode && (
              <button
                type="button"
                onClick={handleFastForward}
                className="rounded-lg bg-secondary-container px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-surface-container-high"
              >
                Concluir Rapidamente
              </button>
            )}
          </>
        )}

        {status === 'concluido' && isCopa && (
          <Link
            href={`/campeonatos/${props.campeonatoId}`}
            className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-8 py-3 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
          >
            Ir para o campeonato
          </Link>
        )}

        {/* Pular sorteio: sempre visível até concluir */}
        {status !== 'concluido' && (
          <Link
            href={`/campeonatos/${props.campeonatoId}`}
            className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
          >
            Pular sorteio
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Copa Grupos: Grid de grupos ──────────────────────────────

function GruposView({
  grupos,
  revealedSet,
  currentItemKey,
  status,
}: {
  grupos: Record<number, TimeInfo[]>
  revealedSet: Set<string>
  currentItemKey: string | null
  status: SorteioStatus
}) {
  const grupoEntries = Object.entries(grupos)
    .map(([idx, times]) => ({ index: Number(idx), times }))
    .sort((a, b) => a.index - b.index)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {grupoEntries.map(({ index, times }) => (
        <div
          key={index}
          className="rounded-xl bg-surface-container-lowest p-5 shadow-[0_4px_32px_rgba(20,27,43,0.06)]"
        >
          <h3 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-primary">
            {nomeGrupo(index)}
          </h3>
          <div className="space-y-2">
            {times.map((time) => {
              const key = `${time.id}-g${index}`
              const isRevealed = revealedSet.has(key)
              const isCurrent = currentItemKey === key

              return (
                <div
                  key={time.id}
                  className={`
                    rounded-lg px-3 py-2 text-sm font-medium transition-all duration-500
                    ${isRevealed
                      ? isCurrent && status === 'sorteando'
                        ? 'bg-primary/10 text-primary ring-2 ring-primary/40'
                        : 'bg-surface-container-low text-on-surface'
                      : 'bg-surface-container text-transparent select-none'
                    }
                    ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                  `}
                >
                  {isRevealed ? time.nome : '\u00A0'}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Copa Mata-Mata: Visualização do bracket ──────────────────

function BracketView({
  confrontos,
  revealedSet,
  currentItemKey,
  status,
}: {
  confrontos: Confronto[]
  revealedSet: Set<string>
  currentItemKey: string | null
  status: SorteioStatus
}) {
  return (
    <div className="space-y-3">
      {confrontos.map((confronto) => (
        <div
          key={confronto.posicao}
          className="rounded-xl bg-surface-container-lowest p-4 shadow-[0_4px_32px_rgba(20,27,43,0.06)]"
        >
          <div className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Posicao {confronto.posicao}
            {confronto.isBye && (
              <span className="ml-2 text-primary">(BYE)</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mandante */}
            <BracketSlot
              time={confronto.mandante}
              posicao={confronto.posicao}
              lado="mandante"
              revealedSet={revealedSet}
              currentItemKey={currentItemKey}
              status={status}
            />

            {!confronto.isBye && (
              <>
                <span className="font-headline text-xs font-bold text-on-surface-variant">
                  vs
                </span>

                {/* Visitante */}
                <BracketSlot
                  time={confronto.visitante}
                  posicao={confronto.posicao}
                  lado="visitante"
                  revealedSet={revealedSet}
                  currentItemKey={currentItemKey}
                  status={status}
                />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function BracketSlot({
  time,
  posicao,
  lado,
  revealedSet,
  currentItemKey,
  status,
}: {
  time?: TimeInfo
  posicao: number
  lado: 'mandante' | 'visitante'
  revealedSet: Set<string>
  currentItemKey: string | null
  status: SorteioStatus
}) {
  if (!time) return null

  const key = `${time.id}-p${posicao}-${lado}`
  const isRevealed = revealedSet.has(key)
  const isCurrent = currentItemKey === key

  return (
    <div
      className={`
        flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-500
        ${isRevealed
          ? isCurrent && status === 'sorteando'
            ? 'bg-primary/10 text-primary ring-2 ring-primary/40'
            : 'bg-surface-container-low text-on-surface'
          : 'bg-surface-container text-transparent select-none'
        }
        ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}
      `}
    >
      {isRevealed ? time.nome : '\u00A0'}
    </div>
  )
}
