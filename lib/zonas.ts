import type { Zonas } from './types'

export type ZonaName = 'campeao' | 'elite' | 'segundoPelotao' | 'rebaixamento' | null

export function getZona(posicao: number, totalTimes: number, zonas: Zonas | undefined): ZonaName {
  if (!zonas) return null
  if (zonas.campeao && posicao === 1) return 'campeao'
  if (zonas.elite && posicao <= zonas.elite) return 'elite'
  const eliteCount = zonas.elite ?? 0
  if (zonas.segundoPelotao && posicao > eliteCount && posicao <= zonas.segundoPelotao) return 'segundoPelotao'
  if (zonas.rebaixamento && posicao > totalTimes - zonas.rebaixamento) return 'rebaixamento'
  return null
}

export const zonaTextClass: Record<NonNullable<ZonaName>, string> = {
  campeao:        'text-amber-600 font-bold',
  elite:          'text-primary font-semibold',
  segundoPelotao: 'text-sky-600 font-semibold',
  rebaixamento:   'text-error font-semibold',
}

export const zonaBorderClass: Record<NonNullable<ZonaName>, string> = {
  campeao:        'border-l-4 border-amber-500 bg-amber-50/30',
  elite:          'border-l-4 border-primary bg-primary-fixed/10',
  segundoPelotao: 'border-l-4 border-sky-500 bg-sky-50/30',
  rebaixamento:   'border-l-4 border-error bg-error-container/20',
}

export function validateZonas(zonas: Zonas, totalTimes: number): string | null {
  const elite = zonas.elite ?? 0
  const segundo = zonas.segundoPelotao ?? 0
  const rebaixamento = zonas.rebaixamento ?? 0
  if (segundo && elite && segundo <= elite) {
    return `2º Pelotão (pos. ${segundo}) deve ser maior que Elite (pos. ${elite})`
  }
  const lastZonedPos = segundo || elite
  if (rebaixamento && lastZonedPos && lastZonedPos + rebaixamento > totalTimes) {
    return `Zonas se sobrepõem: pos. ${lastZonedPos} + ${rebaixamento} rebaixados > ${totalTimes} times`
  }
  if (elite > totalTimes) {
    return `Elite (pos. ${elite}) excede o número de times (${totalTimes})`
  }
  if (segundo > totalTimes) {
    return `2º Pelotão (pos. ${segundo}) excede o número de times (${totalTimes})`
  }
  return null
}
