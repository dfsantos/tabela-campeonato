'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addCampeonato, addPartida, addTime, getTimesDoCampeonato, registrarResultado } from './store'

export async function criarTimeAction(formData: FormData): Promise<void> {
  const nome = formData.get('nome')?.toString().trim()
  const cidade = formData.get('cidade')?.toString().trim() || undefined
  if (!nome) throw new Error('Nome é obrigatório')
  addTime(nome, cidade)
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

  const gerarPartidas = formData.get('gerarPartidas') === 'on'
  const campeonato = addCampeonato(nome, temporada, timeIds, gerarPartidas)
  revalidatePath('/')
  redirect(`/campeonatos/${campeonato.id}`)
}

export async function registrarPartidaAction(formData: FormData): Promise<void> {
  const campeonatoId = formData.get('campeonatoId') as string
  const rodada = parseInt(formData.get('rodada') as string, 10)
  const mandanteId = formData.get('mandanteId') as string
  const visitanteId = formData.get('visitanteId') as string
  const data = formData.get('data') as string

  if (mandanteId === visitanteId) throw new Error('Times devem ser diferentes')
  if (rodada < 1) throw new Error('Rodada inválida')

  const participantes = getTimesDoCampeonato(campeonatoId).map((t) => t.id)
  if (!participantes.includes(mandanteId) || !participantes.includes(visitanteId)) {
    throw new Error('Times devem ser participantes do campeonato')
  }

  addPartida(campeonatoId, rodada, mandanteId, visitanteId, data)
  revalidatePath(`/campeonatos/${campeonatoId}`)
  redirect(`/campeonatos/${campeonatoId}?aba=partidas`)
}

export async function registrarResultadoAction(formData: FormData): Promise<void> {
  const partidaId = formData.get('partidaId') as string
  const campeonatoId = formData.get('campeonatoId') as string
  const golsMandante = parseInt(formData.get('golsMandante') as string, 10)
  const golsVisitante = parseInt(formData.get('golsVisitante') as string, 10)

  if (golsMandante < 0 || golsVisitante < 0) throw new Error('Gols inválidos')

  registrarResultado(partidaId, golsMandante, golsVisitante)
  revalidatePath(`/campeonatos/${campeonatoId}`)
  redirect(`/campeonatos/${campeonatoId}?aba=partidas`)
}
