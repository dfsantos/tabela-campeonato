import Link from 'next/link'
import { notFound } from 'next/navigation'
import { registrarResultadoAction } from '@/lib/actions'
import { getCampeonato, getPartida } from '@/lib/store'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string; partidaId: string }>
}

export default async function ResultadoPage({ params }: Props) {
  const { id, partidaId } = await params

  const partida = await getPartida(partidaId)
  const campeonato = await getCampeonato(id)
  if (!partida || !campeonato) notFound()

  return (
    <div className="max-w-lg">
      {/* Breadcrumb */}
      <nav className="mb-6 font-label text-xs text-on-surface-variant">
        <Link href="/" className="transition-colors hover:text-primary">Campeonatos</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/campeonatos/${id}?aba=partidas`} className="transition-colors hover:text-primary">{campeonato.nome}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-on-surface">Resultado</span>
      </nav>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_4px_32px_rgba(20,27,43,0.06)]">
        <h1 className="mb-1 font-headline text-lg font-bold text-on-surface">
          Registrar resultado
        </h1>
        <p className="mb-6 font-label text-xs uppercase tracking-widest text-on-surface-variant">
          Rodada {partida.rodada} · {partida.data.split('-').reverse().join('/')}
        </p>

        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-4 py-3">
          <span className="flex-1 text-sm font-medium text-on-surface">
            {partida.mandante.nome}
          </span>
          <span className="text-xs font-medium text-primary/20">×</span>
          <span className="flex-1 text-right text-sm font-medium text-on-surface">
            {partida.visitante.nome}
          </span>
        </div>

        <form action={registrarResultadoAction}>
          <input type="hidden" name="partidaId" value={partida.id} />
          <input type="hidden" name="campeonatoId" value={id} />

          <div className="mb-6 flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {partida.mandante.nome}
              </label>
              <input
                type="number"
                name="golsMandante"
                min={0}
                max={99}
                required
                placeholder="0"
                className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-center text-2xl font-semibold text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-2.5 shrink-0 text-lg font-medium text-primary/20">×</div>

            <div className="flex-1">
              <label className="mb-1.5 block text-right font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {partida.visitante.nome}
              </label>
              <input
                type="number"
                name="golsVisitante"
                min={0}
                max={99}
                required
                placeholder="0"
                className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-center text-2xl font-semibold text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
            >
              Salvar resultado
            </button>
            <Link
              href={`/campeonatos/${id}?aba=partidas`}
              className="rounded-lg bg-secondary-container px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-surface-container-high"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
