interface StepZonasProps {
  zonaCampeao: boolean
  zonaElite: string
  zonaSegundo: string
  zonaRebaixamento: string
  zonaError: string | null
  onSetZonaCampeao: (value: boolean) => void
  onSetZonaElite: (value: string) => void
  onSetZonaSegundo: (value: string) => void
  onSetZonaRebaixamento: (value: string) => void
}

export default function StepZonas({
  zonaCampeao,
  zonaElite,
  zonaSegundo,
  zonaRebaixamento,
  zonaError,
  onSetZonaCampeao,
  onSetZonaElite,
  onSetZonaSegundo,
  onSetZonaRebaixamento,
}: StepZonasProps) {
  return (
    <div>
      <h2 className="mb-1 font-headline text-lg font-bold text-on-surface">
        Zonas de classificação
      </h2>
      <p className="mb-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        Configure as faixas visuais da tabela (opcional)
      </p>

      <div className="space-y-3 rounded-lg bg-surface-container-low p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={zonaCampeao}
            onChange={(e) => onSetZonaCampeao(e.target.checked)}
            className="h-4 w-4 rounded accent-primary"
          />
          <span className="flex items-center gap-2 text-sm text-on-surface">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Destaque para campeão (posição 1)
          </span>
        </label>

        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
          <label className="flex flex-1 items-center gap-2 text-sm text-on-surface">
            <span className="w-28 flex-shrink-0">Elite (até pos.):</span>
            <input
              type="number"
              min="1"
              value={zonaElite}
              onChange={(e) => onSetZonaElite(e.target.value)}
              placeholder="—"
              className="w-20 rounded-md border-none bg-surface-container-lowest px-2 py-1 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
            {zonaElite && <span className="font-label text-[10px] text-on-surface-variant">pos. 1–{zonaElite}</span>}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sky-500" />
          <label className="flex flex-1 items-center gap-2 text-sm text-on-surface">
            <span className="w-28 flex-shrink-0">2º Pelotão (até pos.):</span>
            <input
              type="number"
              min="1"
              value={zonaSegundo}
              onChange={(e) => onSetZonaSegundo(e.target.value)}
              placeholder="—"
              className="w-20 rounded-md border-none bg-surface-container-lowest px-2 py-1 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
            {zonaSegundo && zonaElite && <span className="font-label text-[10px] text-on-surface-variant">pos. {Number(zonaElite) + 1}–{zonaSegundo}</span>}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-error" />
          <label className="flex flex-1 items-center gap-2 text-sm text-on-surface">
            <span className="w-28 flex-shrink-0">Rebaixamento:</span>
            <input
              type="number"
              min="1"
              value={zonaRebaixamento}
              onChange={(e) => onSetZonaRebaixamento(e.target.value)}
              placeholder="—"
              className="w-20 rounded-md border-none bg-surface-container-lowest px-2 py-1 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="font-label text-[10px] text-on-surface-variant">últimos times</span>
          </label>
        </div>

        {zonaError && (
          <p className="font-label text-[10px] text-error">{zonaError}</p>
        )}
      </div>
    </div>
  )
}
