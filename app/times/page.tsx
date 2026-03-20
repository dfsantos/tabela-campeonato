import Link from 'next/link'
import { getTimes } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function TimesPage() {
  const times = await getTimes()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Campeonatos
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Times</h1>
          <Link
            href="/times/novo"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Novo time
          </Link>
        </div>

        <ul className="space-y-2">
          {times.map((time) => (
            <li
              key={time.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{time.nome}</p>
              {time.cidade && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{time.cidade}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
