import { divisoresValidosParaGrupo, calcularInfoBracket, totalPartidasGrupos, totalRodadasGrupos, labelPosicaoComplemento } from '@/lib/grupos'

interface StepGruposProps {
  totalTimes: number
  timesPorGrupo: number
  classificadosPorGrupo: number
  turnoRetorno: boolean
  aceitouComplemento: boolean
  onSetTimesPorGrupo: (v: number) => void
  onSetClassificadosPorGrupo: (v: number) => void
  onSetTurnoRetorno: (v: boolean) => void
  onSetAceitouComplemento: (v: boolean) => void
}

export default function StepGrupos({
  totalTimes,
  timesPorGrupo,
  classificadosPorGrupo,
  turnoRetorno,
  aceitouComplemento,
  onSetTimesPorGrupo,
  onSetClassificadosPorGrupo,
  onSetTurnoRetorno,
  onSetAceitouComplemento,
}: StepGruposProps) {
  const divisores = divisoresValidosParaGrupo(totalTimes)
  const numGrupos = timesPorGrupo > 0 ? totalTimes / timesPorGrupo : 0

  const bracketInfo = timesPorGrupo > 0 && classificadosPorGrupo > 0
    ? calcularInfoBracket(numGrupos, classificadosPorGrupo)
    : null

  const partidasGrupo = timesPorGrupo > 0 && numGrupos > 0
    ? totalPartidasGrupos(numGrupos, timesPorGrupo, turnoRetorno)
    : 0

  const rodadasGrupo = timesPorGrupo > 0
    ? totalRodadasGrupos(timesPorGrupo, turnoRetorno)
    : 0

  return (
    <div>
      <h2 className="mb-1 font-headline text-lg font-bold text-on-surface">
        Configuração dos grupos
      </h2>
      <p className="mb-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        Defina a estrutura da fase de grupos
      </p>

      <div className="space-y-5">
        {/* Times por grupo */}
        <div>
          <label className="mb-1.5 block font-title text-sm font-medium text-on-surface">
            Times por grupo
          </label>
          {divisores.length === 0 ? (
            <p className="text-xs text-error">
              Nenhuma configuração válida para {totalTimes} times. O total deve ser divisível por pelo menos 3.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {divisores.map((d) => {
                const grupos = totalTimes / d
                const isSelected = timesPorGrupo === d
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onSetTimesPorGrupo(d)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1.5px] shadow-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high/50'
                    }`}
                  >
                    {d} times ({grupos} grupo{grupos > 1 ? 's' : ''})
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Classificados por grupo */}
        {timesPorGrupo > 0 && (
          <div>
            <label className="mb-1.5 block font-title text-sm font-medium text-on-surface">
              Classificados por grupo
            </label>
            <p className="mb-2 text-[10px] text-on-surface-variant">
              Quantos times de cada grupo avançam para o mata-mata
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: timesPorGrupo - 1 }, (_, i) => i + 1).map((n) => {
                const isSelected = classificadosPorGrupo === n
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onSetClassificadosPorGrupo(n)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1.5px] shadow-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high/50'
                    }`}
                  >
                    Top {n}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Turno / Returno */}
        {timesPorGrupo > 0 && (
          <div>
            <label className="mb-1.5 block font-title text-sm font-medium text-on-surface">
              Formato da fase de grupos
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSetTurnoRetorno(false)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  !turnoRetorno
                    ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1.5px] shadow-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high/50'
                }`}
              >
                Turno único
              </button>
              <button
                type="button"
                onClick={() => onSetTurnoRetorno(true)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  turnoRetorno
                    ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1.5px] shadow-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high/50'
                }`}
              >
                Turno e returno
              </button>
            </div>
          </div>
        )}

        {/* Info panel */}
        {bracketInfo && (
          <div className="rounded-xl bg-surface-container-low p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="font-medium text-on-surface">Fase de grupos:</span>
              {numGrupos} grupo{numGrupos > 1 ? 's' : ''} de {timesPorGrupo} times
              — {partidasGrupo} partida{partidasGrupo !== 1 ? 's' : ''} em {rodadasGrupo} rodada{rodadasGrupo !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="font-medium text-on-surface">Mata-mata:</span>
              {bracketInfo.totalClassificadosDiretos} classificado{bracketInfo.totalClassificadosDiretos !== 1 ? 's' : ''} direto{bracketInfo.totalClassificadosDiretos !== 1 ? 's' : ''}
              → bracket de {bracketInfo.bracketSlots}
            </div>
          </div>
        )}

        {/* Alerta de complemento */}
        {bracketInfo && bracketInfo.melhoresRestantes > 0 && (
          <div className="rounded-xl bg-tertiary-container/20 p-4">
            <p className="text-xs text-on-surface">
              <span className="font-bold">Atenção:</span> {bracketInfo.totalClassificadosDiretos} classificados diretos não preenchem o bracket de {bracketInfo.bracketSlots}.
              {' '}{bracketInfo.melhoresRestantes} vaga{bracketInfo.melhoresRestantes > 1 ? 's' : ''} restante{bracketInfo.melhoresRestantes > 1 ? 's' : ''} ser{bracketInfo.melhoresRestantes > 1 ? 'ão' : 'á'} preenchida{bracketInfo.melhoresRestantes > 1 ? 's' : ''} pelos melhores {labelPosicaoComplemento(classificadosPorGrupo)}s entre todos os grupos.
            </p>
            <label className="mt-3 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aceitouComplemento}
                onChange={(e) => onSetAceitouComplemento(e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              <span className="text-xs font-medium text-on-surface">
                Aceitar complemento com melhores {labelPosicaoComplemento(classificadosPorGrupo)}s
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
