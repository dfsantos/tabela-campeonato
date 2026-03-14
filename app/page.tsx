import Link from 'next/link'
import { getCampeonatos } from '@/lib/store'
import type { CampeonatoStatus } from '@/lib/fake-data'

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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Campeonatos
          </h1>
          <Link
            href="/campeonatos/novo"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Novo campeonato
          </Link>
        </div>

        <ul className="space-y-2">
          {getCampeonatos().map((c) => {
            const status = statusConfig[c.status]
            return (
              <li key={c.id}>
                <Link
                  href={`/campeonatos/${c.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{c.nome}</p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{c.temporada}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
