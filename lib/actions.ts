'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addCampeonato, addTime, deleteCampeonato, registrarResultado } from './store'
import { validateZonas } from './zonas'
import type { Zonas } from './types'

export async function criarTimeAction(formData: FormData): Promise<void> {
  const nome = formData.get('nome')?.toString().trim()
  const cidade = formData.get('cidade')?.toString().trim() || undefined
  if (!nome) throw new Error('Nome é obrigatório')
  await addTime(nome, cidade)
  revalidatePath('/times')
  redirect('/times')
}

export async function criarCampeonatoAction(formData: FormData): Promise<void> {
  const nome = (formData.get('nome') as string).trim()
  const temporada = (formData.get('temporada') as string).trim()
  const timeIds = formData.getAll('timeIds') as string[]

  if (!nome) throw new Error('Nome é obrigatório')
  if (!temporada) throw new Error('Temporada é obrigatória')
  if (timeIds.length < 2) throw new Error('Selecione ao menos 2 times')
  if (timeIds.length > 24) throw new Error('Um campeonato pode ter no máximo 24 times')

  const campeao = formData.get('zonaCampeao') === 'on'
  const elite = Number(formData.get('zonaElite')) || undefined
  const segundoPelotao = Number(formData.get('zonaSegundoPelotao')) || undefined
  const rebaixamento = Number(formData.get('zonaRebaixamento')) || undefined

  const hasZonas = campeao || elite || segundoPelotao || rebaixamento
  const zonas: Zonas | undefined = hasZonas
    ? { ...(campeao && { campeao }), ...(elite && { elite }), ...(segundoPelotao && { segundoPelotao }), ...(rebaixamento && { rebaixamento }) }
    : undefined

  if (zonas) {
    const error = validateZonas(zonas, timeIds.length)
    if (error) throw new Error(error)
  }

  const campeonato = await addCampeonato(nome, temporada, timeIds, true, zonas)
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

  await registrarResultado(partidaId, golsMandante, golsVisitante)
  revalidatePath(`/campeonatos/${campeonatoId}`)
  redirect(`/campeonatos/${campeonatoId}/partidas`)
}
