import { getTimes } from '@/lib/store'
import TimesList from './times-list'

export const dynamic = 'force-dynamic'

export default async function TimesPage() {
  const times = await getTimes()

  return (
    <>
      <div className="mb-10">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tight text-primary">Times</h1>
      </div>

      <TimesList times={times} />
    </>
  )
}
