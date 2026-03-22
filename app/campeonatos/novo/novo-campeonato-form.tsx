'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import type { Time } from '@/lib/types'
import { criarCampeonatoAction } from '@/lib/actions'

export default function NovoCampeonatoForm({ times }: { times: Time[] }) {
  const [nome, setNome] = useState('')
  const [temporada, setTemporada] = useState('')
  const [selectedTimeIds, setSelectedTimeIds] = useState<Set<string>>(new Set())
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState('')
  const [zonasAberto, setZonasAberto] = useState(false)
  const [zonaCampeao, setZonaCampeao] = useState(false)
  const [zonaElite, setZonaElite] = useState('')
  const [zonaSegundo, setZonaSegundo] = useState('')
  const [zonaRebaixamento, setZonaRebaixamento] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltroAtivo(filtroNome)
    }, 300)
    return () => clearTimeout(timer)
  }, [filtroNome])

  function toggleTime(id: string) {
    setSelectedTimeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedCount = selectedTimeIds.size

  const zonaError = useMemo(() => {
    const e = Number(zonaElite) || 0
    const s = Number(zonaSegundo) || 0
    const r = Number(zonaRebaixamento) || 0
    if (s && e && s <= e) return `2º Pelotão (pos. ${s}) deve ser maior que Elite (pos. ${e})`
    const lastZonedPos = s || e
    if (r && lastZonedPos && lastZonedPos + r > selectedCount) return `Zonas se sobrepõem: pos. ${lastZonedPos} + ${r} rebaixados > ${selectedCount} times`
    if (e > selectedCount) return `Elite (pos. ${e}) excede o número de times (${selectedCount})`
    if (s > selectedCount) return `2º Pelotão (pos. ${s}) excede o número de times (${selectedCount})`
    return null
  }, [zonaElite, zonaSegundo, zonaRebaixamento, selectedCount])

  const canSubmit = nome.trim().length > 0 && temporada.trim().length > 0 && selectedCount >= 2 && selectedCount <= 24 && !zonaError

  const timesFiltrados = filtroAtivo.trim().length >= 3
    ? times.filter(t => t.nome.toLowerCase().includes(filtroAtivo.trim().toLowerCase()))
    : times

  return (
    <div className="max-w-lg">
      {/* Breadcrumb */}
      <nav className="mb-6 font-label text-xs text-on-surface-variant">
        <Link href="/" className="transition-colors hover:text-primary">Campeonatos</Link>
        <span className="mx-1.5">/</span>
        <span className="text-on-surface">Novo campeonato</span>
      </nav>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_4px_32px_rgba(20,27,43,0.06)]">
          <h1 className="mb-6 font-headline text-lg font-bold text-on-surface">
            Novo campeonato
          </h1>

          <form action={criarCampeonatoAction} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="mb-1.5 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
              >
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Campeonato Municipal"
                className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="temporada"
                className="mb-1.5 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
              >
                Temporada
              </label>
              <input
                id="temporada"
                name="temporada"
                type="text"
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
                placeholder="Ex: 2025"
                className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Times participantes
                </span>
                <span className="font-label text-[10px] text-on-surface-variant">
                  {selectedTimeIds.size} {selectedTimeIds.size === 1 ? 'time selecionado' : 'times selecionados'}
                </span>
              </div>
              <input
                type="text"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Buscar time pelo nome…"
                className="mb-2 w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              />
              <div className="overflow-hidden rounded-lg bg-surface-container-low">
                {timesFiltrados.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-on-surface-variant">
                    Nenhum time encontrado
                  </p>
                ) : (
                  <div className="flex flex-col gap-0.5 p-1">
                    {timesFiltrados.map((time) => (
                      <label
                        key={time.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-container"
                      >
                        <input
                          type="checkbox"
                          name="timeIds"
                          value={time.id}
                          checked={selectedTimeIds.has(time.id)}
                          onChange={() => toggleTime(time.id)}
                          disabled={!selectedTimeIds.has(time.id) && selectedCount >= 24}
                          className="h-4 w-4 rounded accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <div>
                          <span className="text-sm text-on-surface">{time.nome}</span>
                          {time.cidade && (
                            <span className="ml-1.5 font-label text-[10px] text-on-surface-variant">{time.cidade}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedCount === 1 && (
                <p className="mt-1.5 font-label text-[10px] text-on-surface-variant">
                  Selecione ao menos 1 time adicional
                </p>
              )}
              {selectedCount > 24 && (
                <p className="mt-1.5 font-label text-[10px] text-error">
                  Máximo de 24 times atingido
                </p>
              )}
            </div>

            {selectedCount >= 2 && (
              <p className="font-label text-[10px] text-on-surface-variant">
                {selectedCount * (selectedCount - 1)} partidas em{' '}
                {selectedCount % 2 === 0
                  ? 2 * (selectedCount - 1)
                  : 2 * selectedCount}{' '}
                rodadas serão geradas automaticamente.
              </p>
            )}

            <div>
              <button
                type="button"
                onClick={() => setZonasAberto((v) => !v)}
                className="flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className={`transition-transform ${zonasAberto ? 'rotate-90' : ''}`}
                >
                  <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Zonas de classificação
              </button>

              {zonasAberto && (
                <div className="mt-3 space-y-3 rounded-lg bg-surface-container-low p-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name="zonaCampeao"
                      checked={zonaCampeao}
                      onChange={(e) => setZonaCampeao(e.target.checked)}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    <span className="flex items-center gap-2 text-sm text-on-surface">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      Destaque para campeão (posição 1)
                    </span>
                  </label>

                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                    <label className="flex flex-1 items-center gap-2 text-sm text-on-surface">
                      <span className="w-28 flex-shrink-0">Elite (até pos.):</span>
                      <input
                        type="number"
                        name="zonaElite"
                        min="1"
                        value={zonaElite}
                        onChange={(e) => setZonaElite(e.target.value)}
                        placeholder="—"
                        className="w-20 rounded-md border-none bg-surface-container-lowest px-2 py-1 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                      />
                      {zonaElite && <span className="font-label text-[10px] text-on-surface-variant">pos. 1–{zonaElite}</span>}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sky-500" />
                    <label className="flex flex-1 items-center gap-2 text-sm text-on-surface">
                      <span className="w-28 flex-shrink-0">2º Pelotão (até pos.):</span>
                      <input
                        type="number"
                        name="zonaSegundoPelotao"
                        min="1"
                        value={zonaSegundo}
                        onChange={(e) => setZonaSegundo(e.target.value)}
                        placeholder="—"
                        className="w-20 rounded-md border-none bg-surface-container-lowest px-2 py-1 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                      />
                      {zonaSegundo && zonaElite && <span className="font-label text-[10px] text-on-surface-variant">pos. {Number(zonaElite) + 1}–{zonaSegundo}</span>}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-error" />
                    <label className="flex flex-1 items-center gap-2 text-sm text-on-surface">
                      <span className="w-28 flex-shrink-0">Rebaixamento:</span>
                      <input
                        type="number"
                        name="zonaRebaixamento"
                        min="1"
                        value={zonaRebaixamento}
                        onChange={(e) => setZonaRebaixamento(e.target.value)}
                        placeholder="—"
                        className="w-20 rounded-md border-none bg-surface-container-lowest px-2 py-1 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="font-label text-[10px] text-on-surface-variant">últimos times</span>
                    </label>
                  </div>

                  {zonaError && (
                    <p className="font-label text-[10px] text-error">{zonaError}</p>
                  )}
                </div>
              )}
            </div>

            {Array.from(selectedTimeIds)
              .filter(id => !timesFiltrados.some(t => t.id === id))
              .map(id => (
                <input key={id} type="hidden" name="timeIds" value={id} />
              ))}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                Criar campeonato
              </button>
              <Link
                href="/"
                className="rounded-lg bg-secondary-container px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-surface-container-high"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
  )
}
