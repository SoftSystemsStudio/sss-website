import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LABEL_DRAFT, LOG_ISSUE_TITLE } from './config';
import { createGitHubClient, toLogLine, type LogEntry } from './github';

const TOKEN = 'github_pat_TESTTOKEN_abc123';
const REPO = 'acme/site';
const BASE = `https://api.github.com/repos/${REPO}`;

interface Sent {
  method: string;
  url: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
}

type Reply = { status: number; json?: unknown };
type Handler = (method: string, path: string, body: unknown) => Reply | undefined;

/** A fake fetch that records every request and answers from `handler` (404 when it returns nothing). */
function fakeFetch(handler: Handler): { fetchFn: typeof fetch; sent: Sent[] } {
  const sent: Sent[] = [];
  const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = Object.fromEntries(
      Object.entries((init?.headers ?? {}) as Record<string, string>).map(([k, v]) => [
        k.toLowerCase(),
        v,
      ]),
    );
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const path = url.replace('https://api.github.com', '');
    sent.push({ method, url, path, headers, body });
    const r = handler(method, path, body) ?? { status: 404, json: { message: 'Not Found' } };
    return new Response(r.json === undefined ? null : JSON.stringify(r.json), {
      status: r.status,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
  return { fetchFn, sent };
}

const routes = (sent: Sent[]) => sent.map((s) => `${s.method} ${s.path.split('?')[0]}`);

// ---------- construction ----------

test('createGitHubClient rejects a repo that is not owner/name', () => {
  assert.throws(() => createGitHubClient(TOKEN, 'acme'), /owner\/name/);
  assert.throws(() => createGitHubClient(TOKEN, 'acme/site/../x'), /owner\/name/);
  assert.throws(() => createGitHubClient('', REPO), /token/);
});

// ---------- createDraftPr ----------

test('createDraftPr: ref, contents, pulls, label, in order, with auth headers', async () => {
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (method === 'GET' && path === `/repos/${REPO}/git/ref/heads/main`)
      return { status: 200, json: { object: { sha: 'abc123' } } };
    if (method === 'POST' && path === `/repos/${REPO}/git/refs`) return { status: 201, json: {} };
    if (method === 'PUT' && path.startsWith(`/repos/${REPO}/contents/`))
      return { status: 201, json: {} };
    if (method === 'POST' && path === `/repos/${REPO}/pulls`)
      return {
        status: 201,
        json: { number: 42, html_url: 'https://github.com/acme/site/pull/42' },
      };
    if (method === 'POST' && path === `/repos/${REPO}/issues/42/labels`)
      return { status: 200, json: [] };
    return undefined;
  });
  const gh = createGitHubClient(TOKEN, REPO, fetchFn);
  const content = '---\ntitle: "Hi"\n---\n\nBody text, with ünïcode.\n';
  const res = await gh.createDraftPr({
    branch: 'blog/2026-11-16-some-post',
    path: 'packages/frontend/content/blog/some-post.md',
    content,
    title: 'Blog: Some post',
    body: 'Target query: some query\n\nBody',
  });

  assert.equal(res.url, 'https://github.com/acme/site/pull/42');
  assert.deepEqual(routes(sent), [
    `GET /repos/${REPO}/git/ref/heads/main`,
    `POST /repos/${REPO}/git/refs`,
    `PUT /repos/${REPO}/contents/packages/frontend/content/blog/some-post.md`,
    `POST /repos/${REPO}/pulls`,
    `POST /repos/${REPO}/issues/42/labels`,
  ]);
  for (const s of sent) {
    assert.equal(s.headers.authorization, `Bearer ${TOKEN}`);
    assert.equal(s.headers.accept, 'application/vnd.github+json');
    assert.match(s.headers['x-github-api-version'], /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.deepEqual(sent[1].body, { ref: 'refs/heads/blog/2026-11-16-some-post', sha: 'abc123' });
  const put = sent[2].body as { content: string; branch: string; message: string };
  assert.equal(Buffer.from(put.content, 'base64').toString('utf8'), content);
  assert.equal(put.branch, 'blog/2026-11-16-some-post');
  assert.deepEqual(sent[3].body, {
    title: 'Blog: Some post',
    head: 'blog/2026-11-16-some-post',
    base: 'main',
    body: 'Target query: some query\n\nBody',
    draft: false,
  });
  assert.deepEqual(sent[4].body, { labels: [LABEL_DRAFT] });
});

test('createDraftPr deletes the new branch when opening the PR fails, and the error has no token', async () => {
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (method === 'GET' && path.endsWith('/git/ref/heads/main'))
      return { status: 200, json: { object: { sha: 'abc123' } } };
    if (method === 'POST' && path.endsWith('/git/refs')) return { status: 201, json: {} };
    if (method === 'PUT') return { status: 201, json: {} };
    if (method === 'POST' && path.endsWith('/pulls'))
      return { status: 422, json: { message: 'Validation Failed' } };
    if (method === 'DELETE') return { status: 204 };
    return undefined;
  });
  const gh = createGitHubClient(TOKEN, REPO, fetchFn);
  await assert.rejects(
    gh.createDraftPr({
      branch: 'blog/2026-11-16-x',
      path: 'packages/frontend/content/blog/x.md',
      content: 'x',
      title: 'Blog: X',
      body: 'Target query: x',
    }),
    (err: Error) => {
      assert.match(err.message, /422/);
      assert.match(err.message, /Validation Failed/);
      assert.equal(err.message.includes(TOKEN), false);
      assert.equal(/authorization|bearer/i.test(err.message), false);
      return true;
    },
  );
  assert.equal(routes(sent).at(-1), `DELETE /repos/${REPO}/git/refs/heads/blog/2026-11-16-x`);
});

/** A repo where everything works up to the PR, and the label call answers `labelStatus`. */
function labelFailRepo(labelStatus: number, rollbackStatus: number) {
  return fakeFetch((method, path) => {
    if (method === 'GET' && path.endsWith('/git/ref/heads/main'))
      return { status: 200, json: { object: { sha: 'abc123' } } };
    if (method === 'POST' && path.endsWith('/git/refs')) return { status: 201, json: {} };
    if (method === 'PUT') return { status: 201, json: {} };
    if (method === 'POST' && path === `/repos/${REPO}/pulls`)
      return {
        status: 201,
        json: { number: 42, html_url: 'https://github.com/acme/site/pull/42' },
      };
    if (path.endsWith('/issues/42/labels'))
      return { status: labelStatus, json: { message: 'Resource not accessible by integration' } };
    // rollback calls: comment, close, delete branch
    return { status: rollbackStatus, json: { message: 'rollback answer' } };
  });
}
const DRAFT_INPUT = {
  branch: 'blog/2026-11-16-x',
  path: 'packages/frontend/content/blog/x.md',
  content: 'x',
  title: 'Blog: X',
  body: 'Target query: x',
};

test('createDraftPr: a failed label rolls the PR back (comment, close, delete branch) and rethrows', async () => {
  const { fetchFn, sent } = labelFailRepo(403, 200);
  await assert.rejects(
    createGitHubClient(TOKEN, REPO, fetchFn).createDraftPr(DRAFT_INPUT),
    (err: Error) => {
      assert.match(err.message, /labels failed: HTTP 403 Resource not accessible/);
      assert.equal(err.message.includes(TOKEN), false);
      return true;
    },
  );
  assert.deepEqual(routes(sent).slice(-4), [
    `POST /repos/${REPO}/issues/42/labels`,
    `POST /repos/${REPO}/issues/42/comments`,
    `PATCH /repos/${REPO}/pulls/42`,
    `DELETE /repos/${REPO}/git/refs/heads/blog/2026-11-16-x`,
  ]);
  assert.deepEqual(sent.at(-2)?.body, { state: 'closed' });
});

test('createDraftPr: when label AND rollback fail, the original label error still propagates', async () => {
  const { fetchFn, sent } = labelFailRepo(403, 500);
  await assert.rejects(
    createGitHubClient(TOKEN, REPO, fetchFn).createDraftPr(DRAFT_INPUT),
    /labels failed: HTTP 403/,
  );
  // every rollback step was still attempted
  assert.deepEqual(routes(sent).slice(-3), [
    `POST /repos/${REPO}/issues/42/comments`,
    `PATCH /repos/${REPO}/pulls/42`,
    `DELETE /repos/${REPO}/git/refs/heads/blog/2026-11-16-x`,
  ]);
});

test('createDraftPr refuses a branch or path outside the blog namespace', async () => {
  const { fetchFn, sent } = fakeFetch(() => undefined);
  const gh = createGitHubClient(TOKEN, REPO, fetchFn);
  const base = { content: 'x', title: 'Blog: X', body: 'Target query: x' };
  await assert.rejects(
    gh.createDraftPr({ ...base, branch: 'main', path: 'packages/frontend/content/blog/x.md' }),
  );
  await assert.rejects(
    gh.createDraftPr({ ...base, branch: 'blog/2026-11-16-x', path: '.github/workflows/x.yml' }),
  );
  assert.equal(sent.length, 0);
});

// ---------- listDraftPrs ----------

function issueItem(n: number, over: Record<string, unknown> = {}) {
  return {
    number: n,
    title: `Blog: Post ${n}`,
    body: `Target query: query ${n}\n\nmore`,
    state: 'closed',
    created_at: '2026-11-01T06:00:00Z',
    pull_request: { merged_at: null },
    ...over,
  };
}

test('listDraftPrs maps merged_at, target query and state, and reads the branch of open PRs', async () => {
  const items = [
    issueItem(1, { pull_request: { merged_at: '2026-11-03T00:00:00Z' } }),
    issueItem(2),
    issueItem(3, { state: 'open', body: 'Target query:   spaced   query  \r\nrest' }),
    issueItem(4, { pull_request: undefined }), // a plain issue with the label: skipped
    { number: 'bad' }, // malformed: skipped
    issueItem(5, { body: null }),
  ];
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith(`/repos/${REPO}/issues?`)) return { status: 200, json: items };
    if (path.startsWith(`/repos/${REPO}/pulls?`)) return { status: 200, json: [] };
    // #3 is open but missing from the open list (a race): its branch is looked up directly.
    if (path === `/repos/${REPO}/pulls/3`)
      return {
        status: 200,
        json: { head: { ref: 'blog/2026-11-14-post-3', repo: { full_name: REPO } } },
      };
    return undefined;
  });
  const prs = await createGitHubClient(TOKEN, REPO, fetchFn).listDraftPrs();

  const listCall = sent.find((s) => s.path.startsWith(`/repos/${REPO}/issues?`));
  assert.ok(listCall);
  const q = new URL(listCall.url).searchParams;
  assert.equal(q.get('labels'), LABEL_DRAFT);
  assert.equal(q.get('state'), 'all');

  assert.deepEqual(
    prs.map((p) => [p.number, p.state, p.merged, p.targetQuery, p.branch]),
    [
      [1, 'closed', true, 'query 1', ''],
      [2, 'closed', false, 'query 2', ''],
      [3, 'open', false, 'spaced query', 'blog/2026-11-14-post-3'],
      [5, 'closed', false, '', ''],
    ],
  );
  assert.equal(prs[0].title, 'Blog: Post 1');
  assert.equal(prs[0].createdAt, '2026-11-01T06:00:00Z');
});

test('listDraftPrs reads the pillar from a strict Pillar line, else empty', async () => {
  const items = [
    issueItem(1, { body: 'Target query: q\n\n- **Pillar:** After-launch care (`after-launch`)\n' }),
    issueItem(2, { body: 'Target query: q\n\n- **Pillar:** Evil (`drop-tables`)' }),
    issueItem(3, { body: 'Target query: q\n\n- **Pillar:** After-launch care' }),
  ];
  const { fetchFn } = fakeFetch((method, path) => {
    if (path.startsWith(`/repos/${REPO}/issues?`)) return { status: 200, json: items };
    if (path.startsWith(`/repos/${REPO}/pulls?`))
      return {
        status: 200,
        json: [
          openPull(9, 'blog/2026-11-15-x', {
            body: 'Target query: q\n- **Pillar:** Mobile and speed (`mobile-speed`)',
          }),
        ],
      };
    return undefined;
  });
  const prs = await createGitHubClient(TOKEN, REPO, fetchFn).listDraftPrs();
  assert.deepEqual(
    prs.map((p) => [p.number, p.pillar]),
    [
      [1, 'after-launch'],
      [2, ''],
      [3, ''],
      [9, 'mobile-speed'],
    ],
  );
});

test('listDraftPrs paginates and stops at a hard cap', async () => {
  const full = (page: number) =>
    Array.from({ length: 100 }, (_, i) => issueItem(page * 1000 + i, { state: 'closed' }));
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith(`/repos/${REPO}/issues?`)) {
      const page = Number(new URL(`https://x${path}`).searchParams.get('page'));
      return { status: 200, json: full(page) };
    }
    if (path.startsWith(`/repos/${REPO}/pulls?`)) return { status: 200, json: [] };
    return undefined;
  });
  const prs = await createGitHubClient(TOKEN, REPO, fetchFn).listDraftPrs();
  assert.equal(sent.filter((s) => s.path.startsWith(`/repos/${REPO}/issues?`)).length, 3);
  assert.equal(prs.length, 300);
});

test('listDraftPrs stops after a short page', async () => {
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith(`/repos/${REPO}/issues?`)) return { status: 200, json: [issueItem(1)] };
    if (path.startsWith(`/repos/${REPO}/pulls?`)) return { status: 200, json: [] };
    return undefined;
  });
  await createGitHubClient(TOKEN, REPO, fetchFn).listDraftPrs();
  assert.deepEqual(routes(sent), [`GET /repos/${REPO}/issues`, `GET /repos/${REPO}/pulls`]);
});

function openPull(n: number, ref: string, over: Record<string, unknown> = {}) {
  return {
    number: n,
    title: `Blog: Open ${n}`,
    body: `Target query: open query ${n}`,
    state: 'open',
    created_at: '2026-11-10T06:00:00Z',
    head: { ref, repo: { full_name: REPO } },
    ...over,
  };
}

test('listDraftPrs only treats PRs whose head is in this repo as ours (forks, deleted forks excluded)', async () => {
  const head = (ref: string, repo: unknown) => ({ head: { ref, repo } });
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith(`/repos/${REPO}/issues?`))
      return {
        status: 200,
        json: [
          issueItem(1, { state: 'open' }), // labelled, but its head is a fork
          issueItem(2, { state: 'open' }), // labelled, missing from list; lookup says fork
          issueItem(3), // labelled closed history: kept
        ],
      };
    if (path.startsWith(`/repos/${REPO}/pulls?`))
      return {
        status: 200,
        json: [
          openPull(
            1,
            'blog/2026-11-12-labelled-fork',
            head('blog/2026-11-12-labelled-fork', { full_name: 'evil/site' }),
          ),
          openPull(
            7,
            'blog/2026-11-14-same-repo',
            head('blog/2026-11-14-same-repo', { full_name: 'ACME/Site' }),
          ),
          openPull(
            8,
            'blog/2026-11-14-fork',
            head('blog/2026-11-14-fork', { full_name: 'evil/site' }),
          ),
          openPull(9, 'blog/2026-11-14-deleted-fork', head('blog/2026-11-14-deleted-fork', null)),
          openPull(10, 'blog/2026-11-14-no-repo', { head: { ref: 'blog/2026-11-14-no-repo' } }),
        ],
      };
    if (path === `/repos/${REPO}/pulls/2`)
      return { status: 200, json: head('blog/2026-11-13-other', { full_name: 'evil/site' }) };
    return undefined;
  });
  const prs = await createGitHubClient(TOKEN, REPO, fetchFn).listDraftPrs();
  assert.deepEqual(
    prs.map((p) => [p.number, p.state, p.branch]),
    [
      [3, 'closed', ''],
      [7, 'open', 'blog/2026-11-14-same-repo'], // case-insensitive repo match
    ],
  );
  assert.equal(
    sent.some((s) => s.method !== 'GET'),
    false,
  );
});

test('listDraftPrs adds unlabelled open PRs on a blog/ branch and never a human PR', async () => {
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith(`/repos/${REPO}/issues?`))
      return { status: 200, json: [issueItem(1, { state: 'open' }), issueItem(2)] };
    if (path.startsWith(`/repos/${REPO}/pulls?`))
      return {
        status: 200,
        json: [
          openPull(1, 'blog/2026-11-12-labelled'), // labelled: branch taken from here
          openPull(7, 'blog/2026-11-14-unlabelled-orphan'), // label failed: still a draft
          openPull(8, 'fix/some-human-change'), // a human's PR: never a draft
          openPull(9, 'blog/not-a-date'), // near miss: not a draft
          { number: 'bad' },
        ],
      };
    return undefined;
  });
  const prs = await createGitHubClient(TOKEN, REPO, fetchFn).listDraftPrs();
  assert.deepEqual(
    prs.map((p) => [p.number, p.state, p.branch, p.targetQuery]),
    [
      [1, 'open', 'blog/2026-11-12-labelled', 'query 1'],
      [2, 'closed', '', 'query 2'],
      [7, 'open', 'blog/2026-11-14-unlabelled-orphan', 'open query 7'],
    ],
  );
  const openList = sent.find((s) => s.path.startsWith(`/repos/${REPO}/pulls?`));
  assert.equal(new URL(openList!.url).searchParams.get('state'), 'open');
  // no per-PR lookup when the open list already gave the branch
  assert.equal(
    sent.some((s) => /\/pulls\/\d+$/.test(s.path)),
    false,
  );
});

test('the open-PR list is not limited by the 300 history cap but has a hard stop', async () => {
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith(`/repos/${REPO}/issues?`)) return { status: 200, json: [] };
    if (path.startsWith(`/repos/${REPO}/pulls?`)) {
      const page = Number(new URL(`https://x${path}`).searchParams.get('page'));
      return {
        status: 200,
        json: Array.from({ length: 100 }, (_, i) =>
          openPull(page * 1000 + i, i === 0 ? `blog/2026-11-14-p${page}` : `feat/x-${i}`),
        ),
      };
    }
    return undefined;
  });
  const prs = await createGitHubClient(TOKEN, REPO, fetchFn).listDraftPrs();
  assert.equal(sent.filter((s) => s.path.startsWith(`/repos/${REPO}/pulls?`)).length, 50);
  assert.equal(prs.length, 50); // one blog/ branch per page, including pages past 3
});

// ---------- branchExists / closeStale ----------

test('branchExists: 200 true, 404 false, other statuses throw', async () => {
  const status = { value: 200 };
  const { fetchFn, sent } = fakeFetch(() => ({ status: status.value, json: {} }));
  const gh = createGitHubClient(TOKEN, REPO, fetchFn);
  assert.equal(await gh.branchExists('blog/2026-11-16-x'), true);
  assert.equal(sent[0].path, `/repos/${REPO}/git/ref/heads/blog/2026-11-16-x`);
  status.value = 404;
  assert.equal(await gh.branchExists('blog/2026-11-16-x'), false);
  status.value = 500;
  await assert.rejects(gh.branchExists('blog/2026-11-16-x'), /500/);
});

test('closeStale comments, closes the PR and deletes its blog branch', async () => {
  const { fetchFn, sent } = fakeFetch((method) => ({ status: method === 'DELETE' ? 204 : 200 }));
  const gh = createGitHubClient(TOKEN, REPO, fetchFn);
  await gh.closeStale(
    {
      number: 9,
      title: 'Blog: Old',
      targetQuery: 'old',
      pillar: '',
      state: 'open',
      merged: false,
      createdAt: '2026-10-01T00:00:00Z',
      branch: 'blog/2026-10-01-old',
    },
    'Open for more than 14 days.',
  );
  assert.deepEqual(routes(sent), [
    `POST /repos/${REPO}/issues/9/comments`,
    `PATCH /repos/${REPO}/pulls/9`,
    `DELETE /repos/${REPO}/git/refs/heads/blog/2026-10-01-old`,
  ]);
  assert.deepEqual(sent[1].body, { state: 'closed' });
});

// ---------- run log ----------

const ENTRY: LogEntry = { date: '2026-11-16', outcome: 'no-topic', detail: 'nothing new today' };

test('appendLog creates the log issue when absent, then comments a JSON line', async () => {
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith('/search/issues')) return { status: 200, json: { items: [] } };
    if (method === 'POST' && path === `/repos/${REPO}/issues`)
      return { status: 201, json: { number: 77 } };
    if (method === 'POST' && path === `/repos/${REPO}/issues/77/comments`)
      return { status: 201, json: {} };
    return undefined;
  });
  await createGitHubClient(TOKEN, REPO, fetchFn).appendLog(ENTRY);
  assert.deepEqual(routes(sent), [
    'GET /search/issues',
    `POST /repos/${REPO}/issues`,
    `POST /repos/${REPO}/issues/77/comments`,
  ]);
  assert.equal((sent[1].body as { title: string }).title, LOG_ISSUE_TITLE);
  const comment = (sent[2].body as { body: string }).body;
  assert.equal(comment, toLogLine(ENTRY));
});

test('appendLog reuses a trusted log issue and ignores a look-alike by an outsider', async () => {
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith('/search/issues'))
      return {
        status: 200,
        json: {
          items: [
            { number: 5, title: LOG_ISSUE_TITLE, author_association: 'NONE' },
            { number: 12, title: `${LOG_ISSUE_TITLE} (old)`, author_association: 'OWNER' },
            { number: 30, title: LOG_ISSUE_TITLE, author_association: 'OWNER' },
            { number: 31, title: LOG_ISSUE_TITLE, author_association: 'MEMBER', pull_request: {} },
          ],
        },
      };
    if (method === 'POST' && path === `/repos/${REPO}/issues/30/comments`)
      return { status: 201, json: {} };
    return undefined;
  });
  const gh = createGitHubClient(TOKEN, REPO, fetchFn);
  await gh.appendLog(ENTRY);
  await gh.appendLog(ENTRY);
  assert.deepEqual(routes(sent), [
    'GET /search/issues',
    `POST /repos/${REPO}/issues/30/comments`,
    `POST /repos/${REPO}/issues/30/comments`,
  ]);
});

test('toLogLine is one fenced JSON line, capped, with no backticks and no token-like strings', () => {
  const line = toLogLine({
    date: '2026-11-16',
    outcome: 'error',
    topic: 'T'.repeat(500),
    detail: `boom \`\`\` sk-ant-api03-SECRETSECRET ghp_abcdefghijklmnop github_pat_11ABC_def\n${'x'.repeat(1000)}`,
  });
  const m = /^```json\n(.*)\n```$/.exec(line);
  assert.ok(m, 'fenced single JSON line');
  const parsed = JSON.parse(m[1]) as LogEntry;
  assert.ok(parsed.detail.length <= 300);
  assert.ok((parsed.topic ?? '').length <= 200);
  assert.equal(parsed.detail.includes('`'), false);
  assert.equal(/sk-ant-|ghp_|github_pat_/.test(m[1]), false);
  assert.equal(parsed.detail.includes('\n'), false);
});

test('readLog returns the last N trusted comment bodies and never creates the issue', async () => {
  const comments = Array.from({ length: 150 }, (_, i) => ({
    body: `entry ${i}`,
    author_association: i % 10 === 9 ? 'NONE' : 'OWNER',
  }));
  const { fetchFn, sent } = fakeFetch((method, path) => {
    if (path.startsWith('/search/issues'))
      return {
        status: 200,
        json: { items: [{ number: 30, title: LOG_ISSUE_TITLE, author_association: 'OWNER' }] },
      };
    if (path === `/repos/${REPO}/issues/30`) return { status: 200, json: { comments: 150 } };
    if (path.startsWith(`/repos/${REPO}/issues/30/comments?`)) {
      const page = Number(new URL(`https://x${path}`).searchParams.get('page'));
      return { status: 200, json: comments.slice((page - 1) * 100, page * 100) };
    }
    return undefined;
  });
  const out = await createGitHubClient(TOKEN, REPO, fetchFn).readLog(60);
  assert.equal(out.length, 60);
  assert.equal(out.at(-1), 'entry 148');
  assert.equal(out.includes('entry 149'), false); // outsider comment
  assert.equal(
    sent.some((s) => s.method !== 'GET'),
    false,
  );
});

test('readLog returns [] when there is no log issue, without writing', async () => {
  const { fetchFn, sent } = fakeFetch((method, path) =>
    path.startsWith('/search/issues') ? { status: 200, json: { items: [] } } : undefined,
  );
  assert.deepEqual(await createGitHubClient(TOKEN, REPO, fetchFn).readLog(60), []);
  assert.equal(
    sent.some((s) => s.method !== 'GET'),
    false,
  );
});
