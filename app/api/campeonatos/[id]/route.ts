import { NextResponse } from 'next/server'
import { getCampeonato } from '@/lib/store'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const campeonato = await getCampeonato(id)
  if (!campeonato) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ nome: campeonato.nome, formato: campeonato.formato })
}
