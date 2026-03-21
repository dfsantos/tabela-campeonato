import Link from 'next/link'

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-surface-container-lowest/80 px-6 backdrop-blur-md shadow-[0_2px_16px_rgba(20,27,43,0.04)] lg:px-10">
      <span className="font-headline text-sm font-bold tracking-tight text-primary lg:text-base">
        Tabela Campeonato
      </span>
      <Link
        href="/campeonatos/novo"
        className="rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
      >
        Novo campeonato
      </Link>
    </header>
  )
}
