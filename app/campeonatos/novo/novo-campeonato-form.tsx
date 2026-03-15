'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import type { Time } from '@/lib/fake-data'
import { criarCampeonatoAction } from '@/lib/actions'

export default function NovoCampeonatoForm({ times }: { times: Time[] }) {
  const [nome, setNome] = useState('')
  const [temporada, setTemporada] = useState('')
  const [selectedTimeIds, setSelectedTimeIds] = useState<Set<string>>(new Set())
  const [gerarPartidas, setGerarPartidas] = useState(false)
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
    if (e + s + r > selectedCount) return `Soma (${e + s + r}) excede o número de times (${selectedCount})`
    return null
  }, [zonaElite, zonaSegundo, zonaRebaixamento, selectedCount])

  const canSubmit = nome.trim().length > 0 && temporada.trim().length > 0 && selectedCount >= 2 && selectedCount <= 24 && !zonaError

  const timesFiltrados = filtroAtivo.trim().length >= 3
    ? times.filter(t => t.nome.toLowerCase().includes(filtroAtivo.trim().toLowerCase()))
    : times

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-md px-4 py-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Campeonatos
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-6 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Novo campeonato
          </h1>

          <form action={criarCampeonatoAction} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
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
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="temporada"
                className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
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
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Times participantes
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {selectedTimeIds.size} {selectedTimeIds.size === 1 ? 'time selecionado' : 'times selecionados'}
                </span>
              </div>
              <input
                type="text"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Buscar time pelo nome…"
                className="mb-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
              />
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                {timesFiltrados.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
                    Nenhum time encontrado
                  </p>
                ) : (
                  timesFiltrados.map((time) => (
                    <label
                      key={time.id}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <input
                        type="checkbox"
                        name="timeIds"
                        value={time.id}
                        checked={selectedTimeIds.has(time.id)}
                        onChange={() => toggleTime(time.id)}
                        disabled={!selectedTimeIds.has(time.id) && selectedCount >= 24}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900 dark:border-zinc-600 dark:accent-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <div>
                        <span className="text-sm text-zinc-900 dark:text-zinc-100">{time.nome}</span>
                        {time.cidade && (
                          <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">{time.cidade}</span>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
              {selectedCount === 1 && (
                <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  Selecione ao menos 1 time adicional
                </p>
              )}
              {selectedCount > 24 && (
                <p className="mt-1.5 text-xs text-red-500">
                  Máximo de 24 times atingido
                </p>
              )}
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="gerarPartidas"
                  checked={gerarPartidas}
                  onChange={(e) => setGerarPartidas(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900 dark:border-zinc-600 dark:accent-zinc-100"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Gerar tabela de jogos automaticamente (turno e returno)
                </span>
              </label>
              {gerarPartidas && selectedCount >= 2 && (
                <p className="mt-1.5 ml-7 text-xs text-zinc-400 dark:text-zinc-500">
                  {selectedCount * (selectedCount - 1)} partidas em{' '}
                  {selectedCount % 2 === 0
                    ? 2 * (selectedCount - 1)
                    : 2 * selectedCount}{' '}
                  rodadas serão agendadas.
                </p>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setZonasAberto((v) => !v)}
                className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
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
                <div className="mt-3 space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name="zonaCampeao"
                      checked={zonaCampeao}
                      onChange={(e) => setZonaCampeao(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-600 dark:accent-zinc-100"
                    />
                    <span className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      Destaque para campeão (posição 1)
                    </span>
                  </label>

                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    <label className="flex flex-1 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="w-28 flex-shrink-0">Elite (top N):</span>
                      <input
                        type="number"
                        name="zonaElite"
                        min="1"
                        value={zonaElite}
                        onChange={(e) => setZonaElite(e.target.value)}
                        placeholder="—"
                        className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
                      />
                      <span className="text-xs text-zinc-400">times</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sky-500" />
                    <label className="flex flex-1 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="w-28 flex-shrink-0">2º Pelotão:</span>
                      <input
                        type="number"
                        name="zonaSegundoPelotao"
                        min="1"
                        value={zonaSegundo}
                        onChange={(e) => setZonaSegundo(e.target.value)}
                        placeholder="—"
                        className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
                      />
                      <span className="text-xs text-zinc-400">times</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
                    <label className="flex flex-1 items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="w-28 flex-shrink-0">Rebaixamento:</span>
                      <input
                        type="number"
                        name="zonaRebaixamento"
                        min="1"
                        value={zonaRebaixamento}
                        onChange={(e) => setZonaRebaixamento(e.target.value)}
                        placeholder="—"
                        className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
                      />
                      <span className="text-xs text-zinc-400">times</span>
                    </label>
                  </div>

                  {zonaError && (
                    <p className="text-xs text-red-500">{zonaError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity dark:bg-zinc-50 dark:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Criar campeonato
              </button>
              <Link
                href="/"
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
