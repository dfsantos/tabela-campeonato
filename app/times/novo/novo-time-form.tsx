'use client'

import Link from 'next/link'
import { useState } from 'react'
import { criarTimeAction } from '@/lib/actions'

export default function NovoTimeForm() {
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')

  const canSubmit = nome.trim().length > 0

  return (
    <div className="max-w-lg">
      {/* Breadcrumb */}
      <nav className="mb-6 font-label text-xs text-on-surface-variant">
        <Link href="/times" className="transition-colors hover:text-primary">Times</Link>
        <span className="mx-1.5">/</span>
        <span className="text-on-surface">Novo time</span>
      </nav>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0_4px_32px_rgba(20,27,43,0.06)]">
        <h1 className="mb-6 font-headline text-lg font-bold text-on-surface">
          Novo time
        </h1>

        <form action={criarTimeAction} className="space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="mb-1.5 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Flamengo FC"
              className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="cidade"
              className="mb-1.5 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Cidade <span className="font-normal normal-case tracking-normal text-on-surface-variant/50">(opcional)</span>
            </label>
            <input
              id="cidade"
              name="cidade"
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Rio de Janeiro"
              className="w-full rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            >
              Cadastrar time
            </button>
            <Link
              href="/times"
              className="rounded-lg bg-secondary-container px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-surface-container-high"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
