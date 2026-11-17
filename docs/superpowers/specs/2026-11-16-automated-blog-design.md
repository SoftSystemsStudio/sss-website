# Automated blog — design

Date: 2026-11-16. Repo: sss-website (`packages/frontend`, Next.js 16 App Router, Vercel).
Status: draft, awaiting Austin's approval.

## Intent and the why

Austin wants more organic search traffic to softsystemsstudiollc.com. Today the
site is nearly invisible: 5 indexed URLs plus the town pages, Domain Rating 7, no
backlinks or directory listings, Google Business Profile suspended
(see brain note "Marketing site SEO and backlink baseline 2026-11-12").

Buyers are local owners around Smiths Station, Columbus, Phenix City, Auburn and
Opelika. A blog helps in two ways: long-tail, practical answers local owners
actually search for, and pages that other sites and AI assistants can cite.

Austin's own words for the mechanism: every day an agent researches website-design
content and picks a subject, a second agent writes the post, a third reviews it,
and a human approves it before it goes live.

## Goals

- A daily pipeline (GitHub Actions cron) of three agents: **researcher → writer →
  reviewer**, ending in a pull request containing one draft post.
- **Merging the PR is the human approval and the publish.** Austin reads the Vercel
  preview on his phone and merges, or closes the PR to reject.
- Published posts live at `/blog/<slug>`, with a `/blog` index, RSS, sitemap entries,
  Article structured data and an `llms.txt` mention.
- **One draft a day, aiming for one post published a day.** Pace is whatever Austin
  merges; there is no weekly cap. A day with no good topic is skipped rather than
  filled with a weak post.
- Posts are published as **Soft Systems Studio**: that is the author and publisher in
  the byline, Article JSON-LD and RSS.
- Every post is useful to a local small-business owner and is true.

## Non-goals

- No auto-publish, ever. No post goes live without Austin merging it.
- No CMS, database, comments, newsletter or analytics tracker. (Analytics was removed
  2026-10-31 for compliance; Google Search Console is the measurement tool and needs
  no code.)
- No AI-generated images in v1. Social/OG image uses the existing `/api/og` route.
- No Hub approval dashboard in v1 (possible later; the PR flow is the v1 approval UI).

## Anti-goals (a failure even if it technically works)

- Thin, derivative or repetitive posts that look like scaled content. Google demotes
  the whole domain for this, and the domain is the revenue asset.
- Any invented statistic, ranking, guarantee, testimonial or claim about the studio
  that `lib/business.ts` doesn't support.
- Copied or closely paraphrased text from another site.
- A published post that Austin didn't actually read.

## Constraints

- Follow the SSS compliance standard
  (`sss-hub/docs/specs/2026-10-31-compliance-standard-v1.md`; load the
  `compliance-gate` skill when building): a new public page type, third-party calls,
  and AI-written copy are all in scope. Compliance follow-ups outside this task go
  in the PR body.
- Prices, packages, towns and service area come only from `lib/business.ts` /
  `lib/cities.ts`. The writer never types a price: it uses tokens the site resolves
  at build time (see Content format).
- Next.js 16 differs from most model training data: use the version-matched docs at
  `packages/frontend/node_modules/next/dist/docs/`.
- Existing quality gates stay: Husky pre-commit (secretlint, Prettier, ESLint,
  typecheck), Core CI, Playwright smoke tests (every route in `PAGES` in
  `e2e/pages.spec.ts`), gitleaks. New routes get added to `PAGES`.
- Pipeline runs unattended, so it must fail safe: any error means no PR, never a
  half-written post.
- The researcher reads untrusted web pages. Model calls get no shell and no repo
  write access; only the workflow's own code writes the file and opens the PR.
- Secrets (Anthropic API key, PR token) live only in GitHub repo secrets.
- A PR opened with the default `GITHUB_TOKEN` does not trigger Core CI. The PR must
  be opened with a token that does (fine-grained PAT or GitHub App), or CI must be
  dispatched explicitly.

## Approaches considered

1. **GitHub Actions cron + Claude API, PR per draft — chosen.** Runs without
   Austin's PC, fits the existing CI/release/Vercel-preview flow, and merge =
   approve = publish. Cost: API spend (estimate below) and two secrets to set up.
2. **Scheduled task on Austin's PC.** Free under the subscription but only runs when
   the machine is on, and approval would need its own mechanism. Rejected.
3. **Approval queue in the Hub (phone dashboard like Kinetic League).** Best
   approval UX, most to build, couples the website to the Hub. Deferred; the draft
   files and PR metadata would carry over unchanged if added later.

Austin chose option 1 on 2026-11-16.

## Design

### Pipeline (one run per day, `.github/workflows/blog-draft.yml`)

Triggers: daily `schedule` plus `workflow_dispatch` (manual run). Pipeline code in
`scripts/blog/` (TypeScript, run in CI).

0. **Gate.** Skip the run if 3 or more `blog/*` draft PRs are already open (don't pile
   up unread drafts; this also naturally holds publishing to a human pace).
1. **Researcher** (Claude with web search). Inputs: titles and queries of every
   past `blog/*` PR (open, merged, closed/rejected) and existing posts, so it never
   repeats a topic or re-proposes a rejected one; studio facts from `lib/business.ts`.
   It looks for what local small-business owners actually ask (search suggestions,
   People Also Ask, Reddit and Facebook-group questions, forum threads) and what
   current, credible sources say. It outputs a JSON brief: working title, target
   query, search intent, local angle, why it isn't a duplicate, and 3–6 sources
   (URL plus what each supports). It may return "no good topic today"; the run
   then ends cleanly with no PR.
2. **Writer** (Claude, separate call). Inputs: the brief and a style guide
   (second person, plain, practical, no first-person experience claims; see "Calls I made"). Output: a
   Markdown post of about 700–1,200 words with frontmatter. Every factual claim
   traces to a brief source; unsupported claims get left out, not softened.
3. **Reviewer** (Claude, separate call with its own prompt, ideally a different
   model setting; model IDs live in one config file). It scores the draft against a
   written checklist: sourced claims, no invented numbers or rankings, no
   guarantees, nothing about the studio beyond `lib/business.ts`, no copied phrasing,
   clear local or practical value, voice, no overlap with existing posts. Verdict is
   pass, revise (one automatic rewrite round, then re-review) or reject.
   Reject or a second failed review ends the run with no PR.
4. **Code checks** (deterministic, no LLM, run regardless of the reviewer): frontmatter
   schema, word count range, every source URL returns 200, banned-phrase list ("#1",
   "guaranteed", "rank first", etc.), no literal prices, similarity to existing
   posts and text-overlap against the source pages below a threshold, no raw HTML or
   scripts in the body.
5. **Open the PR.** Branch `blog/<yyyy-mm-dd>-<slug>`, file
   `packages/frontend/content/blog/<slug>.md`. PR body holds the research brief,
   the reviewer's verdict and notes, the source list and the compliance checklist, so
   Austin can review quickly on a phone. Vercel posts the preview link.

Austin approves by merging. Rejecting is closing the PR (its topic then counts as
rejected for the researcher).

### Content format

- Plain Markdown, not MDX (MDX can execute code; model-written content must not).
  Rendered through a sanitizing renderer; raw HTML disallowed.
- Frontmatter: `title`, `description`, `slug`, `date`, `tags`, `sources[]`,
  `reviewed` (set true by the pipeline, shown only in the PR).
- Price and package tokens (for example `{{BUILD_FROM}}`, `{{package:starter}}`)
  resolve from `lib/business.ts` at build time, so a post can never go stale or
  contradict `/pricing`.

### Site changes

- `src/app/blog/page.tsx` (index), `src/app/blog/[slug]/page.tsx` (post,
  `dynamicParams = false`, static), `src/app/blog/feed.xml/route.ts` (RSS),
  `src/lib/blog.ts` (loader and token resolution).
- Metadata per post: canonical, Open Graph via `/api/og`, `Article` and
  `BreadcrumbList` JSON-LD added to `components/StructuredData.tsx`.
- `app/sitemap.ts` lists `/blog` and each post; footer links to `/blog`; each post
  ends with the existing `QuoteCta` and links to the relevant town and `/pricing`
  pages (internal linking is a main SEO payoff).
- `public/llms.txt` mentions the blog (hand-edited, as today).
- `e2e/pages.spec.ts` `PAGES` gets `/blog` and a fixture post route; the empty-blog
  state must render cleanly.
- No per-post AI label: posts present as from Soft Systems Studio, per Austin. Every
  post is still read and approved by him before it goes live.

### Cost and limits

Rough estimate: $0.30–$1 per attempted run (search plus three model calls, one
possible rewrite), so about $10–$30 a month at a daily cadence, less because of
skip days. Austin sets a monthly spend limit on the Anthropic key as a hard cap.

## Success and kill criteria

- Success: first 10 posts live within about 3 weeks; Search Console shows the blog
  URLs indexed and gaining impressions by around 90 days. (Expect nothing before
  then; DR 7 means links are the bigger lever, so backlink/directory work should
  run alongside this, separately.)
- Rethink if, after the first 3 weeks, Austin rejects more than about 70% of drafts
  or the reviewer rejects more than about 50%: the prompts or topic sources are
  wrong, not the idea.

## Austin-only steps (collected up front)

1. Approve this design.
2. Create an Anthropic API key for this pipeline and set a monthly spend limit
   (secret: it never goes through chat; I'll open the console page and a hidden-prompt
   script so he pastes it once).
3. Create a fine-grained GitHub token (repo contents, pull requests and issues
   write; issues for the run log and PR labels) for opening PRs that trigger CI,
   and add both as repo secrets.
4. (Done: author is Soft Systems Studio, one post a day.)
   (Search Console and Bing already hold the sitemap, per CLAUDE.md, so no submission step.)

## Calls I made (check these)

- Author is "Soft Systems Studio" (Austin's decision). I dropped the AI-assistance
  label I'd proposed, since he wants the blog to read as the studio's own. Easy to
  add back as one line in the post template.
- Voice: the writer uses second person ("you") and neutral statements, and makes no
  first-person experience claims ("I built…", "a client told me…"). The only things
  said about the studio are the facts in `lib/business.ts`. This keeps "from the
  studio" honest without inventing stories.
- Plain Markdown only, no MDX.
- Max 3 open draft PRs; one automatic rewrite round.
- Posts about 700–1,200 words, plain and practical to match the site's tone.
- Skip-the-day is a normal outcome, not an error.
- **Run log.** Runs that end without a PR (no topic, reviewer reject, failed code
  checks) are appended as comments on one long-lived GitHub issue, "Blog pipeline
  log". The researcher reads it so it doesn't re-pick a failed topic, and it gives the
  rejection counts the kill criterion needs. No other persistent state.
- **Research inputs.** General web search only, best-effort for the named sources
  (Reddit and forum threads where reachable; Facebook groups are not). Search Console
  query data can be added later as a separate improvement.
- **Date.** `date` is the draft date. Drafts open more than 14 days are closed as
  stale by the pipeline, so a post's date is never far from its publish date.
- **IndexNow.** A small post-merge workflow runs `scripts/indexnow.mjs` for the new
  post's URL and `/blog` (URLs only, no personal data, to the endpoint the repo
  already uses).
- **Test fixture.** The content loader reads `BLOG_CONTENT_DIR` (default
  `content/blog`); e2e points it at a test-only directory containing a fixture post,
  and the empty-blog state is tested with an empty directory. No fake post ships.

## Left to the builder

- Exact markdown library and sanitizer; exact prompt wording and model choices
  (kept in one config file); similarity thresholds; PR token mechanism (PAT vs
  GitHub App) if Austin prefers one; test strategy for the pipeline (unit tests
  with recorded model output are enough; no live-API tests in CI).
