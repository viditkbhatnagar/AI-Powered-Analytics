# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Powered Analytics is an AI-powered career analytics platform for UAE Supply Chain & Logistics professionals. It provides salary benchmarks, career domain exploration, and 30+ interactive visualizations. Built as a full-stack TypeScript monorepo with a React frontend and Express backend.

## Commands

- **Dev server:** `npm run dev` — starts Express server with Vite HMR (default port 5000)
- **Build:** `npm run build` — runs `script/build.ts` to produce `dist/`
- **Type check:** `npm run check` — runs `tsc`
- **DB push:** `npm run db:push` — pushes Drizzle schema to PostgreSQL via `drizzle-kit push`
- **Production:** `npm run start` — serves built app from `dist/`

## Architecture

### Monorepo Layout

- `client/` — React 18 SPA (Vite root is `client/`)
- `server/` — Express API server (`server/index.ts` is the entry point)
- `shared/` — Shared types, Drizzle schema (`shared/schema.ts`), and chat models

### Path Aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### Frontend Stack

- **Routing:** Wouter (not React Router)
- **State:** Zustand (`client/src/store/app-store.ts`) + TanStack React Query
- **UI:** shadcn/ui (new-york style, Radix primitives) — components in `client/src/components/ui/`
- **Charts:** Multi-library — Plotly.js, ECharts, Recharts (chart configs in `client/src/lib/charts/`, chart components in `client/src/components/charts/`)
- **Styling:** Tailwind CSS with CSS variables for theming; design follows Microsoft Fluent Design principles

### Backend Stack

- Express with `registerRoutes()` in `server/routes.ts` — all API routes under `/api/*`
- Database seeding happens on startup via `server/seed.ts`
- File uploads: Multer with memory storage
- AI document extraction: OpenAI API via `server/ai-extraction.ts`
- AI integrations (chat, image, batch) in `server/replit_integrations/`

### Database

- PostgreSQL via `DATABASE_URL` env var
- Drizzle ORM with schema in `shared/schema.ts`
- Migrations output to `./migrations/`
- Key tables: `industries`, `domains`, `subdomains`, `roles`, `salaries`, `initiatives`, `certifications`, `companies`, `dashboards`, `settings`, `users`

### Storage Abstraction

All database operations go through the `IStorage` interface in `server/storage.ts`. Never query the database directly from routes — use the `storage` instance.

### Key Patterns

- Schemas use `createInsertSchema` from `drizzle-zod` to derive Zod validation from Drizzle table definitions
- Types are exported from `shared/schema.ts` as `typeof table.$inferSelect` for select types and Zod-inferred types for inserts
- The dashboard builder uses `@dnd-kit` for drag-and-drop with a configurable grid layout
- Theme system uses CSS custom properties; toggle and provider in `client/src/lib/theme-provider.tsx`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key for AI features
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL
- `PORT` — Server port (default 5000)

## Design Guidelines

- Data-first layouts; visualizations take center stage
- Professional enterprise aesthetic (not marketing site)
- Font: Inter (primary), Roboto Mono (data/numbers)
- Spacing: Tailwind units of 2, 4, 6, 8, 12, 16
- Minimal animations (fade-in modals, slide-in sidebars, hover elevations only)
- Left sidebar navigation (240px) with 64px top header
- See `design_guidelines.md` for full component specs
