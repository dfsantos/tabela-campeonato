import { getTimes } from '@/lib/store'
import NovoCampeonatoForm from './novo-campeonato-form'

export const dynamic = 'force-dynamic'

export default async function NovoCampeonatoPage() {
  const times = await getTimes()
  return <NovoCampeonatoForm times={times} />
}
