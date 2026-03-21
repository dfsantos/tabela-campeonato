import Link from 'next/link'
import { getCampeonatos } from '@/lib/store'
import CampeonatosList from './campeonatos-list'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const campeonatos = await getCampeonatos()
  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tight text-primary">
          Campeonatos
        </h1>
        <Link
          href="/campeonatos/novo"
          className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
        >
          Novo campeonato
        </Link>
      </div>

      <CampeonatosList campeonatos={campeonatos} />
    </>
  )
}
