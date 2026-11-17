import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createDiscordNotifier,
  formatNotification,
  MAX_CONTENT,
  NotifyError,
  type NotifyEvent,
} from './notify';

// Obviously fake: a real webhook URL is a secret and never appears in the repo.
const TOKEN = 'FAKE_TOKEN_FOR_TESTS';
const HOOK = `https://discord.com/api/webhooks/123456789012345678/${TOKEN}`;
const PR_URL = 'https://github.com/SoftSystemsStudio/sss-website/pull/82';

const PR_EVENT: NotifyEvent = {
  kind: 'pr',
  url: PR_URL,
  title: 'Does Your Small Business Still Need a Website?',
  competition: 'medium',
  pillar: 'need',
  seoOk: 9,
  seoTotal: 11,
};

type Sent = { url: string; init: RequestInit; body: Record<string, unknown> };

/** A fetch that answers from `replies` in order (a Response, or an Error to throw). */
function fakeFetch(replies: (Response | Error | 'hang')[]): {
  fetchFn: typeof fetch;
  sent: Sent[];
} {
  const sent: Sent[] = [];
  const queue = [...replies];
  const fetchFn = (async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    sent.push({ url, init, body: JSON.parse(String(init.body)) as Record<string, unknown> });
    const next = queue.shift();
    if (next === undefined) throw new Error('fake fetch: no reply left');
    if (next === 'hang') {
      return new Promise<Response>((_, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(new DOMException('The operation was aborted.', 'TimeoutError')),
        );
      });
    }
    if (next instanceof Error) throw next;
    return next;
  }) as unknown as typeof fetch;
  return { fetchFn, sent };
}

const noSleep = { sleep: async () => undefined };

function ok(): Response {
  return new Response(null, { status: 204 });
}

// ---------- formatting ----------

test('a pr event reads as one line with every field', () => {
  assert.deepEqual(formatNotification(PR_EVENT), {
    content: `New blog draft ready to review: Does Your Small Business Still Need a Website? - ${PR_URL} (competition: medium, pillar: need, SEO checks passed: 9/11). Read it in the Vercel preview on the PR, then merge to publish or close to reject.`,
  });
});

test('missing optional parts are left out cleanly', () => {
  const bare = formatNotification({ kind: 'pr', url: PR_URL, title: 'A post' }).content;
  assert.equal(
    bare,
    `New blog draft ready to review: A post - ${PR_URL}. Read it in the Vercel preview on the PR, then merge to publish or close to reject.`,
  );
  const some = formatNotification({
    kind: 'pr',
    url: PR_URL,
    title: 'A post',
    pillar: 'cost',
    seoOk: 3,
  }).content;
  assert.match(some, / - https:\S+ \(pillar: cost\)\. Read it/);
  assert.equal(some.includes('SEO'), false);
});

test('a skip event names the reason and the detail', () => {
  assert.deepEqual(
    formatNotification({ kind: 'skipped', reason: 'no-topic', detail: 'nothing winnable today' }),
    { content: 'No blog draft today (no-topic): nothing winnable today' },
  );
});

test('a pr URL that is not a GitHub pull request URL is rejected', () => {
  for (const url of [
    'https://github.com/acme/site/pull/1/files',
    'http://github.com/acme/site/pull/1',
    'https://github.com.evil.com/acme/site/pull/1',
    'https://github.com/acme/site/pull/1?x=1',
    'https://github.com/acme/site/pull/abc',
    'https://evil.com/https://github.com/acme/site/pull/1',
    'file:///tmp/post.md',
    `${PR_URL}\n@everyone`,
  ]) {
    assert.throws(() => formatNotification({ ...PR_EVENT, url }), /pull request URL/, url);
  }
});

test('mentions, markup, backticks and newlines are neutralised', () => {
  const nasty = '@everyone @here <@123> <#456> <@&789> `code` [click](https://evil.example)\nline2';
  for (const content of [
    formatNotification({ ...PR_EVENT, title: nasty, competition: '@here', pillar: '<@1>' }).content,
    formatNotification({ kind: 'skipped', reason: 'checks-failed', detail: nasty }).content,
  ]) {
    assert.equal(/@(everyone|here)/.test(content), false, content);
    assert.equal(/[<>`\n\r]/.test(content), false, content);
    assert.equal(content.includes('[click]('), false, content);
    assert.equal(content.includes('](https'), false, content);
  }
});

test('long fields are capped: title 150, detail 200, the whole message at most 1,800', () => {
  const big = 'x'.repeat(5000);
  const pr = formatNotification({ ...PR_EVENT, title: big, competition: big, pillar: big });
  assert.ok(pr.content.length <= MAX_CONTENT);
  assert.equal(/x{151}/.test(pr.content.split(' - ')[0]), false);
  assert.ok(pr.content.includes('x'.repeat(149)));
  const skip = formatNotification({ kind: 'skipped', reason: 'no-topic', detail: big });
  assert.ok(skip.content.length <= 'No blog draft today (no-topic): '.length + 200);
  assert.equal(/x{201}/.test(skip.content), false);
});

test('odd SEO counts are left out rather than printed', () => {
  for (const [seoOk, seoTotal] of [
    [Number.NaN, 11],
    [3, -1],
    [12, 11],
    [1.5, 11],
  ]) {
    const c = formatNotification({ ...PR_EVENT, seoOk, seoTotal }).content;
    assert.equal(c.includes('SEO'), false, `${seoOk}/${seoTotal}`);
  }
});

// ---------- webhook URL validation ----------

test('valid Discord webhook URLs are accepted', () => {
  for (const url of [
    HOOK,
    `https://discordapp.com/api/webhooks/123456789012345678/${TOKEN}`,
    `${HOOK}?wait=true`,
    'https://DISCORD.com/api/webhooks/1/abc-DEF_123',
  ]) {
    assert.doesNotThrow(() => createDiscordNotifier(url, fakeFetch([]).fetchFn), url);
  }
});

test('anything else is refused with an error that never contains the URL or token', () => {
  const bad = [
    '',
    'not a url',
    `http://discord.com/api/webhooks/123456789012345678/${TOKEN}`,
    `https://discord.com.evil.com/api/webhooks/123456789012345678/${TOKEN}`,
    `https://evil.com/api/webhooks/123456789012345678/${TOKEN}`,
    `https://evildiscord.com/api/webhooks/123456789012345678/${TOKEN}`,
    `https://canary.discord.com/api/webhooks/123456789012345678/${TOKEN}`,
    // Built in pieces so the secret scanner does not flag the fake userinfo.
    ['https://user', `pass@discord.com/api/webhooks/123456789012345678/${TOKEN}`].join(':'),
    `https://${TOKEN}@discord.com/api/webhooks/123456789012345678/${TOKEN}`,
    `https://discord.com:8443/api/webhooks/123456789012345678/${TOKEN}`,
    `https://discord.com/api/webhooks/abc/${TOKEN}`,
    `https://discord.com/api/webhooks/123456789012345678/`,
    `https://discord.com/api/webhooks/123456789012345678/${TOKEN}/slack`,
    `https://discord.com/api/webhooks/123456789012345678/${TOKEN}/../../x`,
    `https://discord.com/api/v10/webhooks/123456789012345678/${TOKEN}`,
    `${HOOK}?wait=false`,
    `${HOOK}?thread_id=1`,
    `${HOOK}?wait=true&x=1`,
    `${HOOK}#frag`,
    `https://discord.com/api/webhooks/123456789012345678/${TOKEN}%2F..`,
  ];
  for (const url of bad) {
    let caught: unknown;
    try {
      createDiscordNotifier(url, fakeFetch([]).fetchFn);
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof Error, `accepted: ${url.replace(TOKEN, '<token>')}`);
    assert.match(caught.message, /DISCORD_WEBHOOK_URL is not a valid Discord webhook URL/);
    assert.equal(caught.message.includes(TOKEN), false);
    assert.equal(caught.message.includes('123456789012345678'), false);
    assert.equal(String(caught.stack).includes(TOKEN), false);
    assert.equal(caught.cause, undefined);
  }
});

// ---------- sending ----------

test('posts JSON with a fixed username and no mentions allowed, to the webhook URL', async () => {
  const { fetchFn, sent } = fakeFetch([ok()]);
  await createDiscordNotifier(HOOK, fetchFn, noSleep)(PR_EVENT);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, HOOK);
  assert.equal(sent[0].init.method, 'POST');
  assert.equal(new Headers(sent[0].init.headers).get('content-type'), 'application/json');
  assert.ok(sent[0].init.signal instanceof AbortSignal);
  assert.deepEqual(sent[0].body, {
    username: 'Blog pipeline',
    content: formatNotification(PR_EVENT).content,
    allowed_mentions: { parse: [] },
  });
});

test('allowed_mentions is always empty, whatever the event says', async () => {
  const { fetchFn, sent } = fakeFetch([ok(), ok()]);
  const notify = createDiscordNotifier(HOOK, fetchFn, noSleep);
  await notify({ ...PR_EVENT, title: '@everyone <@123>' });
  await notify({ kind: 'skipped', reason: 'no-topic', detail: '@here' });
  for (const s of sent) assert.deepEqual(s.body.allowed_mentions, { parse: [] });
});

test('an invalid event is rejected before anything is sent', async () => {
  const { fetchFn, sent } = fakeFetch([ok()]);
  await assert.rejects(
    createDiscordNotifier(HOOK, fetchFn, noSleep)({ ...PR_EVENT, url: 'https://evil.com/x' }),
  );
  assert.equal(sent.length, 0);
});

test('a 200 with ?wait=true counts as success', async () => {
  const { fetchFn } = fakeFetch([new Response('{"id":"1"}', { status: 200 })]);
  await createDiscordNotifier(`${HOOK}?wait=true`, fetchFn, noSleep)(PR_EVENT);
});

test('a 5xx is retried once, then succeeds', async () => {
  const { fetchFn, sent } = fakeFetch([new Response('', { status: 502 }), ok()]);
  await createDiscordNotifier(HOOK, fetchFn, noSleep)(PR_EVENT);
  assert.equal(sent.length, 2);
});

test('two 5xx in a row: one retry only, then NotifyError with just the status', async () => {
  const { fetchFn, sent } = fakeFetch([
    new Response('', { status: 500 }),
    new Response(`upstream says ${HOOK}`, { status: 503 }),
    ok(),
  ]);
  const err = await createDiscordNotifier(
    HOOK,
    fetchFn,
    noSleep,
  )(PR_EVENT).then(
    () => null,
    (e: unknown) => e,
  );
  assert.equal(sent.length, 2);
  assert.ok(err instanceof NotifyError);
  assert.equal(err.status, 503);
  assert.equal(err.message, 'Discord notification failed: 503');
  assert.equal(String(err.stack).includes(TOKEN), false);
});

test('a 4xx other than 429 is not retried', async () => {
  for (const status of [400, 401, 403, 404]) {
    const { fetchFn, sent } = fakeFetch([new Response('', { status }), ok()]);
    await assert.rejects(createDiscordNotifier(HOOK, fetchFn, noSleep)(PR_EVENT), (e) => {
      assert.ok(e instanceof NotifyError);
      assert.equal(e.status, status);
      return true;
    });
    assert.equal(sent.length, 1);
  }
});

test('a 429 honours retry_after (up to 5 s) and retries once', async () => {
  const slept: number[] = [];
  const { fetchFn, sent } = fakeFetch([
    new Response('{"retry_after":1.5,"global":false}', {
      status: 429,
      headers: { 'content-type': 'application/json' },
    }),
    ok(),
  ]);
  await createDiscordNotifier(HOOK, fetchFn, {
    sleep: async (ms) => {
      slept.push(ms);
    },
  })(PR_EVENT);
  assert.equal(sent.length, 2);
  assert.deepEqual(slept, [1500]);
});

test('a 429 asking for more than 5 s is not retried', async () => {
  const slept: number[] = [];
  const { fetchFn, sent } = fakeFetch([new Response('{"retry_after":30}', { status: 429 }), ok()]);
  await assert.rejects(
    createDiscordNotifier(HOOK, fetchFn, {
      sleep: async (ms) => {
        slept.push(ms);
      },
    })(PR_EVENT),
    (e) => e instanceof NotifyError && e.status === 429,
  );
  assert.equal(sent.length, 1);
  assert.deepEqual(slept, []);
});

test('a network error is retried once; a second one throws NotifyError without the cause', async () => {
  const once = fakeFetch([new TypeError(`fetch failed for ${HOOK}`), ok()]);
  await createDiscordNotifier(HOOK, once.fetchFn, noSleep)(PR_EVENT);
  assert.equal(once.sent.length, 2);

  const twice = fakeFetch([
    new TypeError(`fetch failed for ${HOOK}`),
    new TypeError(`fetch failed for ${HOOK}`),
    ok(),
  ]);
  const err = await createDiscordNotifier(
    HOOK,
    twice.fetchFn,
    noSleep,
  )(PR_EVENT).then(
    () => null,
    (e: unknown) => e,
  );
  assert.equal(twice.sent.length, 2);
  assert.ok(err instanceof NotifyError);
  assert.equal(err.message, 'Discord notification failed: network error');
  assert.equal(err.cause, undefined);
  assert.equal(JSON.stringify(err).includes(TOKEN), false);
  assert.equal(String(err.stack).includes(TOKEN), false);
});

test('each attempt times out (10 s by default), and a timeout counts as a network error', async () => {
  const { fetchFn, sent } = fakeFetch(['hang', 'hang']);
  const started = Date.now();
  const err = await createDiscordNotifier(HOOK, fetchFn, { ...noSleep, timeoutMs: 20 })(
    PR_EVENT,
  ).then(
    () => null,
    (e: unknown) => e,
  );
  assert.ok(Date.now() - started < 5000);
  assert.equal(sent.length, 2);
  assert.ok(err instanceof NotifyError);
  assert.equal(err.status, 'timeout');
});

test('nothing is ever logged by the notifier', async () => {
  const lines: unknown[] = [];
  const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info };
  console.log = console.error = console.warn = console.info = (...a: unknown[]) => lines.push(a);
  try {
    const { fetchFn } = fakeFetch([
      new TypeError('boom'),
      new Response('', { status: 500 }),
      new Response('', { status: 500 }),
      new Response('', { status: 500 }),
    ]);
    const notify = createDiscordNotifier(HOOK, fetchFn, noSleep);
    await notify(PR_EVENT).catch(() => undefined);
    await notify(PR_EVENT).catch(() => undefined);
    try {
      createDiscordNotifier(`http://x/${TOKEN}`, fetchFn);
    } catch {
      // expected
    }
  } finally {
    Object.assign(console, orig);
  }
  assert.deepEqual(lines, []);
});
