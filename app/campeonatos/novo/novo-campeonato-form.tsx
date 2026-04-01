'use client'

import Link from 'next/link'
import { useReducer, useEffect, useMemo, useCallback } from 'react'
import { useFormStatus } from 'react-dom'
import type { CampeonatoFormato, Time } from '@/lib/types'
import { criarCampeonatoAction } from '@/lib/actions'
import WizardStepper from './wizard/wizard-stepper'
import StepFormato from './wizard/step-formato'
import StepParticipantes from './wizard/step-participantes'
import StepZonas from './wizard/step-zonas'
import StepGrupos from './wizard/step-grupos'
import StepResumo from './wizard/step-resumo'

type WizardState = {
  currentStep: number
  formato: CampeonatoFormato | null
  nome: string
  temporada: string
  selectedTimeIds: Set<string>
  filtroNome: string
  filtroAtivo: string
  zonaCampeao: boolean
  zonaElite: string
  zonaSegundo: string
  zonaRebaixamento: string
  timesPorGrupo: number
  classificadosPorGrupo: number
  turnoRetorno: boolean
  aceitouComplemento: boolean
  exibirSorteio: boolean
}

type WizardAction =
  | { type: 'SET_FORMATO'; formato: CampeonatoFormato }
  | { type: 'SET_FIELD'; field: 'nome' | 'temporada'; value: string }
  | { type: 'TOGGLE_TIME'; id: string }
  | { type: 'SET_FILTRO'; value: string }
  | { type: 'SET_FILTRO_ATIVO'; value: string }
  | { type: 'SET_ZONA_CAMPEAO'; value: boolean }
  | { type: 'SET_ZONA_ELITE'; value: string }
  | { type: 'SET_ZONA_SEGUNDO'; value: string }
  | { type: 'SET_ZONA_REBAIXAMENTO'; value: string }
  | { type: 'SET_TIMES_POR_GRUPO'; value: number }
  | { type: 'SET_CLASSIFICADOS_POR_GRUPO'; value: number }
  | { type: 'SET_TURNO_RETORNO'; value: boolean }
  | { type: 'SET_ACEITOU_COMPLEMENTO'; value: boolean }
  | { type: 'SET_EXIBIR_SORTEIO'; value: boolean }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }

const initialState: WizardState = {
  currentStep: 0,
  formato: null,
  nome: '',
  temporada: '',
  selectedTimeIds: new Set(),
  filtroNome: '',
  filtroAtivo: '',
  zonaCampeao: false,
  zonaElite: '',
  zonaSegundo: '',
  zonaRebaixamento: '',
  timesPorGrupo: 0,
  classificadosPorGrupo: 0,
  turnoRetorno: false,
  aceitouComplemento: false,
  exibirSorteio: true,
}

function getTotalSteps(formato: CampeonatoFormato | null): number {
  if (formato === 'liga') return 4
  if (formato === 'copa_grupos') return 4
  return 3
}

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_FORMATO': {
      const newTotal = getTotalSteps(action.formato)
      return {
        ...state,
        formato: action.formato,
        currentStep: Math.min(state.currentStep, newTotal - 1),
      }
    }
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'TOGGLE_TIME': {
      const next = new Set(state.selectedTimeIds)
      if (next.has(action.id)) {
        next.delete(action.id)
      } else {
        next.add(action.id)
      }
      return { ...state, selectedTimeIds: next }
    }
    case 'SET_FILTRO':
      return { ...state, filtroNome: action.value }
    case 'SET_FILTRO_ATIVO':
      return { ...state, filtroAtivo: action.value }
    case 'SET_ZONA_CAMPEAO':
      return { ...state, zonaCampeao: action.value }
    case 'SET_ZONA_ELITE':
      return { ...state, zonaElite: action.value }
    case 'SET_ZONA_SEGUNDO':
      return { ...state, zonaSegundo: action.value }
    case 'SET_ZONA_REBAIXAMENTO':
      return { ...state, zonaRebaixamento: action.value }
    case 'SET_TIMES_POR_GRUPO':
      return { ...state, timesPorGrupo: action.value, classificadosPorGrupo: 0, aceitouComplemento: false }
    case 'SET_CLASSIFICADOS_POR_GRUPO':
      return { ...state, classificadosPorGrupo: action.value, aceitouComplemento: false }
    case 'SET_TURNO_RETORNO':
      return { ...state, turnoRetorno: action.value }
    case 'SET_ACEITOU_COMPLEMENTO':
      return { ...state, aceitouComplemento: action.value }
    case 'SET_EXIBIR_SORTEIO':
      return { ...state, exibirSorteio: action.value }
    case 'NEXT_STEP': {
      const max = getTotalSteps(state.formato) - 1
      return { ...state, currentStep: Math.min(state.currentStep + 1, max) }
    }
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) }
    case 'GO_TO_STEP':
      return { ...state, currentStep: Math.max(0, Math.min(action.step, getTotalSteps(state.formato) - 1)) }
    default:
      return state
  }
}

// Step identifiers for dynamic step mapping
type StepId = 'formato' | 'participantes' | 'zonas' | 'grupos' | 'resumo'

function getStepIds(formato: CampeonatoFormato | null): StepId[] {
  if (formato === 'liga') return ['formato', 'participantes', 'zonas', 'resumo']
  if (formato === 'copa_grupos') return ['formato', 'participantes', 'grupos', 'resumo']
  return ['formato', 'participantes', 'resumo']
}

function getStepLabels(stepIds: StepId[]): Array<{ label: string }> {
  const labels: Record<StepId, string> = {
    formato: 'Formato',
    participantes: 'Participantes',
    zonas: 'Zonas',
    grupos: 'Grupos',
    resumo: 'Resumo',
  }
  return stepIds.map((id) => ({ label: labels[id] }))
}

function proximaPotenciaDe2Internal(n: number): number {
  let v = 1
  while (v < n) v *= 2
  return v
}

function SubmitButton({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={!canSubmit || pending}
      className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
    >
      {pending ? 'Criando...' : 'Criar campeonato'}
    </button>
  )
}

export default function NovoCampeonatoForm({ times }: { times: Time[] }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Debounced filter
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_FILTRO_ATIVO', value: state.filtroNome })
    }, 300)
    return () => clearTimeout(timer)
  }, [state.filtroNome])

  const selectedCount = state.selectedTimeIds.size

  const zonaError = useMemo(() => {
    const e = Number(state.zonaElite) || 0
    const s = Number(state.zonaSegundo) || 0
    const r = Number(state.zonaRebaixamento) || 0
    if (s && e && s <= e) return `2º Pelotão (pos. ${s}) deve ser maior que Elite (pos. ${e})`
    const lastZonedPos = s || e
    if (r && lastZonedPos && lastZonedPos + r > selectedCount) return `Zonas se sobrepõem: pos. ${lastZonedPos} + ${r} rebaixados > ${selectedCount} times`
    if (e > selectedCount) return `Elite (pos. ${e}) excede o número de times (${selectedCount})`
    if (s > selectedCount) return `2º Pelotão (pos. ${s}) excede o número de times (${selectedCount})`
    return null
  }, [state.zonaElite, state.zonaSegundo, state.zonaRebaixamento, selectedCount])

  const timesFiltrados = state.filtroAtivo.trim().length >= 3
    ? times.filter(t => t.nome.toLowerCase().includes(state.filtroAtivo.trim().toLowerCase()))
    : times

  const stepIds = getStepIds(state.formato)
  const currentStepId = stepIds[state.currentStep]

  // Validation per step
  const canAdvanceFromStep = useCallback((stepId: StepId): boolean => {
    switch (stepId) {
      case 'formato':
        return state.formato !== null
      case 'participantes': {
        const minTimes = state.formato === 'copa_grupos' ? 6 : 2
        const MAX_TIMES_POR_FORMATO = { liga: 24, copa_mata_mata: 126, copa_grupos: 48 } as const
        const maxTimes = MAX_TIMES_POR_FORMATO[state.formato ?? 'liga'] ?? 24
        return state.nome.trim().length > 0 && state.temporada.trim().length > 0 && selectedCount >= minTimes && selectedCount <= maxTimes
      }
      case 'zonas':
        return !zonaError
      case 'grupos': {
        if (state.timesPorGrupo < 3) return false
        if (selectedCount % state.timesPorGrupo !== 0) return false
        if (state.classificadosPorGrupo < 1 || state.classificadosPorGrupo >= state.timesPorGrupo) return false
        // Se precisa de complemento, usuário deve aceitar
        const numGrupos = selectedCount / state.timesPorGrupo
        const totalClassificados = numGrupos * state.classificadosPorGrupo
        const bracketSlots = proximaPotenciaDe2Internal(totalClassificados)
        const complemento = bracketSlots - totalClassificados
        if (complemento > 0 && !state.aceitouComplemento) return false
        return true
      }
      case 'resumo':
        return state.formato === 'liga' || state.formato === 'copa_mata_mata' || state.formato === 'copa_grupos'
      default:
        return false
    }
  }, [state.formato, state.nome, state.temporada, selectedCount, zonaError, state.timesPorGrupo, state.classificadosPorGrupo, state.aceitouComplemento])

  const canAdvance = canAdvanceFromStep(currentStepId)
  const isLastStep = currentStepId === 'resumo'
  const MAX_TIMES_POR_FORMATO = { liga: 24, copa_mata_mata: 126, copa_grupos: 48 } as const
  const maxTimesSubmit = MAX_TIMES_POR_FORMATO[state.formato ?? 'liga'] ?? 24
  const canSubmit = isLastStep && canAdvanceFromStep('resumo') && state.nome.trim().length > 0 && state.temporada.trim().length > 0 && selectedCount >= 2 && selectedCount <= maxTimesSubmit && (state.formato !== 'liga' || !zonaError)

  const handleNext = () => {
    if (canAdvance && !isLastStep) {
      dispatch({ type: 'NEXT_STEP' })
    }
  }

  const handlePrev = () => {
    dispatch({ type: 'PREV_STEP' })
  }

  const handleGoToStep = (step: number) => {
    if (step < state.currentStep) {
      dispatch({ type: 'GO_TO_STEP', step })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLastStep) {
      e.preventDefault()
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <nav className="mb-6 font-label text-xs text-on-surface-variant">
        <Link href="/" className="transition-colors hover:text-primary">Campeonatos</Link>
        <span className="mx-1.5">/</span>
        <span className="text-on-surface">Novo campeonato</span>
      </nav>

      <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[0_4px_32px_rgba(20,27,43,0.06)]">
        <h1 className="mb-6 font-headline text-lg font-bold text-on-surface">
          Novo campeonato
        </h1>

        <WizardStepper
          steps={getStepLabels(stepIds)}
          currentStep={state.currentStep}
          onGoToStep={handleGoToStep}
        />

        <form action={criarCampeonatoAction} onKeyDown={handleKeyDown}>
          {/* Hidden inputs carry all data for submission */}
          <input type="hidden" name="formato" value={state.formato ?? ''} />
          <input type="hidden" name="nome" value={state.nome} />
          <input type="hidden" name="temporada" value={state.temporada} />
          {Array.from(state.selectedTimeIds).map((id) => (
            <input key={id} type="hidden" name="timeIds" value={id} />
          ))}
          {state.zonaCampeao && <input type="hidden" name="zonaCampeao" value="on" />}
          {state.zonaElite && <input type="hidden" name="zonaElite" value={state.zonaElite} />}
          {state.zonaSegundo && <input type="hidden" name="zonaSegundoPelotao" value={state.zonaSegundo} />}
          {state.zonaRebaixamento && <input type="hidden" name="zonaRebaixamento" value={state.zonaRebaixamento} />}
          {state.exibirSorteio && (state.formato === 'copa_mata_mata' || state.formato === 'copa_grupos') && (
            <input type="hidden" name="exibirSorteio" value="on" />
          )}
          {state.formato === 'copa_grupos' && (
            <>
              <input type="hidden" name="timesPorGrupo" value={state.timesPorGrupo} />
              <input type="hidden" name="classificadosPorGrupo" value={state.classificadosPorGrupo} />
              <input type="hidden" name="melhoresRestantes" value={
                state.timesPorGrupo > 0 && state.classificadosPorGrupo > 0
                  ? proximaPotenciaDe2Internal((selectedCount / state.timesPorGrupo) * state.classificadosPorGrupo) - (selectedCount / state.timesPorGrupo) * state.classificadosPorGrupo
                  : 0
              } />
              {state.turnoRetorno && <input type="hidden" name="turnoRetorno" value="on" />}
            </>
          )}

          {/* Step content */}
          <div className="min-h-[320px]">
            {currentStepId === 'formato' && (
              <StepFormato
                formato={state.formato}
                onSelect={(f) => dispatch({ type: 'SET_FORMATO', formato: f })}
              />
            )}

            {currentStepId === 'participantes' && (
              <StepParticipantes
                nome={state.nome}
                temporada={state.temporada}
                selectedTimeIds={state.selectedTimeIds}
                filtroNome={state.filtroNome}
                timesFiltrados={timesFiltrados}
                selectedCount={selectedCount}
                formato={state.formato}
                onSetNome={(v) => dispatch({ type: 'SET_FIELD', field: 'nome', value: v })}
                onSetTemporada={(v) => dispatch({ type: 'SET_FIELD', field: 'temporada', value: v })}
                onToggleTime={(id) => dispatch({ type: 'TOGGLE_TIME', id })}
                onSetFiltro={(v) => dispatch({ type: 'SET_FILTRO', value: v })}
              />
            )}

            {currentStepId === 'zonas' && (
              <StepZonas
                zonaCampeao={state.zonaCampeao}
                zonaElite={state.zonaElite}
                zonaSegundo={state.zonaSegundo}
                zonaRebaixamento={state.zonaRebaixamento}
                zonaError={zonaError}
                onSetZonaCampeao={(v) => dispatch({ type: 'SET_ZONA_CAMPEAO', value: v })}
                onSetZonaElite={(v) => dispatch({ type: 'SET_ZONA_ELITE', value: v })}
                onSetZonaSegundo={(v) => dispatch({ type: 'SET_ZONA_SEGUNDO', value: v })}
                onSetZonaRebaixamento={(v) => dispatch({ type: 'SET_ZONA_REBAIXAMENTO', value: v })}
              />
            )}

            {currentStepId === 'grupos' && (
              <StepGrupos
                totalTimes={selectedCount}
                timesPorGrupo={state.timesPorGrupo}
                classificadosPorGrupo={state.classificadosPorGrupo}
                turnoRetorno={state.turnoRetorno}
                aceitouComplemento={state.aceitouComplemento}
                onSetTimesPorGrupo={(v) => dispatch({ type: 'SET_TIMES_POR_GRUPO', value: v })}
                onSetClassificadosPorGrupo={(v) => dispatch({ type: 'SET_CLASSIFICADOS_POR_GRUPO', value: v })}
                onSetTurnoRetorno={(v) => dispatch({ type: 'SET_TURNO_RETORNO', value: v })}
                onSetAceitouComplemento={(v) => dispatch({ type: 'SET_ACEITOU_COMPLEMENTO', value: v })}
              />
            )}

            {currentStepId === 'resumo' && (
              <StepResumo
                formato={state.formato}
                nome={state.nome}
                temporada={state.temporada}
                selectedTimeIds={state.selectedTimeIds}
                times={times}
                zonaCampeao={state.zonaCampeao}
                zonaElite={state.zonaElite}
                zonaSegundo={state.zonaSegundo}
                zonaRebaixamento={state.zonaRebaixamento}
                timesPorGrupo={state.timesPorGrupo}
                classificadosPorGrupo={state.classificadosPorGrupo}
                turnoRetorno={state.turnoRetorno}
                exibirSorteio={state.exibirSorteio}
                onSetExibirSorteio={(v) => dispatch({ type: 'SET_EXIBIR_SORTEIO', value: v })}
                onGoToStep={handleGoToStep}
              />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center gap-3">
            {state.currentStep === 0 ? (
              <Link
                href="/"
                className="rounded-lg bg-secondary-container px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-surface-container-high"
              >
                Cancelar
              </Link>
            ) : (
              <button
                type="button"
                onClick={handlePrev}
                className="rounded-lg bg-secondary-container px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-surface-container-high"
              >
                Voltar
              </button>
            )}

            <div className="flex-1" />

            {isLastStep ? (
              <SubmitButton canSubmit={canSubmit} />
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance}
                className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                Próximo
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
