'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Time } from '@/lib/types'

export default function TimesList({ times }: { times: Time[] }) {
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState('')
  const [filtroPais, setFiltroPais] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltroAtivo(filtroNome)
    }, 300)
    return () => clearTimeout(timer)
  }, [filtroNome])

  const paises = useMemo(
    () => [...new Set(times.map((t) => t.paisNome).filter(Boolean) as string[])].sort(),
    [times],
  )

  const timesFiltrados = useMemo(
    () =>
      times
        .filter((t) => filtroPais === '' || t.paisNome === filtroPais)
        .filter(
          (t) =>
            filtroAtivo.trim().length < 3 ||
            t.nome.toLowerCase().includes(filtroAtivo.trim().toLowerCase()),
        ),
    [times, filtroPais, filtroAtivo],
  )

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Buscar time pelo nome…"
          className="flex-1 rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
        />
        {paises.length > 0 && (
          <select
            value={filtroPais}
            onChange={(e) => setFiltroPais(e.target.value)}
            className="rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary sm:w-48"
          >
            <option value="">Todos os países</option>
            {paises.map((pais) => (
              <option key={pais} value={pais}>
                {pais}
              </option>
            ))}
          </select>
        )}
      </div>

      {timesFiltrados.length === 0 ? (
        <p className="py-10 text-center text-sm text-on-surface-variant">Nenhum time encontrado</p>
      ) : (
        <ul className="space-y-2">
          {timesFiltrados.map((time) => (
            <li
              key={time.id}
              className="flex items-center justify-between rounded-xl bg-surface-container-lowest px-5 py-4 shadow-[0_4px_32px_rgba(20,27,43,0.06)]"
            >
              <p className="font-headline font-semibold text-on-surface">{time.nome}</p>
              {(time.cidade || time.paisNome) && (
                <span className="font-label text-xs text-on-surface-variant">
                  {[time.cidade, time.paisNome].filter(Boolean).join(' · ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
