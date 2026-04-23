# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal Tool — React + Vite + Tailwind internal dashboard with auth, CRUD records table, charts, and activity log. Backed by Supabase for database, auth, and RLS.

Built with Vite, React 19, TypeScript 5.9, Tailwind CSS, and Supabase.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build (tsc + vite build)
npm run preview          # Preview production build
npx tsc --noEmit         # Type check
npm run lint             # ESLint
npm run test             # Vitest unit tests (run once)
npm run test:watch       # Vitest in watch mode
npm run test:coverage    # Vitest with v8 coverage report
npm run test:e2e         # Playwright E2E tests (requires dev server or webServer config)
npx playwright install   # Install Playwright browsers (first-time setup)
npx supabase start       # Start local Supabase (PostgreSQL, Auth, Storage)
npx supabase db reset    # Reset DB and apply migrations + seed data
npx supabase stop        # Stop local Supabase
```

## Architecture

- `src/` — Application source code
- `src/components/` — Reusable React components (Sidebar, Chart)
- `src/pages/` — Page components (Dashboard, DataTable, Login, Signup)
- `src/lib/` — Utilities (supabase client, AuthProvider, i18n)
- `src/types/` — TypeScript type definitions (database row types)
- `src/locales/` — JSON translation files (en.json)
- `src/test/` — Vitest test setup and unit tests
- `public/` — Static assets
- `e2e/` — Playwright end-to-end tests
- `supabase/migrations/` — SQL migration files
- `supabase/seed.sql` — Development seed data

## Database Schema (Supabase / PostgreSQL)

Three tables in `public` schema:

- **profiles** — auto-created on signup (id FK auth.users, full_name, role default 'viewer')
- **records** — core data (title, status, category, value, created_by FK auth.users, timestamps)
- **activity_log** — audit trail (user_id, action, record_id FK records, created_at)

### RLS Policies

- `profiles`: readable by everyone, users can update/insert their own
- `records`: readable by all authenticated users, CRUD on own records, admins can manage all
- `activity_log`: readable and insertable by authenticated users

### Triggers

- `on_auth_user_created` — auto-creates a profile row when a new user signs up
- `records_updated_at` — auto-updates `updated_at` on record modifications

## Routing

- `/login` — Email/password sign in
- `/signup` — Account registration
- `/` — Dashboard (protected) — stat cards, chart, recent activity
- `/data` — Records table (protected) — full CRUD with search, filter, pagination, sorting

## Testing

### Unit tests (Vitest + React Testing Library)

- Config: `vitest.config.ts` — jsdom environment, globals enabled
- Setup: `src/test/setup.ts` imports `@testing-library/jest-dom`
- Tests live in `src/test/` mirroring source structure
- Supabase client is mocked in unit tests — never hit a real database
- Recharts is mocked in Dashboard tests (uses browser APIs unavailable in jsdom)

### E2E tests (Playwright)

- Config: `playwright.config.ts` — baseURL `http://localhost:5173`
- Tests live in `e2e/`
- `webServer` block auto-starts `npm run dev` when running `npm run test:e2e`

## Environment Variables

Copy `.env.example` to `.env.local`:

- `VITE_SUPABASE_URL` — Supabase project URL (local: `http://localhost:54321`)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

## Rules

- TypeScript strict mode — no `any` types
- Tailwind CSS for styling — no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
- Supabase client must be mocked in unit tests
- All database access goes through the Supabase client (`src/lib/supabase.ts`)
- Form validation on the client side before submitting to Supabase
