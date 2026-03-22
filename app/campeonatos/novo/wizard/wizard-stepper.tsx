interface Step {
  label: string
}

interface WizardStepperProps {
  steps: Step[]
  currentStep: number
  onGoToStep: (step: number) => void
}

export default function WizardStepper({ steps, currentStep, onGoToStep }: WizardStepperProps) {
  return (
    <nav className="mb-8 flex items-center justify-center gap-0" aria-label="Progresso">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep
        const isFuture = i > currentStep

        return (
          <div key={i} className="flex items-center">
            <button
              type="button"
              onClick={() => isCompleted && onGoToStep(i)}
              disabled={!isCompleted}
              className={`flex items-center gap-2 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full font-headline text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-primary text-on-primary'
                    : isCurrent
                      ? 'bg-surface-container-lowest text-primary ring-2 ring-primary'
                      : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`hidden font-label text-[10px] font-bold uppercase tracking-widest sm:inline ${
                  isCurrent
                    ? 'text-primary'
                    : isFuture
                      ? 'text-on-surface-variant/50'
                      : 'text-on-surface-variant'
                }`}
              >
                {step.label}
              </span>
            </button>

            {i < steps.length - 1 && (
              <div
                className={`mx-3 h-px w-8 sm:w-12 ${
                  i < currentStep ? 'bg-primary' : 'bg-outline-variant/30'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
