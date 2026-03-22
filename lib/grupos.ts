import type { ClassificacaoItem } from './types'
import { proximaPotenciaDe2 } from './mata-mata'

/**
 * Retorna o nome do grupo a partir do índice (0-indexed).
 * Ex: 0 → "Grupo A", 1 → "Grupo B", ...
 */
export function nomeGrupo(index: number): string {
  return `Grupo ${String.fromCharCode(65 + index)}`
}

/**
 * Retorna a letra do grupo a partir do índice.
 * Ex: 0 → "A", 1 → "B", ...
 */
export function letraGrupo(index: number): string {
  return String.fromCharCode(65 + index)
}

/**
 * Distribui times aleatoriamente em grupos de tamanho fixo.
 * Exige divisão exata: timeIds.length % timesPorGrupo === 0.
 * Retorna array de arrays (cada sub-array = um grupo).
 */
export function distribuirTimesEmGrupos(
  timeIds: string[],
  timesPorGrupo: number,
): string[][] {
  if (timeIds.length % timesPorGrupo !== 0) {
    throw new Error(`Total de times (${timeIds.length}) não divide igualmente por ${timesPorGrupo} times por grupo`)
  }

  // Shuffle Fisher-Yates
  const shuffled = [...timeIds]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const numGrupos = shuffled.length / timesPorGrupo
  const grupos: string[][] = []
  for (let g = 0; g < numGrupos; g++) {
    grupos.push(shuffled.slice(g * timesPorGrupo, (g + 1) * timesPorGrupo))
  }

  return grupos
}

/**
 * Calcula os divisores válidos para o tamanho de grupo.
 * Retorna apenas valores >= 3 que dividem exatamente o total de times.
 */
export function divisoresValidosParaGrupo(totalTimes: number): number[] {
  const divisores: number[] = []
  for (let d = 3; d <= Math.floor(totalTimes / 2); d++) {
    if (totalTimes % d === 0) {
      divisores.push(d)
    }
  }
  return divisores
}

/**
 * Calcula informações do bracket eliminatório a partir da configuração de grupos.
 */
export function calcularInfoBracket(
  numGrupos: number,
  classificadosPorGrupo: number,
): {
  totalClassificadosDiretos: number
  bracketSlots: number
  melhoresRestantes: number
} {
  const totalClassificadosDiretos = numGrupos * classificadosPorGrupo
  const bracketSlots = proximaPotenciaDe2(totalClassificadosDiretos)
  const melhoresRestantes = bracketSlots - totalClassificadosDiretos

  return { totalClassificadosDiretos, bracketSlots, melhoresRestantes }
}

/**
 * Seleciona os N melhores times não classificados diretamente, entre todos os grupos.
 * Critério: pontos → vitórias → saldo de gols → gols pró (mesmo da classificação geral).
 */
export function selecionarMelhoresRestantes(
  gruposClassificacao: ClassificacaoItem[][],
  classificadosPorGrupo: number,
  quantidade: number,
): ClassificacaoItem[] {
  if (quantidade <= 0) return []

  // Coletar todos os times na posição > classificadosPorGrupo de cada grupo
  const candidatos: ClassificacaoItem[] = []
  for (const grupo of gruposClassificacao) {
    for (const item of grupo) {
      if (item.posicao > classificadosPorGrupo) {
        candidatos.push(item)
      }
    }
  }

  // Ordenar pelo critério padrão
  candidatos.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias
    if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols
    return b.golsPro - a.golsPro
  })

  return candidatos.slice(0, quantidade)
}

/**
 * Calcula o total de partidas na fase de grupos.
 */
export function totalPartidasGrupos(
  numGrupos: number,
  timesPorGrupo: number,
  turnoRetorno: boolean,
): number {
  // Round-robin: cada grupo tem n*(n-1)/2 jogos no turno único
  const partidasPorGrupoTurno = (timesPorGrupo * (timesPorGrupo - 1)) / 2
  const multiplicador = turnoRetorno ? 2 : 1
  return numGrupos * partidasPorGrupoTurno * multiplicador
}

/**
 * Calcula o total de rodadas na fase de grupos.
 */
export function totalRodadasGrupos(
  timesPorGrupo: number,
  turnoRetorno: boolean,
): number {
  // Com n times: n-1 rodadas (turno único) ou 2*(n-1) (turno+returno)
  // Se n é ímpar: n rodadas no turno (uma folga por rodada)
  const rodadasTurno = timesPorGrupo % 2 === 0 ? timesPorGrupo - 1 : timesPorGrupo
  return turnoRetorno ? rodadasTurno * 2 : rodadasTurno
}

/**
 * Retorna o label da posição de classificação para complemento.
 * Ex: se classificadosPorGrupo = 2, complemento vem dos "3ºs colocados".
 */
export function labelPosicaoComplemento(classificadosPorGrupo: number): string {
  const posicao = classificadosPorGrupo + 1
  return `${posicao}º colocado`
}
