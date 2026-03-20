import Link from 'next/link'
import { getCampeonatos } from '@/lib/store'
import CampeonatosList from './campeonatos-list'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const campeonatos = await getCampeonatos()
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Campeonatos
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/times"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Times
            </Link>
            <Link
              href="/campeonatos/novo"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Novo campeonato
            </Link>
          </div>
        </div>

        <CampeonatosList campeonatos={campeonatos} />
      </div>
    </div>
  )
}
