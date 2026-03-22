import type { Partida } from './types'

export function proximaPotenciaDe2(n: number): number {
  let v = 1
  while (v < n) v *= 2
  return v
}

export function totalRodadasFromSlots(slots: number): number {
  return Math.log2(slots)
}

export function nomeFase(rodada: number, totalRodadas: number): string {
  const distanciaDoFinal = totalRodadas - rodada
  switch (distanciaDoFinal) {
    case 0:
      return 'Final'
    case 1:
      return 'Semifinal'
    case 2:
      return 'Quartas de final'
    case 3:
      return 'Oitavas de final'
    default:
      return `Rodada ${rodada}`
  }
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Calcula quais posições da rodada 1 são byes.
 * Byes são distribuídos uniformemente nas primeiras posições do bracket.
 * Retorna um Set com as posições (1-indexed) que são bye.
 */
export function calcularByeSlots(numTimes: number, totalSlots: number): Set<number> {
  const numByes = totalSlots - numTimes
  const byePositions = new Set<number>()

  // Distribui byes nas primeiras posições para que times com bye
  // fiquem espalhados pelo bracket
  for (let i = 1; i <= numByes; i++) {
    byePositions.add(i)
  }

  return byePositions
}

/**
 * Retorna o ID do time vencedor de uma partida finalizada.
 * - Gols diferentes: quem fez mais gols vence
 * - Gols iguais + pênaltis: quem ganhou nos pênaltis
 * - Caso contrário: null (não decidido)
 */
export function getVencedor(partida: Partida): string | null {
  if (partida.status !== 'finalizada') return null
  if (partida.golsMandante == null || partida.golsVisitante == null) return null

  if (partida.golsMandante > partida.golsVisitante) return partida.mandante.id
  if (partida.golsVisitante > partida.golsMandante) return partida.visitante.id

  // Empate no tempo normal — verificar pênaltis
  if (partida.penaltisMandante != null && partida.penaltisVisitante != null) {
    if (partida.penaltisMandante > partida.penaltisVisitante) return partida.mandante.id
    if (partida.penaltisVisitante > partida.penaltisMandante) return partida.visitante.id
  }

  return null
}

/**
 * Gera os labels das fases do torneio.
 * Ex: para 8 slots (3 rodadas): ["Quartas de final", "Semifinal", "Final"]
 */
export function gerarLabelsFases(totalRodadas: number): string[] {
  const labels: string[] = []
  for (let r = 1; r <= totalRodadas; r++) {
    labels.push(nomeFase(r, totalRodadas))
  }
  return labels
}
