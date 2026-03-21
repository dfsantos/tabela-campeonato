import { getCampeonatos } from '@/lib/store'
import CampeonatosList from './campeonatos-list'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const campeonatos = await getCampeonatos()
  return (
    <>
      <div className="mb-10">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tight text-primary">
          Campeonatos
        </h1>
      </div>

      <CampeonatosList campeonatos={campeonatos} />
    </>
  )
}
