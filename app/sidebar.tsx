'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    label: 'Campeonatos',
    href: '/',
    isActive: (pathname: string) => pathname === '/' || pathname.startsWith('/campeonatos'),
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 6V10C3 14.4 6 17.5 10 18.5C14 17.5 17 14.4 17 10V6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 10L9.5 12.5L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Times',
    href: '/times',
    isActive: (pathname: string) => pathname.startsWith('/times'),
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 5V10C3 14.4 6 17.5 10 18.5C14 17.5 17 14.4 17 10V5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-8">
        <Link href="/" className="block" onClick={() => setMobileOpen(false)}>
          <h2 className="font-headline text-lg font-bold tracking-tight text-on-primary">
            Tabela
          </h2>
          <p className="font-label text-[10px] uppercase tracking-widest text-primary-fixed-dim/60">
            Campeonato
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = item.isActive(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-l-4 border-primary-fixed bg-primary-container text-primary-fixed'
                  : 'text-primary-fixed-dim/60 hover:bg-primary-container hover:text-on-primary'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-primary lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-primary p-2 text-on-primary lg:hidden"
        aria-label="Abrir menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Mobile overlay + sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-on-surface/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-screen w-64 flex-col bg-primary shadow-[0_0_32px_rgba(20,27,43,0.3)]">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-primary-fixed-dim/60 hover:text-on-primary"
              aria-label="Fechar menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
