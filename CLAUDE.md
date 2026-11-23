# CLAUDE.md

## Purpose

This file is the repo's operating runbook for Claude Code: how work is planned, executed, validated, and how context is managed.

---

## Product Overview

**What this repo is**: the marketing website for Soft Systems Studio (softsystemsstudiollc.com) — a Next.js site plus its shared UI components package.

**Provenance**: until 2026-08-31 this repo was a larger monorepo, `SoftSystemsStudio/Soft-Systems-Studio`, that also held a customer-service chatbot, a Twilio voice receptionist, and a multi-tenant SaaS agent platform. Those were split out so each product gets its own repo — the chatbot is now [`SoftSystemsStudio/sss-chatbot`](https://github.com/SoftSystemsStudio/sss-chatbot); the voice receptionist and SaaS platform code were removed from this repo in the same pass and are not yet in a repo of their own. The repo itself was then renamed `SoftSystemsStudio/sss-website` to match what it now contains (GitHub redirects the old name). If you're looking for `apps/agent-api`, `packages/agent-orchestrator`, `packages/core-llm`, `packages/api`, or `packages/agency-core`, they no longer live here.

**User types**:

- **Site visitors** — local business owners (the studio is based in Smiths Station, AL, meets in person around Columbus, Phenix City, Auburn and Opelika, and works remotely anywhere else); read the marketing pages, then "Get a quote" — `/intake` redirects to the Lead Tool's sign-up page (`START_PROJECT_URL` in `lib/business.ts`), which creates the lead there and emails them a private link to a detailed questionnaire
- **Leads with a mangled Lead Tool link** — `/q/*`, `/p/*` and `/s/*` here redirect to the same path on `tool.softsystemsstudiollc.com` (`next.config.mjs`), so a questionnaire, teaser or preview link that lost its `tool.` still works
- **Outreach recipients** — owners Austin emails a `/for/<trade>` link (those pages are outreach-only: noindex, out of the sitemap, not linked from the site)
- **People holding Austin's business card** — its QR code opens `/hi` (added 2026-10-29): who he is, a "Save my contact" button that downloads `/hi/austin-hodges.vcf`, and links into the site. The card is printed (files in `sss-mockups/brand/cards/`), so that URL must keep working; noindex, out of the sitemap
- **Austin (owner)** — gets each sign-up as a lead in the Lead Tool, marked "From website", plus a Discord alert and an email (the Lead Tool's `docs/WEBSITE-SIGNUP.md`), no admin dashboard in this repo (the old `/admin` dashboard was deleted in the 2026-08-31 split; it duplicated the lead tool's own dashboard and was unreachable dead weight)

---

## Operating Model

### Always-On Requirements

- **Verify before asserting**: check files/grep/tests instead of guessing
- **Keep diffs tight**: minimal, reversible changes

### Modes

#### PLANNING MODE (required for new features or refactors)

**Trigger**: adding features, changing behavior, cross-module refactors, architecture changes

**Rules**:

- Ask clarifying questions first
- Provide a written plan before coding

#### EXECUTION MODE (for scoped tasks)

**Rules**:

- Implement the approved plan (or explicitly stated assumptions)
- Add/adjust tests when behavior changes
- If ambiguity appears → stop and switch to PLANNING MODE

---

## Tech Stack

- **Language/runtime**: Node.js 22 + TypeScript 5.x
- **Framework**: Next.js 16 (App Router), React 18. 16.x postdates most model training data; for any Next API, check the version-matched docs bundled at `packages/frontend/node_modules/next/dist/docs/` (pnpm symlink) rather than memory. `next dev`'s own agent-rules scaffolding is switched off (`agentRules: false` in `next.config.mjs`) so it doesn't create files in the tree.
- **Package manager**: pnpm@8.11.0 (two-package workspace)
- **Styling**: Tailwind CSS 3.4
- **Auth (site)**: none. Clerk (sign-in/sign-up, middleware) was removed 2026-10-31 (compliance audit): it was a development instance in production gating an empty signed-in state. There is no middleware
- **Email**: none sent from this site (the unused `resend` package was removed 2026-11-09). Quote requests no longer go through this site — the old intake form and `/api/intake` were removed 2026-10-02 in favour of the Lead Tool's sign-up
- **Mailbox**: Google Workspace — `austin@softsystemsstudiollc.com` (`CONTACT_EMAIL`). The old `softsystemstudioco@gmail.com` was upgraded into the same account and still receives mail. DNS is on Cloudflare; Resend and SendGrid send via their own subdomains, so root SPF lists only Google
- **Payments**: none on this site — build and Care Plan payments are Stripe Checkout links made in the Lead Tool
- **Error tracking**: Sentry, errors only. Session replay and performance tracing are off (sample rates 0 in `sentry.*.config.ts`) because the privacy policy says error monitoring only; keep the two in step
- **Analytics**: Vercel Web Analytics, page views only (added 2026-11-13): `<Analytics />` in `app/layout.tsx`. It needs Web Analytics switched on in the Vercel project's Analytics tab; until then `/_vercel/insights/script.js` 404s, which is harmless. No consent banner, because it sets no cookies and stores nothing in the browser (compliance standard item 5); it is named in the privacy policy and the sss-hub `docs/compliance/sdk-inventory.md`, and `e2e/analytics.spec.ts` guards the no-cookies, no-storage claim (`e2e/fixtures.ts` stubs the script, since `next start` doesn't serve it). Google Analytics was removed 2026-10-31. Adding anything else (click maps, session replay, a pixel) means a consent banner and a privacy-policy rewrite (items 4, 5, 8)

---

## Deployment Topology

```text
Vercel
├── Next.js app at packages/frontend/
└── API routes (/api/og share cards)
```

There is no backend deployed from this repo, and nothing calls one: the `/api/cron/cleanup-tokens` cron and the `/api/v1/*` rewrite to the old SaaS backend were removed in the November 2026 security audit, along with `NEXT_PUBLIC_API_URL` and `CRON_SECRET`. `next/image` allows no remote hosts (`images.remotePatterns` is empty); every image is a local file.

**Releases and rollback:** every green Core CI run on `main` is tagged and published as a GitHub Release (`.github/workflows/release.yml`, tags like `v2026.11.09.1`). How to roll back: `docs/runbooks/rollback.md`. Dependabot opens grouped dependency PRs monthly (`.github/dependabot.yml`).

**Blog automation:** `.github/workflows/blog-draft.yml` runs daily (and on manual dispatch, dry run by default) and opens a draft-post PR for approval (scheduled at 11:17 UTC with two once-a-day-gated backup slots, and real runs post the result to Discord when the optional `DISCORD_WEBHOOK_URL` secret is set); `.github/workflows/blog-published.yml` runs on pushes to `main` that add a post, waits for the page to go live, then pings IndexNow. Runbook: `docs/runbooks/blog-pipeline.md`.

---

## Architecture Map

```text
/packages/
  frontend/            # Next.js marketing site (app router)
  ui-components/       # Shared React components (ChatWidget, etc.)

/scripts/              # Repo-hygiene scripts (env checks, secret/placeholder scanning)
```

**Boundaries / "do not touch" zones**:

- `.env*` files — never commit (guarded by pre-commit and `check-env-committed`)
- `pnpm-lock.yaml` — only update via `pnpm install`

---

## Frontend Patterns

Location: `/packages/frontend/`

### State Management

React hooks only (`useState`, `useEffect`, `useRef`) - no global state library.

### Data Fetching

Native `fetch()` + Next.js API routes. No React Query, SWR, or tRPC.

### Styling

- **Primary**: Tailwind CSS 3.4 (utility-first)
- **Design tokens**: palette (`paper`, `limestone`, `ink`, `line`, `brass`, `on-ink`) and font families in `tailwind.config.js` — the only Tailwind config (Tailwind resolves `.js` first; a stray `.cjs` was ignored and has been removed)
- **Fonts**: Cormorant Garamond (display, weights 500/600 + italic) + Instrument Sans (body) via `next/font` in `app/layout.tsx`
- **Brand (River & Brass, 2026-10-24)**: brass replaced the sun yellow as the one accent. `brass` (`#A8834B`) is 3.25:1 on paper, so it is for rules, details and large type only, never small text; `brass-light` (`#C9A66B`) is for anything on ink (CTA, focus ring). The logo files live in `public/images/brand/` (copied from `sss-mockups/brand/`, which has the generator and the brand guide; re-copy rather than editing them here): the header uses `logo-compact-color.svg`, the footer `logo-wordmark-reversed.svg`, the homepage About card `logo-stacked-color.svg`; `app/icon.svg` and `app/apple-icon.png` are the tab and home-screen icons. `png/signature-logo-2x.png` is what Austin's email signature loads, so keep that path stable. The old `images/soft-systems-logo*.png` files are no longer referenced
- **Global CSS**: `/src/styles/globals.css` — focus/selection styles, the `.marker` highlight, and the heading rules the `/demo/*` sites were designed against (scoped to `.sss-demo` by `app/demo/layout.tsx`; don't widen them)
- **Homepage showcase images**: `public/images/work/` are screenshots of the `/demo/*` pages — re-capture them if a demo's hero changes
- **Concepts and trade pages**: `lib/concepts.ts` lists the demo sites, shown as project cards (`components/ConceptCard.tsx`) on the homepage and trade pages — keep each concept's `features` true to what its demo actually shows; `lib/trades.ts` drives the `/for/<trade>` outreach pages (lawn care, coffee shops, florists) — outreach-only, so they stay noindex, out of the sitemap and unlinked; the public site says "local businesses" and doesn't advertise specific business types. A trade's quote links carry `?type=<businessType>` through the `/intake` redirect to the Lead Tool's sign-up, which saves it as the lead's category; keep trade copy inside what the Starter package ships (`WEBSITE_FEATURES` and `BUILD_PACKAGES` in `lib/business.ts`), since trade pages lead with its price
- **Pricing**: every price and each package's scope come from `lib/business.ts` (`BUILD_PACKAGES`, `BUILD_ADD_ONS`, `PACKAGE_COMPARISON`, `NOT_IN_ANY_PACKAGE`, `CARE_PLANS`). Packages replaced the flat $997 build on 2026-10-02. The full scope of work is the `/pricing` page; the homepage `#pricing` section is a summary of it. The source of truth is the Lead Tool's `docs/SCOPE.md` (and `lib/pricing.ts`, which charges the amounts): change it first, then `lib/business.ts`, `public/llms.txt` and the terms page
- **Location and search**: base town, in-person cities and the service-area label all come from `lib/business.ts` (`HOME_BASE`, `SERVICE_AREA_CITIES`, `SERVICE_AREA_LABEL`); JSON-LD in `components/StructuredData.tsx`, the AI-facing summary in `public/llms.txt` (plain text — update it by hand when facts change) and `app/robots.ts`, which names the search and AI crawlers explicitly
- **Search engine notification (2026-11-12)**: Google Search Console and Bing Webmaster Tools both hold `https://softsystemsstudiollc.com/sitemap.xml` (Bing imported from Search Console). `www` 308-redirects to the bare domain at the Vercel domain level. IndexNow (Bing and others, not Google) uses the public key file `packages/frontend/public/<key>.txt`; after publishing new or changed pages run `node scripts/indexnow.mjs` (whole sitemap) or `node scripts/indexnow.mjs /path ...`
- **Town pages and exact-match domains (2026-11-12)**: `/web-design/<slug>` has one indexed page per in-person town (`lib/cities.ts`, driven by `SERVICE_AREA_CITIES` in `lib/business.ts`; sitemap, footer links, `Service` + FAQ JSON-LD, `public/llms.txt`). Each town has its own copy: keep claims true and small, no rankings or numbers. `CITY_DOMAINS` in `next.config.mjs` maps exact-match domains (`columbusgawebdesign.com`, `phenixcitywebdesign.com`, `auburnalwebdesign.com`, `opelikawebdesign.com`, `smithsstationwebdesign.com`, bare and `www`) to a 308 redirect to their town's page. They only fire once the domain is added to this Vercel project, and DNS is on Cloudflare. A new town goes in `SERVICE_AREA_CITIES`, `COPY` in `lib/cities.ts`, `CITY_DOMAINS` if it has a domain, and `PAGES` in `e2e/pages.spec.ts`
- **Blog (2026-11-16)**: `/blog` (index), `/blog/<slug>` and `/blog/feed.xml` (RSS) render markdown posts from `content/blog/*.md` (frontmatter validated by `lib/blog-schema.ts`, body through `lib/blog.ts`: marked then sanitize-html). Prices and facts in post bodies are tokens like `{{BUILD_FROM}}`, resolved from `lib/business.ts` by `lib/blog-tokens.ts`; an unknown token fails the build. Pages are static (`dynamicParams = false`), in the sitemap, with `Article` and `BreadcrumbList` JSON-LD. `BLOG_CONTENT_DIR` overrides the content dir and is for tests only: `playwright.config.ts` and the CI build set it to `e2e/fixtures/blog`, and production builds must not set it (a Vercel production build, `VERCEL_ENV=production`, ignores it anyway). `getAllPosts` throws if a frontmatter `slug` differs from its file name or two posts share a slug, and a unit test loads the real `content/blog`, so a bad draft PR fails Core CI. Posts are drafted daily by an automated pipeline and published only when its PR is merged: `docs/runbooks/blog-pipeline.md`. SEO (2026-11-16): code orders `TOPIC_PILLARS` least covered first from the `**Pillar:**` lines of merged and open draft PRs (ties rotate by date; `scripts/blog/pillars.ts`) and the researcher takes the first pillar with a winnable topic; only `low`/`medium` competition queries are written (a brief the model itself rates `high` is skipped in code), each PR carries an advisory SEO scorecard (`scripts/blog/seo.ts`), and post pages add "More notes" (`lib/blog-related.ts`), code-generated h2/h3 anchor ids, and a `<title>` that drops the site suffix when it would pass 60 characters (`postTitle` in `lib/blog-format.ts`)
- **Free checklist (2026-11-17)**: the homepage `#checklist` section links to the free Get Found Locally Checklist on the studio's Gumroad store (`FREE_CHECKLIST_URL` in `lib/business.ts`). It is a plain outbound link, so nothing is sent from this site, and the copy says Gumroad asks for an email. If the Gumroad product is renamed, deleted or its price changes from free, update the link and the copy, and `e2e/routes.spec.ts` checks both
- **Shop (2026-11-21)**: `/shop` lists the studio's Gumroad products from `SHOP_PRODUCTS` in `lib/business.ts` (in the nav, footer, sitemap and `public/llms.txt`, and linked from the homepage `#checklist` section). Each card is a plain outbound link to the product's Gumroad page, so checkout, delivery and refunds happen on Gumroad and nothing is sent from this site. Card copy must match the product's Gumroad page; change it there and here together. The older paid products (AI Business in a Box, Solopreneur OS, SaaS Launch Kit) stay off the site unless Austin asks for them back
- **Motion**: CSS classes in `globals.css` (`.rise` entrance, `.reveal` scroll reveal, `.parallax`, `.concept-pan`, `.nudge`, link underlines). All of it sits inside `@media (prefers-reduced-motion: no-preference)`, and scroll-driven effects use `animation-timeline` behind `@supports` — no JS, so content can never get stuck hidden. `ShowcaseParallax.tsx` is the only motion JS (pointer position → CSS vars). Keep new motion inside those guards.

### Key Conventions

- **CSP (2026-11-19, security audit)**: `src/proxy.ts` sets the Content-Security-Policy with a fresh nonce per request: scripts need the nonce (`'strict-dynamic'` lets nonced scripts load Next's chunks and Vercel Analytics), no `'unsafe-inline'`/`'unsafe-eval'` for scripts, and `connect-src` lists only this origin and Sentry's ingest hosts. A nonce only reaches a page rendered per request, so `app/layout.tsx` calls `connection()` and every page is dynamic (ƒ in the build output); route handlers like the sitemap, feed and vCard stay static. Inline `<script>` code won't run: use a file or `next/script` with the nonce from `headers().get('x-nonce')`. A new browser-side host (an embed, an API) goes in `buildCsp` first. `e2e/security.spec.ts` pins the policy, and every e2e test fails on a CSP violation (it's a console error). Because pages render at runtime, `next.config.mjs` traces `content/blog` into the server functions by hand (`outputFileTracingIncludes`). The Vercel toolbar on preview deployments is blocked by this policy; production is unaffected
- **Share cards (`/api/og`)**: only draws titles the site itself uses (`src/lib/og-titles.ts`: the fixed page titles, trade and town pages, and blog post titles); any other `?title=` gets the default card. Build a page's OG image with `ogImage(...)` and a title from that module (blog posts use `postOgImage`, and their titles come from `content/blog`), or the card silently falls back to the default
- 3D/heavy components: Use `dynamic()` with `ssr: false`
- Forms: HTML forms + Zod validation on API routes
- Demo sites (`/demo/*`) are fictional businesses: `app/demo/layout.tsx` makes them noindex, they stay out of `app/sitemap.ts`, and any review, rating or testimonial on them is visibly labelled as sample text
- Legal name and state of formation come from `LEGAL_NAME` and `LEGAL_ENTITY` in `lib/business.ts` (footer, terms, privacy). No mailing address is published (removed at Austin's request, 2026-11-18); don't add one back

---

## Code Standards

### Naming

- Files: `kebab-case.ts`, `PascalCase.tsx` for React components
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### ESLint Rules to Note

- `no-restricted-syntax`: Blocks direct `process.env` access (use `lib/env.ts`)
- `@typescript-eslint/no-explicit-any`: Avoid `any`, use `unknown` or proper types

---

## Standard Commands

```bash
pnpm install
pnpm dev               # frontend dev server
pnpm lint              # ESLint across workspace packages
pnpm lint:fix
pnpm typecheck         # tsc --noEmit across workspace packages
pnpm format
pnpm format:check
pnpm test              # Playwright smoke tests (frontend e2e/); needs `pnpm build` first
pnpm test:unit         # node:test unit tests (frontend src/lib, scripts/blog)
pnpm build              # pnpm -r build (ui-components then frontend, dependency order)

# Security / hygiene
pnpm secretlint
pnpm check-env-committed
pnpm scan-placeholders
```

---

## Change Management

### Feature/Refactor Workflow

1. **PLANNING MODE** — write the plan, get clarification
2. **Implement in small commits** — each passes lint + typecheck
3. **Validate** — manual check in the browser; run `pnpm ci` locally
4. **Document** any new behavior in this file or the README

### Bugfix Workflow

1. Repro steps
2. Root cause
3. Minimal patch
4. Regression check (manual, since there's no meaningful automated coverage yet)

---

## Quality Gates (pre-commit / CI)

### Pre-commit (Husky)

`.husky/pre-commit` runs, in order (keep this list and the hook in step):

- `.env` guard on staged files, then check-env-committed (prevent `.env` commits)
- scan-placeholders (find placeholder values)
- secretlint on the staged files (secret scanning)
- Prettier `--check` on the staged files (the whole-repo `format:check` still fails on older files)
- lint (ESLint, whole workspace)
- typecheck (TypeScript, whole workspace)

### CI (`.github/workflows/ci.yml`)

Install → unit tests (`pnpm test:unit`: `node --test` over `packages/frontend/src/lib/*.test.ts` and `scripts/blog/**/*.test.ts`) → build (`pnpm -w -r build`) → lint → typecheck `@softsystems/ui-components` → Playwright smoke tests (`pnpm --filter frontend test:e2e`, Chromium, against `next start` on port 3100; HTML report uploaded as an artifact on failure).

### Browser smoke tests (`packages/frontend/e2e/`)

Every page route is listed in `PAGES` in `e2e/pages.spec.ts` (status 200, its `<h1>`, footer Privacy/Terms links); add new routes there. `e2e/fixtures.ts` fails any test whose page throws, logs a console error, or gets a 4xx/5xx from its own origin; `ALLOWED_CONSOLE_ERRORS` there is empty and each entry must say why it's unavoidable. Links to `/intake` must be plain `<a>` (`Button as="anchor"`), not `<Link>`: it redirects off-site, and a `<Link>` prefetch of that redirect fails CORS and logs a console error. The site has no forms; nothing in the suite submits anything or follows a redirect to the Lead Tool. `.github/workflows/security.yml` runs gitleaks + secretlint + the env/placeholder scanners on a schedule and on push/PR to `main`.

---

## Known Issues & Tech Debt

| Issue                                                                                      | Impact | Notes                                                                                                                         |
| ------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Thin test coverage                                                                         | Low    | `e2e/` checks every page renders cleanly; unit tests (`pnpm test:unit`, run by CI) cover the blog code only; no visual checks |
| `docker-compose*.yml`, root `Dockerfile`, `railway.json`, `infra/` were removed 2026-08-31 | —      | They existed only for the now-removed SaaS backend                                                                            |

---

_This CLAUDE.md is a living document. Update it as the project evolves._
