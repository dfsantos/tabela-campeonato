# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Stack

- **Next.js 16** with App Router (`app/` directory)
- **React 19** with TypeScript (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- Path alias `@/*` maps to the project root

## Architecture

This is a championship table (`tabela-campeonato`) app. The entry points are:

- `app/layout.tsx` — root layout with Geist fonts and global metadata
- `app/page.tsx` — home page
- `app/globals.css` — Tailwind imports and CSS variables for light/dark theme

The app is in early development; business logic for teams, matches, and standings has not yet been implemented.
