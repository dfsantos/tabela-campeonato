'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ChaveamentoRodada, ChaveamentoConfronto } from '@/lib/types'
import { registrarResultadoInlineAction } from '@/lib/actions'
import { getVencedor } from '@/lib/mata-mata'

interface Props {
  chaveamento: ChaveamentoRodada[]
  campeonatoId: string
}

export function BracketView({ chaveamento, campeonatoId }: Props) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-6">
        {chaveamento.map((rodada) => (
          <div key={rodada.rodada} className="flex flex-col">
            {/* Header da fase */}
            <div className="mb-3 text-center">
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {rodada.nomeFase}
              </span>
            </div>

            {/* Confrontos com espaçamento proporcional */}
            <div
              className="flex flex-1 flex-col justify-around gap-4"
            >
              {rodada.confrontos.map((confronto) => (
                <ConfrontoCard
                  key={`${rodada.rodada}-${confronto.posicao}`}
                  confronto={confronto}
                  campeonatoId={campeonatoId}
                  isFinal={rodada.rodada === chaveamento.length}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfrontoCard({
  confronto,
  campeonatoId,
  isFinal,
}: {
  confronto: ChaveamentoConfronto
  campeonatoId: string
  isFinal: boolean
}) {
  const { partida, mandanteLabel, visitanteLabel, isBye } = confronto

  // Bye — mostrar time que avança
  if (isBye) {
    return (
      <div className="w-56 rounded-xl bg-surface-container-low/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-on-surface">
            {mandanteLabel}
          </span>
          <span className="rounded-full bg-primary-fixed px-2 py-0.5 font-label text-[9px] font-bold uppercase tracking-wider text-on-primary-fixed-variant">
            BYE
          </span>
        </div>
      </div>
    )
  }

  // Partida futura (ainda não gerada)
  if (!partida) {
    return (
      <div className="w-56 rounded-xl bg-surface-container-low/30 px-4 py-3">
        <div className="space-y-1.5 text-xs text-on-surface-variant/60">
          <p className="truncate">{mandanteLabel ?? 'A definir'}</p>
          <div className="mx-auto w-6 text-center text-[10px]">vs</div>
          <p className="truncate">{visitanteLabel ?? 'A definir'}</p>
        </div>
      </div>
    )
  }

  // Partida existente (agendada ou finalizada)
  return (
    <PartidaCard
      partida={partida}
      campeonatoId={campeonatoId}
      isFinal={isFinal}
    />
  )
}

function PartidaCard({
  partida,
  campeonatoId,
  isFinal,
}: {
  partida: NonNullable<ChaveamentoConfronto['partida']>
  campeonatoId: string
  isFinal: boolean
}) {
  const [gols, setGols] = useState({
    mandante: String(partida.golsMandante ?? ''),
    visitante: String(partida.golsVisitante ?? ''),
  })
  const [penaltis, setPenaltis] = useState({
    mandante: String(partida.penaltisMandante ?? ''),
    visitante: String(partida.penaltisVisitante ?? ''),
  })
  const [isPending, startTransition] = useTransition()
  const [showPenaltis, setShowPenaltis] = useState(
    partida.penaltisMandante != null || (partida.golsMandante != null && partida.golsMandante === partida.golsVisitante)
  )
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isFinalizada = partida.status === 'finalizada'
  const vencedorId = isFinalizada ? getVencedor(partida) : null

  function handleGolChange(campo: 'mandante' | 'visitante', valor: string) {
    if (valor !== '' && !/^\d+$/.test(valor)) return
    const updated = { ...gols, [campo]: valor }
    setGols(updated)

    // Verificar se precisa mostrar pênaltis (empate)
    if (updated.mandante !== '' && updated.visitante !== '') {
      const m = parseInt(updated.mandante, 10)
      const v = parseInt(updated.visitante, 10)
      if (m === v) {
        setShowPenaltis(true)
        return // Esperar pênaltis antes de submeter
      } else {
        setShowPenaltis(false)
        submitResult(m, v)
      }
    }
  }

  function handlePenaltiChange(campo: 'mandante' | 'visitante', valor: string) {
    if (valor !== '' && !/^\d+$/.test(valor)) return
    const updated = { ...penaltis, [campo]: valor }
    setPenaltis(updated)

    if (updated.mandante !== '' && updated.visitante !== '') {
      const pm = parseInt(updated.mandante, 10)
      const pv = parseInt(updated.visitante, 10)
      if (pm === pv) {
        setError('Pênaltis não podem ser iguais')
        return
      }
      setError(null)
      const gm = parseInt(gols.mandante, 10)
      const gv = parseInt(gols.visitante, 10)
      submitResult(gm, gv, pm, pv)
    }
  }

  function submitResult(golsMandante: number, golsVisitante: number, penaltisMandante?: number, penaltisVisitante?: number) {
    startTransition(async () => {
      const result = await registrarResultadoInlineAction(
        partida.id,
        campeonatoId,
        golsMandante,
        golsVisitante,
        penaltisMandante,
        penaltisVisitante,
      )
      if (!result.success) {
        setError(result.error ?? 'Erro ao registrar resultado')
      } else {
        setError(null)
        router.refresh()
      }
    })
  }

  return (
    <div className={`w-56 rounded-xl px-4 py-3 shadow-[0_4px_32px_rgba(20,27,43,0.06)] ${
      isFinal && isFinalizada
        ? 'bg-primary/5 ring-2 ring-primary/20'
        : 'bg-surface-container-lowest'
    }`}>
      {/* Mandante */}
      <div className="flex items-center gap-2">
        <span className={`flex-1 truncate text-xs font-medium ${
          vencedorId === partida.mandante.id ? 'font-bold text-primary' : 'text-on-surface'
        }`}>
          {partida.mandante.nome}
        </span>
        {isFinalizada ? (
          <span className="w-8 text-center font-headline text-sm font-bold text-on-surface">
            {partida.golsMandante}
          </span>
        ) : (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={gols.mandante}
            onChange={(e) => handleGolChange('mandante', e.target.value)}
            disabled={isPending}
            className="w-10 rounded-md bg-surface-container-low py-0.5 text-center font-headline text-sm font-bold text-on-surface transition-colors focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      {/* Separador */}
      <div className="my-1.5 flex items-center gap-2">
        <div className="flex-1 border-t border-outline-variant/15" />
        {isPending ? (
          <svg className="h-3 w-3 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <span className="font-label text-[9px] text-on-surface-variant/40">VS</span>
        )}
        <div className="flex-1 border-t border-outline-variant/15" />
      </div>

      {/* Visitante */}
      <div className="flex items-center gap-2">
        <span className={`flex-1 truncate text-xs font-medium ${
          vencedorId === partida.visitante.id ? 'font-bold text-primary' : 'text-on-surface'
        }`}>
          {partida.visitante.nome}
        </span>
        {isFinalizada ? (
          <span className="w-8 text-center font-headline text-sm font-bold text-on-surface">
            {partida.golsVisitante}
          </span>
        ) : (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={gols.visitante}
            onChange={(e) => handleGolChange('visitante', e.target.value)}
            disabled={isPending}
            className="w-10 rounded-md bg-surface-container-low py-0.5 text-center font-headline text-sm font-bold text-on-surface transition-colors focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      {/* Pênaltis */}
      {showPenaltis && (
        <div className="mt-2 border-t border-outline-variant/15 pt-2">
          <p className="mb-1.5 text-center font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
            Pênaltis
          </p>
          <div className="flex items-center justify-center gap-2">
            {isFinalizada && partida.penaltisMandante != null ? (
              <span className={`w-8 text-center font-headline text-sm font-bold ${
                vencedorId === partida.mandante.id ? 'text-primary' : 'text-on-surface-variant'
              }`}>
                {partida.penaltisMandante}
              </span>
            ) : !isFinalizada ? (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={penaltis.mandante}
                onChange={(e) => handlePenaltiChange('mandante', e.target.value)}
                disabled={isPending}
                placeholder="—"
                className="w-10 rounded-md bg-surface-container-low py-0.5 text-center font-headline text-sm font-bold text-on-surface transition-colors placeholder:text-on-surface-variant/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : null}
            <span className="text-[9px] text-on-surface-variant/40">×</span>
            {isFinalizada && partida.penaltisVisitante != null ? (
              <span className={`w-8 text-center font-headline text-sm font-bold ${
                vencedorId === partida.visitante.id ? 'text-primary' : 'text-on-surface-variant'
              }`}>
                {partida.penaltisVisitante}
              </span>
            ) : !isFinalizada ? (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={penaltis.visitante}
                onChange={(e) => handlePenaltiChange('visitante', e.target.value)}
                disabled={isPending}
                placeholder="—"
                className="w-10 rounded-md bg-surface-container-low py-0.5 text-center font-headline text-sm font-bold text-on-surface transition-colors placeholder:text-on-surface-variant/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : null}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <p className="mt-1.5 text-center font-label text-[9px] text-error">
          {error}
        </p>
      )}

      {/* Indicador de campeão */}
      {isFinal && isFinalizada && vencedorId && (
        <div className="mt-2 border-t border-primary/10 pt-2 text-center">
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-amber-600">
            Campeão
          </span>
        </div>
      )}
    </div>
  )
}
