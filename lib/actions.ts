'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addPartida, registrarResultado } from './store'

export async function registrarPartidaAction(formData: FormData): Promise<void> {
  const campeonatoId = formData.get('campeonatoId') as string
  const rodada = parseInt(formData.get('rodada') as string, 10)
  const mandanteId = formData.get('mandanteId') as string
  const visitanteId = formData.get('visitanteId') as string
  const data = formData.get('data') as string

  if (mandanteId === visitanteId) throw new Error('Times devem ser diferentes')
  if (rodada < 1) throw new Error('Rodada inválida')

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
