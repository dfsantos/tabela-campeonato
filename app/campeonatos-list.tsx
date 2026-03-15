'use client'

import Link from 'next/link'
import { excluirCampeonatoAction } from '@/lib/actions'
import type { Campeonato, CampeonatoStatus } from '@/lib/fake-data'

const statusConfig: Record<CampeonatoStatus, { label: string; className: string }> = {
  em_andamento: {
    label: 'Em andamento',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  planejado: {
    label: 'Planejado',
    className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
  finalizado: {
    label: 'Finalizado',
    className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
  },
}

export default function CampeonatosList({ campeonatos }: { campeonatos: Campeonato[] }) {
  return (
    <ul className="space-y-2">
      {campeonatos.map((c) => {
        const status = statusConfig[c.status]
        return (
          <li key={c.id} className="flex items-center gap-2">
            <Link
              href={`/campeonatos/${c.id}`}
              className="flex flex-1 items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{c.nome}</p>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{c.temporada}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
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
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
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
