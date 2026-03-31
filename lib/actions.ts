'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addCampeonato, deleteCampeonato, getCampeonato, getPartida, gerarMataMataAposGrupos, registrarResultado, registrarResultadoMataMata, verificarFaseGruposConcluida } from './store'
import { validateZonas } from './zonas'
import type { CampeonatoFormato, GruposConfig, Zonas } from './types'

export async function criarCampeonatoAction(formData: FormData): Promise<void> {
  const nome = (formData.get('nome') as string).trim()
  const temporada = (formData.get('temporada') as string).trim()
  const timeIds = formData.getAll('timeIds') as string[]
  const formato = (formData.get('formato') as CampeonatoFormato) || 'liga'

  if (!nome) throw new Error('Nome é obrigatório')
  if (!temporada) throw new Error('Temporada é obrigatória')
  if (timeIds.length < 2) throw new Error('Selecione ao menos 2 times')
  if (timeIds.length > 24) throw new Error('Um campeonato pode ter no máximo 24 times')

  const formatosValidos: CampeonatoFormato[] = ['liga', 'copa_grupos', 'copa_mata_mata']
  if (!formatosValidos.includes(formato)) throw new Error('Formato inválido')

  // Zonas são apenas para liga
  let zonas: Zonas | undefined
  if (formato === 'liga') {
    const campeao = formData.get('zonaCampeao') === 'on'
    const elite = Number(formData.get('zonaElite')) || undefined
    const segundoPelotao = Number(formData.get('zonaSegundoPelotao')) || undefined
    const rebaixamento = Number(formData.get('zonaRebaixamento')) || undefined

    const hasZonas = campeao || elite || segundoPelotao || rebaixamento
    zonas = hasZonas
      ? { ...(campeao && { campeao }), ...(elite && { elite }), ...(segundoPelotao && { segundoPelotao }), ...(rebaixamento && { rebaixamento }) }
      : undefined

    if (zonas) {
      const error = validateZonas(zonas, timeIds.length)
      if (error) throw new Error(error)
    }
  }

  // Configuração de grupos (apenas para copa_grupos)
  let gruposConfig: GruposConfig | undefined
  if (formato === 'copa_grupos') {
    const timesPorGrupo = Number(formData.get('timesPorGrupo'))
    const classificadosPorGrupo = Number(formData.get('classificadosPorGrupo'))
    const melhoresRestantes = Number(formData.get('melhoresRestantes')) || 0
    const turnoRetorno = formData.get('turnoRetorno') === 'on'

    if (!timesPorGrupo || timesPorGrupo < 3) throw new Error('Mínimo de 3 times por grupo')
    if (timeIds.length % timesPorGrupo !== 0) throw new Error('Total de times deve ser divisível pelo tamanho do grupo')
    if (!classificadosPorGrupo || classificadosPorGrupo < 1) throw new Error('Mínimo de 1 classificado por grupo')
    if (classificadosPorGrupo >= timesPorGrupo) throw new Error('Classificados por grupo deve ser menor que times por grupo')
    if (timeIds.length < 6) throw new Error('Mínimo de 6 times para formato de grupos')

    const numGrupos = timeIds.length / timesPorGrupo
    gruposConfig = { numGrupos, timesPorGrupo, classificadosPorGrupo, melhoresRestantes, turnoRetorno }
  }

  const gerarPartidas = formato === 'liga' || formato === 'copa_mata_mata' || formato === 'copa_grupos'
  const campeonato = await addCampeonato(nome, temporada, timeIds, gerarPartidas, zonas, formato, gruposConfig)
  revalidatePath('/')
  redirect(`/campeonatos/${campeonato.id}`)
}

export async function excluirCampeonatoAction(formData: FormData): Promise<void> {
  const id = formData.get('id') as string
  if (!id) throw new Error('ID do campeonato é obrigatório')
  await deleteCampeonato(id)
  revalidatePath('/')
}

export async function registrarResultadoAction(formData: FormData): Promise<void> {
  const partidaId = formData.get('partidaId') as string
  const campeonatoId = formData.get('campeonatoId') as string
  const golsMandante = parseInt(formData.get('golsMandante') as string, 10)
  const golsVisitante = parseInt(formData.get('golsVisitante') as string, 10)

  if (golsMandante < 0 || golsVisitante < 0) throw new Error('Gols inválidos')

  const campeonato = await getCampeonato(campeonatoId)
  const partida = await getPartida(partidaId)

  if (campeonato?.formato === 'copa_mata_mata' ||
      (campeonato?.formato === 'copa_grupos' && partida?.posicaoChave != null)) {
    // Mata-mata (direto ou fase eliminatória da copa grupos)
    const penM = formData.get('penaltisMandante')
    const penV = formData.get('penaltisVisitante')
    const penaltisMandante = penM != null ? parseInt(penM as string, 10) : undefined
    const penaltisVisitante = penV != null ? parseInt(penV as string, 10) : undefined
    await registrarResultadoMataMata(partidaId, golsMandante, golsVisitante, penaltisMandante, penaltisVisitante)
  } else {
    await registrarResultado(partidaId, golsMandante, golsVisitante)

    // Copa grupos: verificar transição para mata-mata
    if (campeonato?.formato === 'copa_grupos') {
      const concluida = await verificarFaseGruposConcluida(campeonatoId)
      if (concluida) {
        await gerarMataMataAposGrupos(campeonatoId)
      }
    }
  }

  revalidatePath(`/campeonatos/${campeonatoId}`)
  redirect(`/campeonatos/${campeonatoId}/partidas`)
}

export async function registrarResultadoInlineAction(
  partidaId: string,
  campeonatoId: string,
  golsMandante: number,
  golsVisitante: number,
  penaltisMandante?: number,
  penaltisVisitante?: number,
): Promise<{ success: boolean; error?: string }> {
  if (golsMandante < 0 || golsVisitante < 0) {
    return { success: false, error: 'Gols inválidos' }
  }

  try {
    const campeonato = await getCampeonato(campeonatoId)
    const partida = await getPartida(partidaId)

    if (campeonato?.formato === 'copa_mata_mata' ||
        (campeonato?.formato === 'copa_grupos' && partida?.posicaoChave != null)) {
      await registrarResultadoMataMata(partidaId, golsMandante, golsVisitante, penaltisMandante, penaltisVisitante)
    } else {
      await registrarResultado(partidaId, golsMandante, golsVisitante)

      // Copa grupos: verificar transição para mata-mata
      if (campeonato?.formato === 'copa_grupos') {
        const concluida = await verificarFaseGruposConcluida(campeonatoId)
        if (concluida) {
          await gerarMataMataAposGrupos(campeonatoId)
        }
      }
    }

    revalidatePath(`/campeonatos/${campeonatoId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro ao registrar resultado' }
  }
}
