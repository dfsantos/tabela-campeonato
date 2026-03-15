'use client'

import Link from 'next/link'
import { useState } from 'react'
import { criarTimeAction } from '@/lib/actions'

export default function NovoTimeForm() {
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')

  const canSubmit = nome.trim().length > 0

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-md px-4 py-12">
        <Link
          href="/times"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Times
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-6 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Novo time
          </h1>

          <form action={criarTimeAction} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
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
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="cidade"
                className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
              >
                Cidade <span className="font-normal text-zinc-400 dark:text-zinc-600">(opcional)</span>
              </label>
              <input
                id="cidade"
                name="cidade"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Rio de Janeiro"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity dark:bg-zinc-50 dark:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Cadastrar time
              </button>
              <Link
                href="/times"
                className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
