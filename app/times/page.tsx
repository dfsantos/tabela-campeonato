import Link from 'next/link'
import { getTimes } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function TimesPage() {
  const times = await getTimes()

  return (
    <>
      <div className="mb-10 flex items-end justify-between">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tight text-primary">Times</h1>
        <Link
          href="/times/novo"
          className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
        >
          Novo time
        </Link>
      </div>

      <ul className="space-y-2">
        {times.map((time) => (
          <li
            key={time.id}
            className="flex items-center justify-between rounded-xl bg-surface-container-lowest px-5 py-4 shadow-[0_4px_32px_rgba(20,27,43,0.06)]"
          >
            <p className="font-headline font-semibold text-on-surface">{time.nome}</p>
            {time.cidade && (
              <span className="font-label text-xs text-on-surface-variant">{time.cidade}</span>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
