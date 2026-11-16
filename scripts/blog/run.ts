import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import { parseFrontmatter } from '../../packages/frontend/src/lib/blog-frontmatter';
import { checkSourceUrls, fetchSourceTexts, runChecks, type CheckFailure } from './checks';
import { MAX_OPEN_DRAFTS, MAX_REVISIONS, STALE_DAYS } from './config';
import {
  clip,
  LOG_DETAIL_MAX,
  LOG_TOPIC_MAX,
  type DraftPr,
  type GitHubClient,
  type LogEntry,
} from './github';
import type { CallModel } from './models';
import { research, review, write } from './stages';
import type { Brief, ReviewResult, RunOutcome, SkipReason } from './types';

export const CONTENT_PATH = 'packages/frontend/content/blog';
export const DEFAULT_DRY_RUN_DIR = 'blog-dry-run';
/** How many run-log entries the researcher sees. */
export const RECENT_LOG_LIMIT = 60;
const DAY_MS = 86_400_000;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface RunDeps {
  call: CallModel;
  gh: GitHubClient;
  fetchFn: typeof fetch;
  now: () => Date;
  existingPosts: { slug: string; title: string; body: string }[];
  dryRun: boolean;
  outDir?: string;
}

/** Posts in `dir` (the content dir on main), bodies without frontmatter. */
export function loadExistingPosts(dir: string): RunDeps['existingPosts'] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const { data, content } = parseFrontmatter(readFileSync(join(dir, f), 'utf8'));
      return {
        slug: typeof data.slug === 'string' ? data.slug : f.replace(/\.md$/, ''),
        title: typeof data.title === 'string' ? data.title : '',
        body: content,
      };
    });
}

// ---------- run log ----------

const logEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  outcome: z.enum([
    'gate-full',
    'no-topic',
    'reviewer-reject',
    'checks-failed',
    'slug-collision',
    'pr',
    'error',
  ]),
  topic: z.string().optional(),
  detail: z.string(),
});

/**
 * Turns raw log comment bodies into short lines for the researcher. Anything that is
 * not one well-formed entry (free text, edited JSON, wrong fields) is dropped, never
 * passed through; long fields are capped. Keeps the last RECENT_LOG_LIMIT entries.
 */
export function formatLogLines(raw: string[]): string[] {
  const lines: string[] = [];
  for (const body of raw) {
    const m = /^\s*(?:```(?:json)?\s*\n)?([\s\S]*?)(?:\n```)?\s*$/.exec(body.slice(0, 4000));
    let parsed: unknown;
    try {
      parsed = JSON.parse(m ? m[1] : body);
    } catch {
      continue;
    }
    const r = logEntrySchema.safeParse(parsed);
    if (!r.success) continue;
    const e = r.data;
    const topic = e.topic ? ` [${clip(e.topic, LOG_TOPIC_MAX)}]` : '';
    lines.push(`${e.date} ${e.outcome}${topic}: ${clip(e.detail, LOG_DETAIL_MAX)}`);
  }
  return lines.slice(-RECENT_LOG_LIMIT);
}

// ---------- PR body ----------

/** Stops model-written text from @-mentioning (and so notifying) anyone on GitHub. */
function noMentions(s: string): string {
  return s.replace(/@(?=[A-Za-z0-9])/g, '@​');
}

function inline(s: string): string {
  return noMentions(s.replace(/\s+/g, ' ').trim());
}

function linkText(s: string): string {
  return inline(s).replace(/([[\]\\])/g, '\\$1');
}

export function buildPrBody(input: {
  brief: Brief;
  date: string;
  review: ReviewResult;
  rewrites: number;
}): string {
  const { brief, review: rv } = input;
  return [
    `Target query: ${inline(brief.targetQuery)}`,
    '',
    `Automated blog draft for ${input.date}. **Merge to publish; close to reject** (a closed PR's topic counts as rejected and is not proposed again). Drafts left open for ${STALE_DAYS} days are closed automatically.`,
    '',
    '## Research brief',
    '',
    `- **Working title:** ${inline(brief.title)}`,
    `- **Intent:** ${inline(brief.intent)}`,
    `- **Local angle:** ${inline(brief.localAngle)}`,
    `- **Not a duplicate because:** ${inline(brief.notDuplicateBecause)}`,
    '',
    '## Reviewer',
    '',
    `Verdict: **${rv.verdict}**${input.rewrites ? ` after ${input.rewrites} rewrite${input.rewrites > 1 ? 's' : ''}` : ''}`,
    '',
    ...(rv.notes.length ? rv.notes.map((n) => `- ${inline(n)}`) : ['- (no notes)']),
    '',
    'Code checks: all passed (frontmatter, word count, banned phrases, raw HTML, tokens, literal prices, unsourced dollar amounts, overlap with existing posts and sources, source URLs reachable).',
    '',
    '## Sources',
    '',
    ...brief.sources.map(
      (s, i) => `${i + 1}. [${linkText(s.title)}](${new URL(s.url).href}): ${inline(s.supports)}`,
    ),
    '',
    '## Compliance checklist (before merging)',
    '',
    '- [ ] Every factual claim traces to one of the sources above',
    '- [ ] No invented numbers, rankings, guarantees or results',
    '- [ ] Studio facts and prices appear only as `{{TOKENS}}` (nothing typed by hand)',
    '- [ ] No copied phrasing from a source',
    '- [ ] A human has read the whole post in the Vercel preview',
  ].join('\n');
}

// ---------- pipeline ----------

function errorDetail(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

function pastQueries(prs: DraftPr[]): string[] {
  return prs
    .filter((p) => p.targetQuery)
    .map((p) => {
      const status = p.state === 'open' ? 'open draft' : p.merged ? 'published' : 'rejected';
      return `${status}: ${p.targetQuery}`;
    });
}

function failureDetail(failures: CheckFailure[]): string {
  const codes = [...new Set(failures.map((f) => f.code))].join(', ');
  return `codes: ${codes}; ${failures[0].message}`;
}

/**
 * One daily run. Returns a RunOutcome for every normal ending (PR or skip). Errors
 * (unusable model output, model refusals, API failures) are logged when possible and
 * rethrown, so the CLI exits 1 and no PR exists.
 */
export async function runPipeline(deps: RunDeps): Promise<RunOutcome> {
  const { call, gh, dryRun } = deps;
  const now = deps.now();
  const date = now.toISOString().slice(0, 10);

  /** Appends to the run log (never on a dry run). A failed append never changes the outcome. */
  async function log(outcome: LogEntry['outcome'], detail: string, topic?: string) {
    if (dryRun) return;
    try {
      await gh.appendLog({
        date,
        outcome,
        detail: clip(detail, LOG_DETAIL_MAX),
        ...(topic ? { topic: clip(topic, LOG_TOPIC_MAX) } : {}),
      });
    } catch (err) {
      console.warn(`blog: could not append to the run log: ${clip(errorDetail(err), 300)}`);
    }
  }

  async function skip(reason: SkipReason, detail: string, topic?: string): Promise<RunOutcome> {
    const d = clip(detail, LOG_DETAIL_MAX);
    await log(reason, d, topic);
    return { kind: 'skipped', reason, detail: d };
  }

  let topic: string | undefined;
  try {
    // 0. Stale drafts, then the open-drafts gate.
    const prs = await gh.listDraftPrs();
    const staleBefore = now.getTime() - STALE_DAYS * DAY_MS;
    const isStale = (p: DraftPr) => p.state === 'open' && Date.parse(p.createdAt) < staleBefore;
    for (const p of prs.filter(isStale)) {
      if (!dryRun) {
        await gh.closeStale(
          p,
          `Closed automatically: this draft was open for more than ${STALE_DAYS} days, so its date would be stale. Reopen it (and restore the branch) to publish it anyway.`,
        );
      }
    }
    const open = prs.filter((p) => p.state === 'open' && !isStale(p));
    if (open.length >= MAX_OPEN_DRAFTS) {
      return await skip('gate-full', `${open.length} draft PRs already open`);
    }

    // 1. Research.
    const recentLog = formatLogLines(await gh.readLog(RECENT_LOG_LIMIT));
    const found = await research(call, {
      existingTitles: [
        ...deps.existingPosts.map((p) => p.title),
        ...prs.map((p) => p.title.replace(/^Blog:\s*/, '')),
      ],
      pastQueries: pastQueries(prs),
      recentLog,
    });
    if (found.kind === 'none') return await skip('no-topic', found.reason);
    const brief = found.brief;
    topic = `${brief.title} (query: ${brief.targetQuery})`;

    // 2–3. Write and review, with at most MAX_REVISIONS rewrites.
    let markdown = await write(call, brief, { date });
    let verdict = await review(call, brief, markdown);
    let rewrites = 0;
    while (verdict.verdict === 'revise' && rewrites < MAX_REVISIONS) {
      rewrites++;
      markdown = await write(call, brief, { date, revisionNotes: verdict.notes });
      verdict = await review(call, brief, markdown);
    }
    if (verdict.verdict !== 'pass') {
      const notes = verdict.notes.join(' | ') || '(no notes)';
      return await skip('reviewer-reject', `${verdict.verdict}: ${notes}`, topic);
    }

    // 4. Deterministic checks.
    const urls = brief.sources.map((s) => s.url);
    const failures = [
      ...runChecks({
        markdown,
        existingPosts: deps.existingPosts.map((p) => ({ slug: p.slug, body: p.body })),
        sourceTexts: await fetchSourceTexts(urls, deps.fetchFn),
      }),
      ...(await checkSourceUrls(urls, deps.fetchFn)),
    ];
    if (failures.length) return await skip('checks-failed', failureDetail(failures), topic);

    // Slug and title come from the frontmatter write() produced, never recomputed.
    const fm = parseFrontmatter(markdown).data;
    const slug = typeof fm.slug === 'string' ? fm.slug : '';
    const title = typeof fm.title === 'string' ? fm.title : '';
    if (!SLUG_RE.test(slug) || !title) {
      return await skip('checks-failed', 'codes: frontmatter; missing slug or title', topic);
    }

    // 5. Collisions: on main, in another open draft, or today's branch already exists.
    const branch = `blog/${date}-${slug}`;
    if (deps.existingPosts.some((p) => p.slug === slug)) {
      return await skip('slug-collision', `slug ${slug} is already a post on main`, topic);
    }
    const draftBranch = new RegExp(`^blog/\\d{4}-\\d{2}-\\d{2}-${slug}$`);
    const twin = open.find((p) => draftBranch.test(p.branch));
    if (twin) {
      return await skip(
        'slug-collision',
        `slug ${slug} is already open as PR #${twin.number}`,
        topic,
      );
    }
    if (!dryRun && (await gh.branchExists(branch))) {
      return await skip('slug-collision', `branch ${branch} already exists`, topic);
    }

    // 6. Open the PR (or write files on a dry run).
    const body = buildPrBody({ brief, date, review: verdict, rewrites });
    if (dryRun) {
      const dir = resolve(deps.outDir ?? DEFAULT_DRY_RUN_DIR);
      mkdirSync(dir, { recursive: true });
      const file = join(dir, `${slug}.md`);
      writeFileSync(file, markdown, 'utf8');
      writeFileSync(join(dir, `${slug}.pr.md`), body, 'utf8');
      return { kind: 'pr', url: pathToFileURL(file).href };
    }
    const { url } = await gh.createDraftPr({
      branch,
      path: `${CONTENT_PATH}/${slug}.md`,
      content: markdown,
      title: `Blog: ${title}`,
      body,
    });
    await log('pr', url, topic);
    return { kind: 'pr', url };
  } catch (err) {
    await log('error', errorDetail(err), topic);
    throw err;
  }
}
