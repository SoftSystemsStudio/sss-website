# Automated Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/blog` on softsystemsstudiollc.com fed by a daily GitHub Actions pipeline (researcher → writer → reviewer) that opens one draft PR per day; Austin merging the PR publishes it.

**Architecture:** The site renders plain-Markdown files from `packages/frontend/content/blog/` (static, sanitized, price tokens resolved from `lib/business.ts`). A TypeScript pipeline in `scripts/blog/` takes three Claude calls plus deterministic code checks and opens a PR through the GitHub REST API with a token that triggers CI. All model and GitHub access is injected so every stage is unit-testable with fakes.

**Tech Stack:** Next.js 16 App Router, TypeScript, Zod 4, `node:test` + `tsx` for unit tests, Playwright (existing), `@anthropic-ai/sdk`, `gray-matter`, `marked`, `sanitize-html`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-16-automated-blog-design.md` (read it first; this plan only records decisions the spec leaves open).

**Branch:** `feat/automated-blog` (already cut from `main`; the spec is committed there). Finish by merging and deleting the branch (Austin's rule: ask "merge when CI is green?" once, up front).

## Global Constraints

- Author and publisher of every post is `Soft Systems Studio` (byline, Article JSON-LD `author`/`publisher`, RSS). No per-post AI label.
- Posts are plain Markdown, never MDX; raw HTML is stripped; 700–1,200 words (pipeline check, not loader).
- Writer uses second person ("you"); no first-person experience claims; studio facts only from `lib/business.ts`.
- Prices and package facts reach a post only through tokens resolved at build; no studio price literal may appear in a post.
- One draft attempted per day; skip the day if 3 or more PRs labelled `blog-draft` are open; one automatic rewrite round; open drafts older than 14 days are closed as stale.
- Merging the PR is the only approval and publish step. The pipeline never merges.
- No analytics or tracker is added (compliance, CLAUDE.md). Third-party calls are server-side only (Anthropic, GitHub, IndexNow).
- `process.env` in `packages/frontend` is read only through `src/lib/env.ts` (ESLint rule). Pipeline scripts under `scripts/` may read `process.env` directly.
- Next.js 16: check the version-matched docs in `packages/frontend/node_modules/next/dist/docs/` before using any Next API from memory. For the Anthropic SDK, the current web-search tool type and model IDs, load the `claude-api` skill.
- Pre-commit (secretlint, Prettier, ESLint, typecheck) and Core CI must pass; new routes go in `e2e/pages.spec.ts` `PAGES`. Load the `compliance-gate` skill before the final task.
- Models live in one file, `scripts/blog/config.ts`: researcher and writer on a Sonnet-class model, reviewer on a different, stronger model.

## Review Focus

Inputs the spec implies but no happy-path test covers, most likely first. Each has a test in the task named.

1. **Empty blog** (no posts yet): `/blog`, the sitemap and `/blog/feed.xml` must build and render cleanly. (Task 2)
2. **Bot-blocking sources:** a source URL returning 403/429 to our fetch must not fail the draft; 404/410/5xx must. (Task 3)
3. **Raw HTML or script in a draft:** must be stripped from rendered output and rejected by the pipeline check. (Tasks 1, 3)
4. **Slug collision or same-day rerun:** a slug already on `main` or a branch that already exists must produce a skipped outcome, never an overwrite or a duplicate PR. (Task 5)
5. **Invalid model output or API failure:** malformed JSON retries once, then ends the run with no PR and an outcome in the log; infrastructure errors exit non-zero, skips exit zero. (Tasks 4, 5)

## File Structure

```text
packages/frontend/
  content/blog/.gitkeep                      # real posts land here via merged PRs
  e2e/fixtures/blog/fixture-post.md          # test-only post (used by CI build)
  e2e/blog.spec.ts                           # blog smoke tests
  src/lib/blog-schema.ts                     # frontmatter zod schema + types (shared with pipeline)
  src/lib/blog-tokens.ts                     # token resolution + studio literals (shared)
  src/lib/blog.ts                            # loader + sanitized markdown render (server only)
  src/lib/blog*.test.ts                      # unit tests
  src/app/blog/page.tsx                      # index
  src/app/blog/[slug]/page.tsx               # post
  src/app/blog/feed.xml/route.ts             # RSS
scripts/blog/
  config.ts types.ts checks.ts models.ts stages.ts github.ts run.ts cli.ts
  prompts/{researcher,writer,reviewer}.md
  *.test.ts
.github/workflows/blog-draft.yml  blog-published.yml
```

---

### Task 1: Content model and loader

**Files:**
- Create: `packages/frontend/src/lib/blog-schema.ts`, `blog-tokens.ts`, `blog.ts`, `blog-schema.test.ts`, `blog-tokens.test.ts`, `blog.test.ts`, `packages/frontend/content/blog/.gitkeep`
- Modify: `packages/frontend/src/lib/env.ts` (add optional `BLOG_CONTENT_DIR` to `envSchema` and to `raw`), `packages/frontend/package.json` (deps `gray-matter`, `marked`, `sanitize-html` + `@types/sanitize-html`; script `"test:unit": "node --import tsx --test src/lib/*.test.ts"`; devDep `tsx`), root `package.json` (script `"test:unit": "pnpm -r --if-present test:unit && node --import tsx --test \"scripts/blog/**/*.test.ts\""`; devDeps `tsx`, `zod`, `@anthropic-ai/sdk`)

**Interfaces:**
- Produces (`blog-schema.ts`):
  - `interface PostFrontmatter { title: string; description: string; slug: string; date: string; tags: string[]; sources: { url: string; title: string }[] }`
  - `const postFrontmatterSchema` (zod): `title` 10–90 chars, `description` 70–160, `slug` kebab-case `^[a-z0-9]+(-[a-z0-9]+)*$` max 80, `date` `YYYY-MM-DD`, `tags` 1–4 strings, `sources` 3–6 items with http(s) `url`.
  - `const WORD_RANGE = { min: 700, max: 1200 }`
- Produces (`blog-tokens.ts`):
  - `resolveTokens(markdown: string): string` — replaces `{{NAME}}` for NAME in `BUILD_FROM, ADD_ONS_FROM, RETAINER_MIN, RETAINER_MAX, RETAINER_RANGE, SERVICE_AREA_LABEL, HOME_BASE`, and `{{price:<packageId>}}`, `{{name:<packageId>}}` via `getPackage`; throws `UnknownTokenError` (exported class, message names the token) for anything else.
  - `listTokens(markdown: string): string[]`
  - `STUDIO_LITERALS: string[]` — every package price string, add-on price string and `RETAINER_*` / `SECURE_CARE_PLAN_RANGE` value from `lib/business.ts` (derived, not retyped).
- Produces (`blog.ts`): `interface Post extends PostFrontmatter { html: string; wordCount: number }`; `renderMarkdown(md: string): string` (tokens resolved, then `marked`, then `sanitize-html` allowing only basic prose tags, `a[href]` with http(s)/mailto/relative, `rel="noopener"` added to external links); `getAllPosts(): Post[]` (newest first; **throws on any invalid frontmatter or unknown token so a bad post fails the build**); `getPost(slug: string): Post | undefined`. Content dir is `getEnv().BLOG_CONTENT_DIR ?? path.join(process.cwd(), 'content', 'blog')`.

- [ ] **Step 1: Write failing tests**
  - `blog-schema.test.ts`: a valid object parses; each of: bad slug `"Bad Slug"`, date `"11/16/2026"`, 2 sources, 7 sources, `ftp://` source URL, empty tags — fails.
  - `blog-tokens.test.ts`: `resolveTokens('From {{BUILD_FROM}}')` equals `` `From ${BUILD_FROM}` ``; `{{price:growth}}` equals `getPackage('growth').price`; `{{nope}}` throws `UnknownTokenError` with `/nope/`; `STUDIO_LITERALS` contains `BUILD_FROM` and every `BUILD_PACKAGES` price.
  - `blog.test.ts` (temp dir via `BLOG_CONTENT_DIR` set before importing; use `mkdtemp`): two valid files sort newest-first; a file with `<script>alert(1)</script>` and `<img onerror=x>` renders with neither string present; an external link gets `rel="noopener"`; an invalid frontmatter file makes `getAllPosts()` throw naming the file; empty dir returns `[]`; `getPost('missing')` is `undefined`.
- [ ] **Step 2:** Run `pnpm --filter frontend test:unit`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Install deps (`pnpm --filter frontend add gray-matter marked sanitize-html && pnpm --filter frontend add -D tsx @types/sanitize-html`, root `pnpm add -wD tsx zod @anthropic-ai/sdk`), implement the three modules and the `env.ts` addition to the signatures above. `blog.ts` imports `server-only`-free so tests can run under node; it must not import from `next/*`.
- [ ] **Step 4:** Run `pnpm --filter frontend test:unit`. Expected: PASS.
- [ ] **Step 5:** `pnpm lint && pnpm typecheck`, then commit `feat(blog): content model, token resolution and sanitized loader`.

---

### Task 2: Blog pages, feed, sitemap, SEO and e2e

**Files:**
- Create: `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/feed.xml/route.ts`, `e2e/blog.spec.ts`, `e2e/fixtures/blog/fixture-post.md`
- Modify: `src/app/sitemap.ts`, `src/components/StructuredData.tsx`, `src/components/ui/Footer.tsx` (`FOOTER_NAV` add `{ label: 'Blog', href: '/blog' }`), `public/llms.txt`, `e2e/pages.spec.ts`, `playwright.config.ts` (`webServer.env.BLOG_CONTENT_DIR` = absolute path of `e2e/fixtures/blog`), `.github/workflows/ci.yml`, `CLAUDE.md`
- Paths are relative to `packages/frontend` unless rooted (`.github`, `CLAUDE.md`, root).

**Interfaces:**
- Consumes: `getAllPosts()`, `getPost(slug)` from Task 1.
- Produces: `ArticleSchema({ title, description, path, datePublished }: {...})` and `BreadcrumbSchema({ items }: { items: { name: string; path: string }[] })` in `StructuredData.tsx`, following the existing component pattern there (author and publisher are `Soft Systems Studio`, reusing the Organization id).
- Page contract: `/blog` h1 is exactly `Notes for local business owners`; empty state text `The first posts are on the way.`; post page h1 is the post title; each post page ends with the existing `QuoteCta` and links to `/pricing`; metadata has canonical `/blog/<slug>`, OG image `/api/og?title=<title>`; `generateStaticParams` from `getAllPosts()`, `dynamicParams = false`.

- [ ] **Step 1: Write failing e2e.** `e2e/blog.spec.ts`: (a) `/blog` returns 200, one h1 `Notes for local business owners`; (b) if the index has post links, the first one returns 200, has one h1, a `link[rel=canonical]` ending in its slug, and a `script[type="application/ld+json"]` containing `"@type":"Article"`; otherwise the page shows the empty-state text; (c) `/blog/feed.xml` returns 200 with content type containing `xml`. Add `/blog` to `PAGES` in `pages.spec.ts` and `/blog/not-a-real-post` to the unknown-routes 404 list. Fixture post `fixture-post.md` is valid frontmatter, `slug: fixture-post`, body states it is a test fixture, uses `{{BUILD_FROM}}`.
- [ ] **Step 2:** Run `BLOG_CONTENT_DIR=<abs fixtures path> pnpm --filter frontend build` then `pnpm --filter frontend test:e2e`. Expected: FAIL (routes missing).
- [ ] **Step 3:** Implement pages, route, schemas, sitemap entries (`/blog` plus each post with `lastModified: new Date(post.date)`), footer link and `llms.txt` line; match the markup patterns of `src/app/web-design/[city]/page.tsx` (Navbar, Section, Footer, skip link). Feed is RSS 2.0, XML-escaped, channel title `Soft Systems Studio`, valid when empty.
- [ ] **Step 4:** Add the empty-blog check: build once with `BLOG_CONTENT_DIR` pointing at an empty temp dir and confirm build succeeds and `/blog`, `/sitemap.xml`, `/blog/feed.xml` render (record result in the commit message; if Next errors on empty `generateStaticParams` with `dynamicParams = false`, fix the page rather than adding a placeholder post).
- [ ] **Step 5:** In `ci.yml` set `BLOG_CONTENT_DIR: ${{ github.workspace }}/packages/frontend/e2e/fixtures/blog` on the "Build workspace" step and add a `pnpm test:unit` step after "Install dependencies". Update `CLAUDE.md` (Frontend Patterns: one bullet describing `/blog`, content dir, tokens, `BLOG_CONTENT_DIR`, and that production builds must not set it).
- [ ] **Step 6:** Rebuild with the fixture dir and run `pnpm --filter frontend test:e2e`. Expected: PASS. Commit `feat(blog): /blog pages, RSS, sitemap and structured data`.

---

### Task 3: Deterministic checks

**Files:** Create `scripts/blog/types.ts`, `config.ts`, `checks.ts`, `checks.test.ts`.

**Interfaces:**
- Produces (`types.ts`): `Brief { title: string; targetQuery: string; intent: string; localAngle: string; notDuplicateBecause: string; sources: { url: string; title: string; supports: string }[] }`; `ResearchResult = { kind: 'topic'; brief: Brief } | { kind: 'none'; reason: string }`; `ChecklistKey = 'sourced' | 'noInventedNumbers' | 'noGuarantees' | 'studioFactsOnly' | 'noCopiedPhrasing' | 'localValue' | 'voice' | 'notDuplicate'`; `ReviewResult { verdict: 'pass' | 'revise' | 'reject'; notes: string[]; checklist: Record<ChecklistKey, boolean> }`; `SkipReason = 'gate-full' | 'no-topic' | 'reviewer-reject' | 'checks-failed' | 'slug-collision'`; `RunOutcome = { kind: 'pr'; url: string } | { kind: 'skipped'; reason: SkipReason; detail: string }`; Zod schemas for `Brief`/`ResearchResult`/`ReviewResult` exported alongside.
- Produces (`config.ts`): `MODELS`, `MAX_OPEN_DRAFTS = 3`, `STALE_DAYS = 14`, `MAX_REVISIONS = 1`, `LABEL_DRAFT = 'blog-draft'`, `LOG_ISSUE_TITLE = 'Blog pipeline log'`, `SIMILARITY = { existingPosts: 0.35, sources: 0.2, shingleWords: 5 }`.
- Produces (`checks.ts`): `interface CheckFailure { code: string; message: string }`; `shingleOverlap(a: string, b: string, n?: number): number` (fraction of `a`'s n-word shingles present in `b`, case/punctuation-insensitive, 0 when `a` is shorter than `n` words); `BANNED_PHRASES: RegExp[]` (`#1`, `number one`, `guarantee(d)`, `rank(s|ed)? (first|#1|on page one)`, `top spot`); `runChecks(input: { markdown: string; existingPosts: { slug: string; body: string }[]; sourceTexts: Record<string, string> }): CheckFailure[]`; `checkSourceUrls(urls: string[], fetchFn: typeof fetch): Promise<CheckFailure[]>`; `fetchSourceTexts(urls: string[], fetchFn: typeof fetch): Promise<Record<string, string>>` (best effort, tags stripped, failures omitted).
- Failure codes: `frontmatter`, `word-count`, `banned-phrase`, `raw-html`, `unknown-token`, `studio-literal`, `unsourced-dollar`, `duplicate`, `copied`, `source-url`.

- [ ] **Step 1: Write failing tests** in `checks.test.ts`, one per code: valid fixture passes with `[]`; 699- and 1,201-word bodies fail `word-count`; `"Our #1 pick"` fails `banned-phrase`; a body containing `<script>` or `<div>` fails `raw-html`; `{{nope}}` fails `unknown-token`; a body containing `BUILD_FROM`'s literal value fails `studio-literal` (literal `$` amounts elsewhere are allowed only in a paragraph that also contains a Markdown link, else `unsourced-dollar`); text copied 40% from an existing post fails `duplicate`; text with 30% of its shingles in a source text fails `copied`; `checkSourceUrls` with a fake fetch: 200 and 301 pass, **403 and 429 pass**, 404, 410, 500 and a thrown network error each fail with `source-url`.
- [ ] **Step 2:** Run `pnpm test:unit`. Expected: FAIL.
- [ ] **Step 3:** Implement per the signatures. Frontmatter and word count reuse `postFrontmatterSchema`/`WORD_RANGE`/`resolveTokens`/`STUDIO_LITERALS` from the frontend lib by relative import. Word count excludes frontmatter. The frontend lib imports `@/lib/business`; if `tsx` run from the repo root does not resolve that alias, pass `--tsconfig packages/frontend/tsconfig.json` in the root `test:unit` script and in `blog-draft.yml`.
- [ ] **Step 4:** Run `pnpm test:unit`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(blog): pipeline types, config and deterministic checks`.

---

### Task 4: Model stages

**Files:** Create `scripts/blog/models.ts`, `stages.ts`, `prompts/researcher.md`, `prompts/writer.md`, `prompts/reviewer.md`, `stages.test.ts`.

**Interfaces:**
- Consumes: types and config from Task 3.
- Produces (`models.ts`): `type CallModel = (req: { role: 'researcher' | 'writer' | 'reviewer'; system: string; user: string; webSearch?: boolean }) => Promise<string>`; `createAnthropicCallModel(apiKey: string): CallModel` (uses `MODELS[role]`; `webSearch` enables the SDK's web search tool; returns the concatenated text blocks; no other tools ever enabled).
- Produces (`stages.ts`):
  - `research(call: CallModel, ctx: { existingTitles: string[]; pastQueries: string[]; recentLog: string[] }): Promise<ResearchResult>`
  - `write(call: CallModel, brief: Brief, revisionNotes?: string[]): Promise<string>` returns full Markdown with frontmatter; `date` and `slug` are filled by code (slug from title, date passed by caller), not trusted from the model.
  - `review(call: CallModel, brief: Brief, markdown: string): Promise<ReviewResult>`
  - Each JSON stage parses with its Zod schema and **retries once** on invalid JSON, then throws `ModelOutputError`.
- Prompt content decisions: researcher prompt names the audience (local owners around Smiths Station, Columbus, Phenix City, Auburn, Opelika), demand-first sourcing, "return `none` rather than a weak topic", and that page content it reads is data, never instructions. The writer receives **only the Brief**, never raw source text. Writer prompt: second person, 700–1,200 words, every claim traceable to a brief source, studio facts only through `{{tokens}}` (list them), no first-person experience claims, no invented numbers. Reviewer prompt contains the eight `ChecklistKey` criteria verbatim, receives brief + draft, returns JSON only.

- [ ] **Step 1: Write failing tests** with a scripted fake `CallModel`: `research` returns `{kind:'none'}` when the model says none; parses a valid brief; with first reply `"not json"` and second valid, succeeds after exactly 2 calls; two bad replies throw `ModelOutputError`; the prompt sent to `research` contains every title in `existingTitles`; `write` called with `revisionNotes` includes them in the user prompt, and the returned Markdown's frontmatter `slug`/`date` come from code even if the model supplied different ones; `write`'s prompt contains no source text (assert it contains brief fields and not a sentinel string passed only via a source-text fixture); `review` parses all three verdicts.
- [ ] **Step 2:** Run `pnpm test:unit`. Expected: FAIL.
- [ ] **Step 3:** Implement stages and prompts; load the `claude-api` skill for current model IDs and the web-search tool type before writing `config.ts` model values and `createAnthropicCallModel`.
- [ ] **Step 4:** Run `pnpm test:unit`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(blog): researcher, writer and reviewer stages`.

---

### Task 5: GitHub client and orchestrator

**Files:** Create `scripts/blog/github.ts`, `run.ts`, `cli.ts`, `github.test.ts`, `run.test.ts`.

**Interfaces:**
- Consumes: Tasks 3–4.
- Produces (`github.ts`): `interface DraftPr { number: number; title: string; targetQuery: string; state: 'open' | 'closed'; merged: boolean; createdAt: string; branch: string }`; `interface GitHubClient { listDraftPrs(): Promise<DraftPr[]>; closeStale(pr: DraftPr, reason: string): Promise<void>; branchExists(branch: string): Promise<boolean>; createDraftPr(input: { branch: string; path: string; content: string; title: string; body: string }): Promise<{ url: string }>; readLog(limit: number): Promise<string[]>; appendLog(entry: { date: string; outcome: SkipReason | 'pr'; topic?: string; detail: string }): Promise<void> }`; `createGitHubClient(token: string, repo: string, fetchFn?: typeof fetch): GitHubClient` using REST only: list PRs by label, create ref from `main` head, `PUT contents`, create PR, add label `blog-draft`, find-or-create the log issue titled `LOG_ISSUE_TITLE`, comment per entry (JSON line). PR title `Blog: <post title>`; PR body first line `Target query: <q>`.
- Produces (`run.ts`): `runPipeline(deps: { call: CallModel; gh: GitHubClient; fetchFn: typeof fetch; now: () => Date; existingPosts: { slug: string; title: string; body: string }[]; dryRun: boolean; outDir?: string }): Promise<RunOutcome>`. Order: close stale (open, older than `STALE_DAYS`) → count open; if `>= MAX_OPEN_DRAFTS` log + return `gate-full` → `research` (ctx from existing posts, all draft PR titles/queries, log) → `none` logs `no-topic` → `write` → `review`; `revise` triggers one `write` with notes then one more `review`; `reject` or a second non-pass logs `reviewer-reject` → `runChecks` + `checkSourceUrls` (+ `fetchSourceTexts`); any failure logs `checks-failed` with codes → slug already in `existingPosts` or branch exists → `slug-collision` → else open PR (or in `dryRun`, write `<outDir>/<slug>.md` and return a `pr` outcome with `url: file://…`). PR body holds brief, reviewer notes, source list, and a compliance checklist.
- Produces (`cli.ts`): reads `ANTHROPIC_API_KEY`, `BLOG_PR_TOKEN`, `GITHUB_REPOSITORY`, flag `--dry-run`; loads existing posts from `packages/frontend/content/blog`; prints the outcome; exit 0 on any `RunOutcome`, exit 1 on a thrown error (after attempting to log it).

- [ ] **Step 1: Write failing tests.** `run.test.ts` with a fake `GitHubClient` and scripted `CallModel`: happy path opens exactly one PR whose file path is `packages/frontend/content/blog/<slug>.md`; 3 open drafts → `gate-full`, `call` never invoked; a 15-day-old open draft is closed stale and not counted; `none` → `no-topic` logged; `revise` then `pass` → PR with `write` called twice; `revise` then `revise` → `reviewer-reject`; draft with banned phrase → `checks-failed` and no PR; existing slug → `slug-collision`; `branchExists` true → `slug-collision`; dry-run writes the file and calls no PR/branch method; `ModelOutputError` propagates (exit-1 path) after `appendLog` is attempted. `github.test.ts` with a fake `fetch`: `createDraftPr` issues requests in order (ref, contents, pulls, label) with `Authorization: Bearer <token>`; `listDraftPrs` maps `merged_at`; `appendLog` creates the issue when absent.
- [ ] **Step 2:** Run `pnpm test:unit`. Expected: FAIL.
- [ ] **Step 3:** Implement per the signatures.
- [ ] **Step 4:** Run `pnpm test:unit`. Expected: PASS. Run `pnpm typecheck` (add `scripts/blog` to a `tsconfig` include so it is type-checked; follow how the repo already scopes typecheck).
- [ ] **Step 5:** Commit `feat(blog): GitHub client and daily pipeline orchestrator`.

---

### Task 6: Workflows and docs

**Files:** Create `.github/workflows/blog-draft.yml`, `.github/workflows/blog-published.yml`. Modify `CLAUDE.md` (Deployment Topology and a "Blog pipeline" bullet), `docs/runbooks/` (new `blog-pipeline.md`: how to pause, run manually, read the log issue, rotate secrets, rollback a post by reverting its merge commit).

**Interfaces:** `blog-draft.yml` runs `pnpm exec tsx scripts/blog/cli.ts` with secrets `ANTHROPIC_API_KEY` and `BLOG_PR_TOKEN`; `blog-published.yml` waits for the new URL to return 200 then runs `node scripts/indexnow.mjs /blog /blog/<slug>`.

- [ ] **Step 1:** `blog-draft.yml`: triggers `schedule` cron `17 11 * * *` and `workflow_dispatch` with boolean input `dry_run` (default `true` for manual runs); `permissions: contents: read`; `concurrency: blog-draft` (no cancel); `timeout-minutes: 20`; same checkout/pnpm/node/install steps as `ci.yml`; on dry run upload `blog-dry-run/` as an artifact (14 days). Pin action versions the way `ci.yml` does.
- [ ] **Step 2:** `blog-published.yml`: trigger `push` to `main` with `paths: packages/frontend/content/blog/**`; list added `.md` files via `git diff --name-only --diff-filter=A HEAD^ HEAD`; poll each `https://softsystemsstudiollc.com/blog/<slug>` up to 10 minutes; then run IndexNow for those paths plus `/blog`. No secrets needed.
- [ ] **Step 3:** Validate both files with `actionlint` if available (otherwise `gh workflow view` after push); write the runbook; update `CLAUDE.md`.
- [ ] **Step 4:** Commit `ci(blog): daily draft workflow, IndexNow on publish, runbook`.

---

### Task 7: Compliance pass and full local verification

**Files:** none new; fixes only.

- [ ] **Step 1:** Load the `compliance-gate` skill and check the changes against `sss-hub/docs/specs/2026-10-31-compliance-standard-v1.md` (new public pages, outbound source links, structured data, no tracker, unsupported claims, accessibility of the new pages, privacy policy accuracy since Anthropic/GitHub calls are server-side and handle no visitor data). Anything outside this task's scope goes in the PR body under **Compliance follow-ups**.
- [ ] **Step 2:** Run `pnpm ci` with `BLOG_CONTENT_DIR` pointing at the e2e fixtures for the build. Expected: lint, typecheck, build, unit and e2e all pass.
- [ ] **Step 3:** Run the pipeline locally in dry-run with a real `ANTHROPIC_API_KEY` only after Austin has supplied it (see Task 8); until then, the fake-model suite is the evidence. Commit any fixes `fix(blog): compliance and verification fixes`.

---

### Task 8: Go live (Austin steps first, then one batch)

**Austin-only steps, in one batch, before this task starts** (each opened in his Chrome and left ready; the secrets go through a local hidden-prompt script kept out of the repo, never chat):
1. Create an Anthropic API key for this pipeline and set a monthly spend limit on it.
2. Create a fine-grained GitHub token for `SoftSystemsStudio/sss-website` with Contents and Pull requests write, plus Issues write for the log issue.
3. Run the hidden-prompt script that stores both as repo secrets `ANTHROPIC_API_KEY` and `BLOG_PR_TOKEN`.
4. Say "merge when CI is green" once (covers the push, merge and deploy of this branch).

- [ ] **Step 1:** Open the PR for `feat/automated-blog`, wait for Core CI green, merge, delete the branch locally and on origin, confirm the Vercel deploy and that `/blog` shows the empty state in production.
- [ ] **Step 2:** Run `blog-draft` manually with `dry_run: true`; download the artifact and read the draft. Fix prompts if the draft would be rejected on sight (changes go on a new `fix/blog-prompts` branch).
- [ ] **Step 3:** Run it manually with `dry_run: false`. Expected: one PR labelled `blog-draft`, a Vercel preview, a passing Core CI, and nothing in the log issue except skips. Austin reads and merges it.
- [ ] **Step 4:** Confirm after the merge: post is live at its URL, appears in `/sitemap.xml` and `/blog/feed.xml`, and the `blog-published` run pinged IndexNow (`202` or `200`).
- [ ] **Step 5:** Save the durable facts to the brain (`node C:\Users\ahodg\projects\sss-hub\scripts\brain.mjs add --dept sss-website --type decision ...`: pipeline location, secrets, how to pause) and tell Austin: **Done / Live? / Your move**.
