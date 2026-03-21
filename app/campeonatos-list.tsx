'use client'

import Link from 'next/link'
import { excluirCampeonatoAction } from '@/lib/actions'
import type { Campeonato, CampeonatoStatus } from '@/lib/types'

const statusConfig: Record<CampeonatoStatus, { label: string; className: string }> = {
  em_andamento: {
    label: 'Em andamento',
    className: 'bg-primary-fixed text-on-primary-fixed-variant',
  },
  planejado: {
    label: 'Planejado',
    className: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  },
  finalizado: {
    label: 'Finalizado',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
}

export default function CampeonatosList({ campeonatos }: { campeonatos: Campeonato[] }) {
  return (
    <ul className="space-y-3">
      {campeonatos.map((c) => {
        const status = statusConfig[c.status]
        return (
          <li key={c.id} className="flex items-center gap-2">
            <Link
              href={`/campeonatos/${c.id}`}
              className="flex flex-1 items-center justify-between rounded-xl bg-surface-container-lowest px-5 py-4 shadow-[0_4px_32px_rgba(20,27,43,0.06)] transition-colors hover:bg-surface-container-low"
            >
              <div>
                <p className="font-headline font-semibold text-on-surface">{c.nome}</p>
                <p className="mt-0.5 font-label text-xs text-on-surface-variant">{c.temporada}</p>
              </div>
              <span className={`rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${status.className}`}>
                {status.label}
              </span>
            </Link>
            <form
              action={excluirCampeonatoAction}
              onSubmit={(e) => {
                if (!window.confirm(`Excluir "${c.nome}"? Todas as partidas serão removidas.`)) {
                  e.preventDefault()
                }
              }}
            >
              <input type="hidden" name="id" value={c.id} />
              <button
                type="submit"
                className="rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
              >
                Excluir
              </button>
            </form>
          </li>
        )
      })}
    </ul>
  )
}
