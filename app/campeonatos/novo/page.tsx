import { getTimes } from '@/lib/store'
import NovoCampeonatoForm from './novo-campeonato-form'

export default function NovoCampeonatoPage() {
  const times = getTimes()
  return <NovoCampeonatoForm times={times} />
}
