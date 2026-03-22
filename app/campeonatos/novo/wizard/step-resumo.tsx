import type { CampeonatoFormato, Time } from '@/lib/types'
import { proximaPotenciaDe2, totalRodadasFromSlots, gerarLabelsFases } from '@/lib/mata-mata'

interface StepResumoProps {
  formato: CampeonatoFormato | null
  nome: string
  temporada: string
  selectedTimeIds: Set<string>
  times: Time[]
  zonaCampeao: boolean
  zonaElite: string
  zonaSegundo: string
  zonaRebaixamento: string
  onGoToStep: (step: number) => void
}

const formatoLabels: Record<CampeonatoFormato, string> = {
  liga: 'Liga (Pontos corridos)',
  copa_grupos: 'Copa (Grupos + Mata-mata)',
  copa_mata_mata: 'Copa (Mata-mata)',
}

export default function StepResumo({
  formato,
  nome,
  temporada,
  selectedTimeIds,
  times,
  zonaCampeao,
  zonaElite,
  zonaSegundo,
  zonaRebaixamento,
  onGoToStep,
}: StepResumoProps) {
  const selectedCount = selectedTimeIds.size
  const selectedTimes = times.filter((t) => selectedTimeIds.has(t.id))
  const hasZonas = zonaCampeao || zonaElite || zonaSegundo || zonaRebaixamento
  const isLiga = formato === 'liga'

  return (
    <div>
      <h2 className="mb-1 font-headline text-lg font-bold text-on-surface">
        Resumo
      </h2>
      <p className="mb-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        Confira os dados antes de criar o campeonato
      </p>

      <div className="space-y-4">
        {/* Formato */}
        <div className="rounded-lg bg-surface-container-low p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Formato
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(0)}
              className="font-label text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary-container"
            >
              Editar
            </button>
          </div>
          <p className="text-sm font-medium text-on-surface">
            {formato ? formatoLabels[formato] : '—'}
          </p>
        </div>

        {/* Dados */}
        <div className="rounded-lg bg-surface-container-low p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Dados
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="font-label text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary-container"
            >
              Editar
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-on-surface">
              <span className="text-on-surface-variant">Nome:</span> {nome}
            </p>
            <p className="text-sm text-on-surface">
              <span className="text-on-surface-variant">Temporada:</span> {temporada}
            </p>
          </div>
        </div>

        {/* Times */}
        <div className="rounded-lg bg-surface-container-low p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {selectedCount} times
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="font-label text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary-container"
            >
              Editar
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedTimes.map((t) => (
              <span
                key={t.id}
                className="rounded-md bg-surface-container-lowest px-2 py-1 text-xs text-on-surface"
              >
                {t.nome}
              </span>
            ))}
          </div>
        </div>

        {/* Zonas (Liga only) */}
        {isLiga && hasZonas && (
          <div className="rounded-lg bg-surface-container-low p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Zonas
              </span>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="font-label text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary-container"
              >
                Editar
              </button>
            </div>
            <div className="space-y-1 text-xs text-on-surface">
              {zonaCampeao && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Campeão (pos. 1)
                </p>
              )}
              {zonaElite && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Elite (pos. 1–{zonaElite})
                </p>
              )}
              {zonaSegundo && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  2º Pelotão (pos. {Number(zonaElite || 0) + 1}–{zonaSegundo})
                </p>
              )}
              {zonaRebaixamento && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-error" />
                  Rebaixamento ({zonaRebaixamento} últimos)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info de partidas — Liga */}
        {isLiga && selectedCount >= 2 && (
          <p className="font-label text-[10px] text-on-surface-variant">
            {selectedCount * (selectedCount - 1)} partidas em{' '}
            {selectedCount % 2 === 0
              ? 2 * (selectedCount - 1)
              : 2 * selectedCount}{' '}
            rodadas serão geradas automaticamente.
          </p>
        )}

        {/* Info de partidas — Copa Mata-mata */}
        {formato === 'copa_mata_mata' && selectedCount >= 2 && (() => {
          const slots = proximaPotenciaDe2(selectedCount)
          const rodadas = totalRodadasFromSlots(slots)
          const byes = slots - selectedCount
          const fases = gerarLabelsFases(rodadas)
          const jogosRodada1 = slots / 2 - byes

          return (
            <div className="rounded-lg bg-surface-container-low p-4">
              <span className="mb-2 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Estrutura do chaveamento
              </span>
              <div className="space-y-1.5 text-xs text-on-surface">
                <p>{fases.join(' → ')}</p>
                <p className="text-on-surface-variant">
                  {jogosRodada1} {jogosRodada1 === 1 ? 'jogo' : 'jogos'} na primeira fase
                  {byes > 0 && ` · ${byes} ${byes === 1 ? 'bye' : 'byes'}`}
                </p>
                <p className="text-on-surface-variant">
                  Confrontos sorteados automaticamente
                </p>
              </div>
            </div>
          )
        })()}

        {/* Aviso Copa Grupos (ainda não disponível) */}
        {formato === 'copa_grupos' && (
          <div className="rounded-lg bg-surface-container p-4 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              O formato <span className="font-bold">{formatoLabels[formato]}</span> ainda não está disponível.
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Volte e selecione outro formato para criar o campeonato.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
