import type { Zonas } from './fake-data'

export type ZonaName = 'campeao' | 'elite' | 'segundoPelotao' | 'rebaixamento' | null

export function getZona(posicao: number, totalTimes: number, zonas: Zonas | undefined): ZonaName {
  if (!zonas) return null
  if (zonas.campeao && posicao === 1) return 'campeao'
  if (zonas.elite && posicao <= zonas.elite) return 'elite'
  const eliteCount = zonas.elite ?? 0
  if (zonas.segundoPelotao && posicao > eliteCount && posicao <= eliteCount + zonas.segundoPelotao) return 'segundoPelotao'
  if (zonas.rebaixamento && posicao > totalTimes - zonas.rebaixamento) return 'rebaixamento'
  return null
}

export const zonaTextClass: Record<NonNullable<ZonaName>, string> = {
  campeao:        'text-amber-500 font-semibold',
  elite:          'text-emerald-500',
  segundoPelotao: 'text-sky-500',
  rebaixamento:   'text-red-500',
}

export function validateZonas(zonas: Zonas, totalTimes: number): string | null {
  const elite = zonas.elite ?? 0
  const segundo = zonas.segundoPelotao ?? 0
  const rebaixamento = zonas.rebaixamento ?? 0
  if (elite + segundo + rebaixamento > totalTimes) {
    return `A soma das zonas (${elite + segundo + rebaixamento}) não pode exceder o número de times (${totalTimes})`
  }
  return null
}
