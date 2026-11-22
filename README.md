# Soft Systems Studio — Website

The marketing site for [softsystemsstudiollc.com](https://softsystemsstudiollc.com): a Next.js app plus its shared UI components package.

## What this repo is

This used to be a larger monorepo that also held a customer-service chatbot, a Twilio voice receptionist, and a multi-tenant SaaS agent platform. Those were split out on **2026-08-31** so each product has its own repo:

- The chatbot moved to [`SoftSystemsStudio/sss-chatbot`](https://github.com/SoftSystemsStudio/sss-chatbot).
- The voice receptionist and SaaS platform (`apps/agent-api`, `packages/agent-orchestrator`, `packages/core-llm`, `packages/api`, `packages/agency-core`) were removed from this repo as part of the same split; they are not yet extracted to their own repo.

What's left here is just the two packages that make up the marketing site.

## Package structure

```text
.
├── packages/
│   ├── frontend/            # Next.js marketing site (app router)
│   └── ui-components/       # Shared React components (e.g. ChatWidget)
└── scripts/                 # Repo-hygiene scripts (env checks, secret/placeholder scanning)
```

`frontend` depends on `ui-components` via the `workspace:^` protocol — build `ui-components` first.

## Quick start

```bash
corepack enable
pnpm install
cp packages/frontend/.env.example packages/frontend/.env.local
pnpm dev
```

`pnpm dev` runs `frontend`'s own dev server (`next dev`). See `packages/frontend/.env.example` for the environment variables the site expects (Resend, Sentry, backend API URL).

## Build & deploy

```bash
pnpm --filter @softsystems/ui-components build
pnpm --filter frontend build
```

Production deploys are on **Vercel**, driven by the root [`vercel.json`](vercel.json) (`buildCommand: "pnpm --filter frontend build"`, output `packages/frontend/.next`).

## Nothing is wired to the old backend

The `/api/cron/cleanup-tokens` cron route and the `/api/v1/*` rewrite to the old SaaS backend were removed in the November 2026 security audit: nothing on the site used them, and the backend no longer lives here.

## Voice demo (removed)

The LiveKit voice demo (`VoiceDemo.tsx` and `/api/livekit-token`) was no longer shown on any page and was removed on 2026-10-31 (compliance audit). The receptionist product lives in `sss-receptionist`.

## Commands

```bash
pnpm lint              # ESLint across workspace packages
pnpm typecheck         # tsc --noEmit across workspace packages
pnpm test              # Playwright smoke tests (frontend; run `pnpm build` first)
pnpm format            # Prettier
pnpm secretlint        # secret scanning
pnpm scan-placeholders # find placeholder values left in source
pnpm check-env-committed # fail if a .env file is tracked in git
```

## License

Copyright © 2026 Soft Systems Studio. All rights reserved.
