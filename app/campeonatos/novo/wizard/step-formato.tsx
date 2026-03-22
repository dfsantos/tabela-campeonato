import type { CampeonatoFormato } from '@/lib/types'

interface StepFormatoProps {
  formato: CampeonatoFormato | null
  onSelect: (formato: CampeonatoFormato) => void
}

const formatos: Array<{
  value: CampeonatoFormato
  title: string
  description: string
  icon: React.ReactNode
  emBreve?: boolean
}> = [
  {
    value: 'liga',
    title: 'Liga',
    description: 'Todos contra todos em turno e returno. A classificação é por pontos corridos.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 16H22M16 10V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11.5 11.5L20.5 20.5M20.5 11.5L11.5 20.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    value: 'copa_grupos',
    title: 'Copa (Grupos + Mata-mata)',
    description: 'Fase de grupos seguida de eliminatórias até a final.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="6" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 14V20H23V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 20V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="27" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: 'copa_mata_mata',
    title: 'Copa (Mata-mata)',
    description: 'Eliminatórias diretas desde a primeira rodada até a final.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 8H12V12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 20H12V24H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 10H18V22H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d="M18 16H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="27" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
]

export default function StepFormato({ formato, onSelect }: StepFormatoProps) {
  return (
    <div>
      <h2 className="mb-1 font-headline text-lg font-bold text-on-surface">
        Formato do campeonato
      </h2>
      <p className="mb-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        Selecione como o campeonato será disputado
      </p>

      <div className="flex flex-col gap-2">
        {formatos.map((f) => {
          const isSelected = formato === f.value

          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onSelect(f.value)}
              className={`flex items-start gap-4 rounded-xl px-5 py-4 text-left transition-colors ${
                isSelected
                  ? 'bg-primary/5 shadow-[inset_4px_0_0_0] shadow-primary'
                  : 'bg-surface-container-lowest hover:bg-surface-container-high/30'
              }`}
            >
              <span className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                {f.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-headline text-sm font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                    {f.title}
                  </span>
                  {f.emBreve && (
                    <span className="rounded-full bg-surface-container-low px-2 py-0.5 font-label text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Em breve
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {f.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
