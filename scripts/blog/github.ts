import { z } from 'zod';
import { LABEL_DRAFT, LOG_ISSUE_TITLE } from './config';
import type { SkipReason } from './types';

/** A pull request labelled `blog-draft` (open, merged or closed). */
export interface DraftPr {
  number: number;
  title: string;
  /** From the body's first line, `Target query: <q>`; '' when absent. */
  targetQuery: string;
  state: 'open' | 'closed';
  merged: boolean;
  createdAt: string;
  /** Head branch; only looked up for open PRs ('' for closed ones). */
  branch: string;
}

/** One run-log line. `error` marks a run that threw (exit 1). */
export interface LogEntry {
  date: string;
  outcome: SkipReason | 'pr' | 'error';
  topic?: string;
  detail: string;
}

export interface GitHubClient {
  listDraftPrs(): Promise<DraftPr[]>;
  closeStale(pr: DraftPr, reason: string): Promise<void>;
  branchExists(branch: string): Promise<boolean>;
  createDraftPr(input: {
    branch: string;
    path: string;
    content: string;
    title: string;
    body: string;
  }): Promise<{ url: string }>;
  /** The last `limit` run-log comment bodies (trusted authors only), oldest first. Never writes. */
  readLog(limit: number): Promise<string[]>;
  appendLog(entry: LogEntry): Promise<void>;
}

const API = 'https://api.github.com';
/** REST API version header. 2022-11-28 is the long-standing stable version. */
export const GITHUB_API_VERSION = '2022-11-28';
const PER_PAGE = 100;
/** Hard cap on listed draft PRs, so a misbehaving API can never loop forever. */
export const MAX_LISTED_PRS = 300;
const MAX_LOG_PAGES = 5;
const MAX_COMMENT_CHARS = 4000;
const BASE_BRANCH = 'main';
const BLOG_BRANCH_RE = /^blog\/\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BLOG_PATH_RE = /^packages\/frontend\/content\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
/** Comments by anyone else on a public repo are ignored: they could be planted. */
const TRUSTED = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
export const LOG_DETAIL_MAX = 300;
export const LOG_TOPIC_MAX = 200;

/** Error from a GitHub call. The message names method, path and status, never headers. */
export class GitHubError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

// ---------- log line helpers (shared with run.ts) ----------

const TOKEN_LIKE_RE = /\b(?:sk-ant-[\w-]+|github_pat_\w+|gh[pousr]_\w+|Bearer\s+[\w.-]+)/gi;

/** Removes anything token-shaped. Belt and braces: no code path should ever pass a secret here. */
export function redact(s: string): string {
  return s.replace(TOKEN_LIKE_RE, '[redacted]');
}

/** Single line, no backticks (they would break the fence), token-like strings removed, capped. */
export function clip(s: string, max: number): string {
  const one = redact(s).replace(/`/g, "'").replace(/\s+/g, ' ').trim();
  return one.length <= max ? one : `${one.slice(0, max - 1)}…`;
}

/** The comment body for one log entry: a single JSON line inside a json code fence. */
export function toLogLine(entry: LogEntry): string {
  const safe: LogEntry = {
    date: clip(entry.date, 10),
    outcome: entry.outcome,
    ...(entry.topic ? { topic: clip(entry.topic, LOG_TOPIC_MAX) } : {}),
    detail: clip(entry.detail, LOG_DETAIL_MAX),
  };
  return '```json\n' + JSON.stringify(safe) + '\n```';
}

// ---------- response schemas (GitHub JSON is untrusted) ----------

const issueItemSchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  body: z.string().nullish(),
  state: z.enum(['open', 'closed']),
  created_at: z.string(),
  pull_request: z.object({ merged_at: z.string().nullish() }).optional(),
});
const refSchema = z.object({ object: z.object({ sha: z.string().regex(/^[0-9a-f]{6,64}$/i) }) });
const pullSchema = z.object({ number: z.number().int().positive(), html_url: z.string().url() });
const pullHeadSchema = z.object({ head: z.object({ ref: z.string() }) });
const searchSchema = z.object({ items: z.array(z.unknown()) });
const logIssueSchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  author_association: z.string(),
  pull_request: z.unknown().optional(),
});
const issueCountSchema = z.object({ comments: z.number().int().nonnegative() });
const commentSchema = z.object({ body: z.string().nullish(), author_association: z.string() });

function targetQueryOf(body: string | null | undefined): string {
  const first = (body ?? '').split(/\r?\n/, 1)[0];
  const m = /^Target query:(.*)$/.exec(first);
  return m ? m[1].replace(/\s+/g, ' ').trim().slice(0, LOG_TOPIC_MAX) : '';
}

function encodePath(p: string): string {
  return p.split('/').map(encodeURIComponent).join('/');
}

export function createGitHubClient(
  token: string,
  repo: string,
  fetchFn: typeof fetch = fetch,
): GitHubClient {
  if (!token) throw new Error('GitHub token is empty');
  if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(repo) || repo.includes('..')) {
    throw new Error('GITHUB_REPOSITORY must be owner/name');
  }
  const repoPath = `/repos/${repo}`;
  let logIssue: number | null | undefined; // undefined = not looked up yet, null = none

  async function request(
    method: string,
    path: string,
    body?: unknown,
    okStatuses: number[] = [],
  ): Promise<{ status: number; json: unknown }> {
    const res = await fetchFn(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        'User-Agent': 'sss-blog-pipeline',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await res.text();
    let json: unknown = undefined;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = undefined;
    }
    if (res.ok || okStatuses.includes(res.status)) return { status: res.status, json };
    const msg =
      json && typeof json === 'object' && 'message' in json && typeof json.message === 'string'
        ? json.message
        : '';
    const where = path.split('?')[0];
    throw new GitHubError(
      res.status,
      `GitHub ${method} ${where} failed: HTTP ${res.status}${msg ? ` ${clip(msg, 200)}` : ''}`,
    );
  }

  function parse<T>(schema: z.ZodType<T>, json: unknown, what: string): T {
    const r = schema.safeParse(json);
    if (!r.success) throw new GitHubError(0, `GitHub returned an unexpected ${what} response`);
    return r.data;
  }

  async function deleteBranch(branch: string): Promise<void> {
    await request(
      'DELETE',
      `${repoPath}/git/refs/heads/${encodePath(branch)}`,
      undefined,
      [404, 422],
    );
  }

  /** The oldest issue titled exactly LOG_ISSUE_TITLE opened by a trusted author, or null. */
  async function findLogIssue(): Promise<number | null> {
    if (logIssue !== undefined) return logIssue;
    const q = `repo:${repo} is:issue in:title "${LOG_ISSUE_TITLE}"`;
    const { json } = await request(
      'GET',
      `/search/issues?q=${encodeURIComponent(q)}&sort=created&order=asc&per_page=30`,
    );
    const items = parse(searchSchema, json, 'search').items;
    const matches = items
      .map((i) => logIssueSchema.safeParse(i))
      .flatMap((r) => (r.success ? [r.data] : []))
      .filter(
        (i) =>
          i.title === LOG_ISSUE_TITLE &&
          i.pull_request === undefined &&
          TRUSTED.has(i.author_association),
      )
      .sort((a, b) => a.number - b.number);
    logIssue = matches[0]?.number ?? null;
    return logIssue;
  }

  return {
    async listDraftPrs() {
      const out: DraftPr[] = [];
      for (let page = 1; page * PER_PAGE <= MAX_LISTED_PRS; page++) {
        const params = new URLSearchParams({
          labels: LABEL_DRAFT,
          state: 'all',
          sort: 'created',
          direction: 'desc',
          per_page: String(PER_PAGE),
          page: String(page),
        });
        const { json } = await request('GET', `${repoPath}/issues?${params}`);
        const items = parse(z.array(z.unknown()), json, 'issue list');
        for (const raw of items) {
          const r = issueItemSchema.safeParse(raw);
          if (!r.success || !r.data.pull_request) continue; // malformed or a plain issue
          const i = r.data;
          out.push({
            number: i.number,
            title: i.title.replace(/\s+/g, ' ').trim().slice(0, LOG_TOPIC_MAX),
            targetQuery: targetQueryOf(i.body),
            state: i.state,
            merged: Boolean(i.pull_request?.merged_at),
            createdAt: i.created_at,
            branch: '',
          });
        }
        if (items.length < PER_PAGE) break;
      }
      // The issues endpoint has no head ref; look it up only for the few open drafts.
      for (const pr of out) {
        if (pr.state !== 'open') continue;
        const { json } = await request('GET', `${repoPath}/pulls/${pr.number}`);
        pr.branch = parse(pullHeadSchema, json, 'pull').head.ref;
      }
      return out;
    },

    async closeStale(pr, reason) {
      await request('POST', `${repoPath}/issues/${pr.number}/comments`, { body: reason });
      await request('PATCH', `${repoPath}/pulls/${pr.number}`, { state: 'closed' });
      // GitHub keeps a "Restore branch" button on the closed PR.
      if (BLOG_BRANCH_RE.test(pr.branch)) await deleteBranch(pr.branch);
    },

    async branchExists(branch) {
      const { status } = await request(
        'GET',
        `${repoPath}/git/ref/heads/${encodePath(branch)}`,
        undefined,
        [404],
      );
      return status !== 404;
    },

    async createDraftPr({ branch, path, content, title, body }) {
      if (!BLOG_BRANCH_RE.test(branch)) throw new Error(`refusing branch ${branch}`);
      if (!BLOG_PATH_RE.test(path)) throw new Error(`refusing path ${path}`);

      const head = await request('GET', `${repoPath}/git/ref/heads/${BASE_BRANCH}`);
      const sha = parse(refSchema, head.json, 'ref').object.sha;
      await request('POST', `${repoPath}/git/refs`, { ref: `refs/heads/${branch}`, sha });

      let pr: z.infer<typeof pullSchema>;
      try {
        await request('PUT', `${repoPath}/contents/${encodePath(path)}`, {
          message: `${title}\n\nDrafted by the automated blog pipeline.`,
          content: Buffer.from(content, 'utf8').toString('base64'),
          branch,
        });
        const created = await request('POST', `${repoPath}/pulls`, {
          title,
          head: branch,
          base: BASE_BRANCH,
          body,
          draft: false,
        });
        pr = parse(pullSchema, created.json, 'pull');
      } catch (err) {
        // No PR exists yet: remove the half-made branch so a rerun starts clean.
        await deleteBranch(branch).catch(() => undefined);
        throw err;
      }
      try {
        await request('POST', `${repoPath}/issues/${pr.number}/labels`, { labels: [LABEL_DRAFT] });
      } catch (err) {
        const why = err instanceof Error ? err.message : String(err);
        throw new GitHubError(
          0,
          `PR #${pr.number} opened but labelling it ${LABEL_DRAFT} failed (${why}); add the label by hand`,
        );
      }
      return { url: pr.html_url };
    },

    async readLog(limit) {
      if (limit <= 0) return [];
      const issue = await findLogIssue();
      if (issue === null) return [];
      const { json } = await request('GET', `${repoPath}/issues/${issue}`);
      const total = parse(issueCountSchema, json, 'issue').comments;
      const lastPage = Math.ceil(total / PER_PAGE);
      const collected: string[] = [];
      for (let page = lastPage, n = 0; page >= 1 && n < MAX_LOG_PAGES; page--, n++) {
        const res = await request(
          'GET',
          `${repoPath}/issues/${issue}/comments?per_page=${PER_PAGE}&page=${page}`,
        );
        const bodies = parse(z.array(z.unknown()), res.json, 'comment list')
          .map((c) => commentSchema.safeParse(c))
          .flatMap((r) =>
            r.success && r.data.body && TRUSTED.has(r.data.author_association)
              ? [r.data.body.slice(0, MAX_COMMENT_CHARS)]
              : [],
          );
        collected.unshift(...bodies);
        if (collected.length >= limit) break;
      }
      return collected.slice(-limit);
    },

    async appendLog(entry) {
      let issue = await findLogIssue();
      if (issue === null) {
        const { json } = await request('POST', `${repoPath}/issues`, {
          title: LOG_ISSUE_TITLE,
          body:
            'One comment per daily blog pipeline run that ended without a draft PR (and one per PR opened). ' +
            'The pipeline reads the recent entries so it does not retry a failed topic. Keep this issue open; do not edit the entries.',
        });
        issue = parse(z.object({ number: z.number().int().positive() }), json, 'issue').number;
        logIssue = issue;
      }
      await request('POST', `${repoPath}/issues/${issue}/comments`, { body: toLogLine(entry) });
    },
  };
}
