# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**futbol-pano** (a.k.a. Scout Gamer, scoutgamer.com) — an English-only football content
site for a global audience, with no geographic or league bias. Core focus: young-talent
scouting, rising footballers, and game culture. Content includes editorial articles, player
scouting lists, transfer analysis, a World Cup 2026 hub, tournament/arena brackets, and
tactical deep-dives, plus an admin CMS with AI-assisted content generation.

## Stack

- **Next.js 16** (App Router) + **React 19**, **TypeScript** (strict).
- **Styling:** Tailwind CSS v4 **and** CSS Modules (`*.module.css`) are both used — match
  the convention of the file/folder you're editing.
- **Data:** Supabase (Postgres), accessed via the anon client (subject to RLS).
- **AI:** `@anthropic-ai/sdk` for admin content generation/translation.
- **Editor:** TipTap + a custom block editor under `app/admin`.
- **Animation:** framer-motion, lenis (smooth scroll).
- **Deploy:** Vercel.

## Commands

```bash
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

No test suite is configured. Verify changes with `npm run build` and/or the dev server.
Data/maintenance scripts live in `scripts/` (mostly `.mjs`, run with `node`); SQL lives in
`supabase/migrations/`.

## Layout

- `app/` — App Router; each top-level folder is a site section:
  - `admin/` — CMS: article editor (block + HTML), cover story, hubs.
  - `api/` — route handlers, incl. `admin/*`, `cron` + `cron/transfer-wire`, `transfers`,
    `world-cup/*`, `wc-squads`, `hub-contents`, `cover-story`, `revalidate`, `og-image`.
  - `arena/` (brackets), `oyuncular/` (players), `radar/`, `tactics-lab/`, `transfers/`,
    `turnuva/` (tournament), `world-cup-2026/`, `lists/`.
  - `components/` — shared UI (Header, Footer, HeroSlider, EditorialArticle, …).
- `lib/` — domain logic (transfers, World Cup squads/schedule/teams, hub system, cover
  story, article metadata, Supabase client). Most business logic lives here, not in pages.
- `scripts/` — one-off and periodic data scripts + SQL helpers.
- `supabase/migrations/` — schema & seed SQL.
- `proxy.ts` — request proxy: sets `x-pathname` header and guards `/admin` (see Auth).

## Conventions

- Import alias: `@/*` maps to the repo root (e.g. `@/lib/supabase`).
- Keep new business logic in `lib/`; pages/components stay thin.
- Supabase access: import `supabase` (or `createClient()`) from `lib/supabase.ts`. This is
  the anon client and is subject to RLS; there is no service-role/admin client.
- The site is **English-only**. All public content, UI copy, DB values, identifiers, slugs,
  and stored values must be in English — no exceptions. The `title` and `title_en` columns
  in `contents` are kept in sync (both English).
- Content is **league/geography-neutral**: no league, country, or region is prioritized.
  The site serves a global audience and must not skew toward any specific football market.

## Auth (admin)

`/admin/*` is protected in `proxy.ts` via `ADMIN_PASSWORD`: a `sg_admin` session cookie or
HTTP Basic Auth (user `scout`). If `ADMIN_PASSWORD` is unset, admin returns 503.

## Environment

Copy `.env.example` to `.env.local`. Keys:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public Supabase.
- `ANTHROPIC_API_KEY` — admin AI content features (the app's own AI, unrelated to the
  Claude Code agent's billing).
- `CRON_SECRET` — protects the cron routes.
- `YOUTUBE_API_KEY`, `FOOTBALL_DATA_API_KEY` (football-data.org), `API_FOOTBALL_KEY`
  (api-football.com) — external data sources (transfers, fixtures, video).
- `ADMIN_PASSWORD` — required to enable the `/admin` area (see Auth).

## Deploy / cron

Vercel. `vercel.json` defines two crons:
- `/api/cron` — weekly, Mondays 05:00 UTC.
- `/api/cron/transfer-wire` — daily, 06:00 UTC.
