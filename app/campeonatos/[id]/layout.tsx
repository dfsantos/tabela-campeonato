import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCampeonato } from '@/lib/store'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export default async function CampeonatoLayout({ params, children }: Props) {
  const { id } = await params

  const campeonato = await getCampeonato(id)
  if (!campeonato) notFound()

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 font-label text-xs text-on-surface-variant">
        <Link href="/" className="transition-colors hover:text-primary">Campeonatos</Link>
        <span className="mx-1.5">/</span>
        <span className="text-on-surface">{campeonato.nome}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tight text-primary">{campeonato.nome}</h1>
        <p className="mt-1 font-label text-xs uppercase tracking-widest text-on-surface-variant">{campeonato.temporada}</p>
      </div>

      {children}
    </>
  )
}
