import type { Time } from '@/lib/types'

interface StepParticipantesProps {
  nome: string
  temporada: string
  selectedTimeIds: Set<string>
  filtroNome: string
  timesFiltrados: Time[]
  selectedCount: number
  formato: string | null
  onSetNome: (nome: string) => void
  onSetTemporada: (temporada: string) => void
  onToggleTime: (id: string) => void
  onSetFiltro: (filtro: string) => void
}

export default function StepParticipantes({
  nome,
  temporada,
  selectedTimeIds,
  filtroNome,
  timesFiltrados,
  selectedCount,
  formato,
  onSetNome,
  onSetTemporada,
  onToggleTime,
  onSetFiltro,
}: StepParticipantesProps) {
  return (
    <div>
      <h2 className="mb-1 font-headline text-lg font-bold text-on-surface">
        Dados e participantes
      </h2>
      <p className="mb-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        Preencha o nome, temporada e selecione os times
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="nome"
            className="mb-1.5 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
          >
            Nome
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => onSetNome(e.target.value)}
            placeholder="Ex: Campeonato Municipal"
            className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="temporada"
            className="mb-1.5 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
          >
            Temporada
          </label>
          <input
            id="temporada"
            type="text"
            value={temporada}
            onChange={(e) => onSetTemporada(e.target.value)}
            placeholder="Ex: 2025"
            className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Times participantes
            </span>
            <span className="font-label text-[10px] text-on-surface-variant">
              {selectedCount} {selectedCount === 1 ? 'time selecionado' : 'times selecionados'}
            </span>
          </div>
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => onSetFiltro(e.target.value)}
            placeholder="Buscar time pelo nome…"
            className="mb-2 w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
          />
          <div className="max-h-64 overflow-y-auto overflow-hidden rounded-lg bg-surface-container-low">
            {timesFiltrados.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-on-surface-variant">
                Nenhum time encontrado
              </p>
            ) : (
              <div className="flex flex-col gap-0.5 p-1">
                {timesFiltrados.map((time) => (
                  <label
                    key={time.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-container"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTimeIds.has(time.id)}
                      onChange={() => onToggleTime(time.id)}
                      disabled={!selectedTimeIds.has(time.id) && selectedCount >= 24}
                      className="h-4 w-4 rounded accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div>
                      <span className="text-sm text-on-surface">{time.nome}</span>
                      {time.cidade && (
                        <span className="ml-1.5 font-label text-[10px] text-on-surface-variant">{time.cidade}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedCount === 1 && (
            <p className="mt-1.5 font-label text-[10px] text-on-surface-variant">
              Selecione ao menos 1 time adicional
            </p>
          )}
          {selectedCount > 24 && (
            <p className="mt-1.5 font-label text-[10px] text-error">
              Máximo de 24 times atingido
            </p>
          )}
        </div>

        {formato === 'liga' && selectedCount >= 2 && (
          <p className="font-label text-[10px] text-on-surface-variant">
            {selectedCount * (selectedCount - 1)} partidas em{' '}
            {selectedCount % 2 === 0
              ? 2 * (selectedCount - 1)
              : 2 * selectedCount}{' '}
            rodadas serão geradas automaticamente.
          </p>
        )}
      </div>
    </div>
  )
}
