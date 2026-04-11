# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run lint     # ESLint
npm run vitest   # Run tests with Vitest
```

To run a single test file:
```bash
npx vitest run src/__tests__/specific-file.test.tsx
```

## Architecture Overview

**10xSchool** is a gamified fast-math learning platform for children (ages 5–18) built as a Next.js 15 full-stack app using the App Router.

### Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19, Turbopack in dev
- **Database/Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Styling**: Tailwind CSS 4
- **Server State**: TanStack React Query v5
- **Forms**: React Hook Form + Zod
- **UI Primitives**: Radix UI (shadcn/ui style)
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion fork), React Confetti
- **Testing**: Vitest + React Testing Library

### Route Segments

```
src/app/
├── (auth)/         # Login, change-password
├── admin/          # Admin/teacher dashboard (access request management)
├── student/        # Student quiz flow, levels, performance dashboard
├── teacher/        # Teacher pages
├── landing/        # Public marketing pages
└── api/            # Backend API routes
```

### Authentication & Middleware

`src/middleware.ts` handles all auth routing:
- Unauthenticated users are redirected to `/login`
- Public routes (whitelist): `/login`, `/auth`, `/landing`, `/certificates`, `/application`, `/book-demo`, `/gallery`, `/beads-and-brain`
- Students with `password_change_required = true` in the `students` table are redirected to `/change-password`

### Supabase Clients

Two distinct clients — use the right one:
- `src/lib/supabase/server.ts` — Server-side (uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS)
- `src/lib/supabase/client.ts` — Browser-side (uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, respects RLS)
- `src/lib/supabase/middleware.ts` — Session refresh in middleware

TypeScript types for all tables are auto-generated in `src/types/database.types.ts`.

### Data Fetching Pattern

TanStack React Query is the standard for client-side data fetching. The provider is in `src/lib/TanstackProvider.tsx` with:
- `staleTime`: 10 minutes
- `gcTime`: 30 minutes
- Exponential backoff retry (3 retries, skips 4xx errors)
- Background refetch on window focus and reconnect

### Key Domain Concepts

- **Levels**: Quiz difficulty tiers. Students request access; teachers/admin approve via `access_requests` table.
- **Quiz flow**: Located under `src/app/student/` — students pick a level, take timed quizzes, results are tracked for analytics.
- **Demo users**: Anonymous trial accounts (`demo_users` table) for the public book-demo flow.
- **Performance analytics**: Tracked via `src/hooks/usePerformanceAnalytics.ts` and `src/hooks/useProgressTracking.ts`.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Database Migrations

Raw SQL migrations live in `database/`. There is no ORM — the codebase uses the Supabase JS client directly with typed queries.

### Testing Setup

Test mocks in `src/test/setup.ts` cover: Next.js router/navigation, Supabase client, TanStack React Query, and browser APIs (matchMedia, IntersectionObserver, ResizeObserver).

### Path Alias

`@/*` maps to `./src/*` — use this for all internal imports.
