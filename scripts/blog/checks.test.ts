import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUILD_FROM } from '../../packages/frontend/src/lib/business';
import {
  BANNED_PHRASES,
  checkSourceUrls,
  fetchSourceTexts,
  isSafeSourceUrl,
  runChecks,
  shingleOverlap,
} from './checks';
import { briefSchema } from './types';

/** n distinct, non-repeating words so shingles never collide by accident. */
function words(n: number, start = 0): string {
  return Array.from({ length: n }, (_, i) => `word${start + i}`).join(' ');
}

const FRONT = `---
title: How local businesses can plan a simple website
description: A plain-English look at what a small local business actually needs from its first website, and what can wait.
slug: plan-a-simple-website
date: 2026-11-16
tags:
  - websites
sources:
  - url: https://example.com/a
    title: Source A
  - url: https://example.com/b
    title: Source B
  - url: https://example.com/c
    title: Source C
---
`;

function doc(body: string, front = FRONT): string {
  return `${front}\n${body}\n`;
}

const GOOD_BODY = `${words(790)}\n\nSee the [guide](https://example.com/a) for $40 figures.`;
const codes = (r: { code: string }[]) => r.map((f) => f.code);
const base = { existingPosts: [], sourceTexts: {} };

test('valid draft passes with no failures', () => {
  assert.deepEqual(runChecks({ markdown: doc(GOOD_BODY), ...base }), []);
});

test('valid draft with a known token passes', () => {
  const body = `${words(790)}\n\nBuilds start at {{BUILD_FROM}}.`;
  assert.deepEqual(runChecks({ markdown: doc(body), ...base }), []);
});

test('invalid frontmatter fails frontmatter', () => {
  const md = doc(GOOD_BODY, FRONT.replace('slug: plan-a-simple-website', 'slug: Not Kebab'));
  assert.ok(codes(runChecks({ markdown: md, ...base })).includes('frontmatter'));
});

test('699 words fails word-count', () => {
  assert.ok(codes(runChecks({ markdown: doc(words(699)), ...base })).includes('word-count'));
});

test('700 and 1200 words pass word-count', () => {
  assert.ok(!codes(runChecks({ markdown: doc(words(700)), ...base })).includes('word-count'));
  assert.ok(!codes(runChecks({ markdown: doc(words(1200)), ...base })).includes('word-count'));
});

test('1,201 words fails word-count', () => {
  assert.ok(codes(runChecks({ markdown: doc(words(1201)), ...base })).includes('word-count'));
});

test('banned phrase fails banned-phrase', () => {
  const body = `${words(790)}\n\nOur #1 pick.`;
  assert.ok(codes(runChecks({ markdown: doc(body), ...base })).includes('banned-phrase'));
});

test('each banned phrase pattern matches its example', () => {
  const examples = [
    '#1',
    'number one',
    'guaranteed',
    'guarantee',
    'ranks first',
    'ranked on page one',
    'top spot',
  ];
  for (const s of examples) {
    assert.ok(
      BANNED_PHRASES.some((re) => re.test(s)),
      s,
    );
  }
});

test('raw html fails raw-html', () => {
  for (const tag of ['<script>x</script>', '<div>x</div>']) {
    const body = `${words(790)}\n\n${tag}`;
    assert.ok(codes(runChecks({ markdown: doc(body), ...base })).includes('raw-html'), tag);
  }
});

test('markdown autolinks are not raw html', () => {
  const body = `${words(790)}\n\nSee <https://example.com/a> now.`;
  assert.ok(!codes(runChecks({ markdown: doc(body), ...base })).includes('raw-html'));
});

test('unknown token in body fails unknown-token', () => {
  const body = `${words(790)}\n\n{{nope}}`;
  assert.ok(codes(runChecks({ markdown: doc(body), ...base })).includes('unknown-token'));
});

test('token in frontmatter fails unknown-token', () => {
  const md = doc(
    GOOD_BODY,
    FRONT.replace('A plain-English look', 'Starting at {{BUILD_FROM}}, a plain-English look'),
  );
  assert.ok(codes(runChecks({ markdown: md, ...base })).includes('unknown-token'));
});

test('typing the BUILD_FROM literal fails studio-literal', () => {
  const body = `${words(790)}\n\nBuilds start at ${BUILD_FROM} flat.`;
  assert.ok(codes(runChecks({ markdown: doc(body), ...base })).includes('studio-literal'));
});

test('dollar amount without a link in the paragraph fails unsourced-dollar', () => {
  const body = `${words(790)}\n\nA domain can cost $20 a year.`;
  assert.ok(codes(runChecks({ markdown: doc(body), ...base })).includes('unsourced-dollar'));
});

test('dollar amount in a paragraph with a link passes', () => {
  const body = `${words(790)}\n\nA domain can cost $20 a year, per [the registrar](https://example.com/a).`;
  assert.ok(!codes(runChecks({ markdown: doc(body), ...base })).includes('unsourced-dollar'));
});

test('40% copied from an existing post fails duplicate', () => {
  const existing = { slug: 'old', body: words(790).split(' ').slice(0, 330).join(' ') };
  const r = runChecks({ markdown: doc(words(790)), existingPosts: [existing], sourceTexts: {} });
  assert.ok(codes(r).includes('duplicate'));
});

test('30% of shingles in a source text fails copied', () => {
  const src = words(790).split(' ').slice(0, 240).join(' ');
  const r = runChecks({
    markdown: doc(words(790)),
    existingPosts: [],
    sourceTexts: { 'https://example.com/a': src },
  });
  assert.ok(codes(r).includes('copied'));
});

test('unrelated existing post and source pass', () => {
  const r = runChecks({
    markdown: doc(words(790)),
    existingPosts: [{ slug: 'old', body: words(790, 5000) }],
    sourceTexts: { 'https://example.com/a': words(300, 9000) },
  });
  assert.deepEqual(r, []);
});

test('shingleOverlap basics', () => {
  assert.equal(shingleOverlap('a b c', 'a b c d e f', 5), 0);
  assert.equal(shingleOverlap('One, two! three four FIVE six', 'one two three four five', 5), 0.5);
  assert.equal(shingleOverlap('a b c d e', 'a b c d e', 5), 1);
});

function fakeFetch(outcome: number | Error): typeof fetch {
  return (async () => {
    if (outcome instanceof Error) throw outcome;
    return {
      status: outcome,
      ok: outcome < 400,
      text: async () => '<p>hi <b>there</b></p>',
    } as Response;
  }) as typeof fetch;
}

test('checkSourceUrls passes 200, 301, 403 and 429', async () => {
  for (const s of [200, 301, 403, 429]) {
    assert.deepEqual(await checkSourceUrls(['https://example.com/a'], fakeFetch(s)), [], String(s));
  }
});

test('checkSourceUrls fails 404, 410, 500 and thrown errors with source-url', async () => {
  for (const o of [404, 410, 500, new Error('network down')]) {
    const r = await checkSourceUrls(['https://example.com/a'], fakeFetch(o));
    assert.deepEqual(codes(r), ['source-url'], String(o));
  }
});

test('checkSourceUrls sends the studio User-Agent and a timeout signal', async () => {
  let init: RequestInit | undefined;
  const f = (async (_u: string, i?: RequestInit) => {
    init = i;
    return new Response(null, { status: 200 });
  }) as unknown as typeof fetch;
  await checkSourceUrls(['https://example.com/a'], f);
  assert.match(
    String((init?.headers as Record<string, string>)['User-Agent']),
    /softsystemsstudiollc\.com/,
  );
  assert.ok(init?.signal instanceof AbortSignal);
  assert.equal(init?.redirect, 'manual');
});

// ---- fix round 1: bypasses ----

const withPara = (p: string) => doc(`${words(790)}\n\n${p}`);
const has = (md: string, code: string) =>
  codes(runChecks({ markdown: md, ...base })).includes(code);

test('---js frontmatter runs no code and reports a frontmatter failure', () => {
  const g = globalThis as Record<string, unknown>;
  delete g.PWNED_BY_DRAFT;
  const md = `---js\n({title:(globalThis.PWNED_BY_DRAFT=1,"x")})\n---\n${words(790)}\n`;
  const r = runChecks({ markdown: md, ...base });
  assert.equal(g.PWNED_BY_DRAFT, undefined);
  assert.deepEqual(codes(r), ['frontmatter']);
});

test('raw html bypasses: slash separator, unterminated tag, upper case, comment, code span', () => {
  for (const p of [
    '<img/onerror=alert(1)>',
    '<iframe src=//x.com',
    '<SCRIPT>alert(1)</SCRIPT>',
    '<!-- hidden -->',
    '`<div>`',
    '<?php echo 1 ?>',
  ]) {
    assert.ok(has(withPara(p), 'raw-html'), p);
  }
});

test('entity-encoded html is plain text and passes', () => {
  assert.ok(!has(withPara('Write &lt;script&gt; as text.'), 'raw-html'));
});

test('http(s) autolinks are still allowed', () => {
  assert.ok(!has(withPara('See <https://example.com/a> now.'), 'raw-html'));
});

test('unsafe link schemes fail raw-html', () => {
  for (const p of [
    '[a](javascript:alert(1))',
    '[a](  JaVaScRiPt:alert(1))',
    '[a](data:text/html;base64,AAAA)',
    '[a]: vbscript:x',
    '<javascript:alert(1)>',
  ]) {
    const r = runChecks({ markdown: withPara(p), ...base });
    assert.ok(
      r.some((f) => f.code === 'raw-html' && /scheme/i.test(f.message)),
      p,
    );
  }
  assert.ok(!has(withPara('[a](https://example.com/a) and [m](mailto:a@example.com)'), 'raw-html'));
});

test('studio price typed in other forms fails studio-literal', () => {
  for (const p of [
    'It costs 997 dollars.',
    'It costs 997 USD.',
    'It costs USD 997.',
    'It costs $ 997 flat.',
    'It costs $1,997.',
    'See [x](https://e.com) it is $ 997 here',
    'See [x](https://e.com) it is 997 dollars here',
  ]) {
    assert.ok(has(withPara(p), 'studio-literal'), p);
  }
});

test('a link never excuses a studio price but excuses other amounts', () => {
  const linked = 'See [x](https://e.com) it is $997 here';
  assert.ok(has(withPara(linked), 'studio-literal'));
  assert.ok(!has(withPara('See [x](https://e.com) it is $41 here'), 'unsourced-dollar'));
  assert.ok(!has(withPara('A year of 997 visitors.'), 'studio-literal'));
});

test('only an http(s) link excuses a dollar amount', () => {
  assert.ok(has(withPara('Costs $41, per [x](javascript:alert(1))'), 'unsourced-dollar'));
  assert.ok(has(withPara('Costs 41 dollars.'), 'unsourced-dollar'));
});

test('isSafeSourceUrl rejects each unsafe class', () => {
  const bad = [
    'file:///etc/passwd',
    'javascript:alert(1)',
    'ftp://example.com/x',
    'https://user:pw@example.com/',
    'http://localhost/x',
    'http://app.localhost/x',
    'http://printer.local/x',
    'http://db.internal/x',
    'http://intranet/x',
    'http://127.0.0.1/',
    'http://0.0.0.0/',
    'http://10.1.2.3/',
    'http://172.16.0.1/',
    'http://192.168.1.1/',
    'http://169.254.169.254/latest/meta-data',
    'http://100.64.0.1/',
    'http://2130706433/',
    'http://0x7f.1/',
    'http://[::1]/',
    'http://[fd00::1]/',
    'http://[fe80::1]/',
    'http://[::ffff:127.0.0.1]/',
    'not a url',
  ];
  for (const u of bad) assert.equal(isSafeSourceUrl(u), false, u);
  for (const u of ['https://example.com/a', 'http://www.example.co.uk/x?y=1', 'https://8.8.8.8/'])
    assert.equal(isSafeSourceUrl(u), true, u);
});

test('briefSchema rejects unsafe source urls at parse time', () => {
  const mk = (url: string) => ({
    title: 't',
    targetQuery: 'q',
    intent: 'i',
    localAngle: 'l',
    notDuplicateBecause: 'n',
    pillar: 'cost',
    competition: 'low',
    serpNotes: 's',
    sources: [{ url, title: 's', supports: 'x' }],
  });
  assert.ok(briefSchema.safeParse(mk('https://example.com/a')).success);
  for (const u of ['http://169.254.169.254/x', 'file:///etc/passwd', 'http://localhost:3000'])
    assert.equal(briefSchema.safeParse(mk(u)).success, false, u);
});

test('checkSourceUrls does not fetch an unsafe url', async () => {
  let called = 0;
  const f = (async () => {
    called++;
    return new Response(null, { status: 200 });
  }) as unknown as typeof fetch;
  const r = await checkSourceUrls(['http://169.254.169.254/x'], f);
  assert.deepEqual(codes(r), ['source-url']);
  assert.equal(called, 0);
});

test('a redirect to a metadata address fails source-url', async () => {
  const f = (async (u: string) =>
    u.startsWith('https://example.com')
      ? new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/x' } })
      : new Response('secret', { status: 200 })) as unknown as typeof fetch;
  assert.deepEqual(codes(await checkSourceUrls(['https://example.com/a'], f)), ['source-url']);
  assert.deepEqual(await fetchSourceTexts(['https://example.com/a'], f), {});
});

test('a safe redirect is followed, but more than 3 hops fails', async () => {
  const ok = (async (u: string) =>
    u.endsWith('/a')
      ? new Response(null, { status: 301, headers: { location: '/b' } })
      : new Response('x', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        })) as unknown as typeof fetch;
  assert.deepEqual(await checkSourceUrls(['https://example.com/a'], ok), []);
  const loop = (async () =>
    new Response(null, {
      status: 302,
      headers: { location: '/again' },
    })) as unknown as typeof fetch;
  assert.deepEqual(codes(await checkSourceUrls(['https://example.com/a'], loop)), ['source-url']);
});

test('fetchSourceTexts strips tags and omits failures', async () => {
  const f = (async (url: string) => {
    if (url.endsWith('bad')) throw new Error('x');
    return new Response('<p>hi <b>there</b></p>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }) as unknown as typeof fetch;
  const r = await fetchSourceTexts(['https://example.com/good', 'https://example.com/bad'], f);
  assert.deepEqual(r, { 'https://example.com/good': 'hi there' });
});

test('fetchSourceTexts omits binary content types', async () => {
  const f = (async () =>
    new Response('%PDF-1.4', {
      status: 200,
      headers: { 'content-type': 'application/pdf' },
    })) as unknown as typeof fetch;
  assert.deepEqual(await fetchSourceTexts(['https://example.com/a.pdf'], f), {});
  const none = (async () => new Response('hello', { status: 200 })) as unknown as typeof fetch;
  // Response with a string body gets text/plain by default: accepted.
  assert.deepEqual(await fetchSourceTexts(['https://example.com/a'], none), {
    'https://example.com/a': 'hello',
  });
});

test('fetchSourceTexts caps an oversized body', async () => {
  const big = 'a '.repeat(2_000_000); // 4 MB
  const f = (async () =>
    new Response(big, {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    })) as unknown as typeof fetch;
  const r = await fetchSourceTexts(['https://example.com/a'], f);
  const len = r['https://example.com/a'].length;
  assert.ok(len > 0 && len <= 1_500_000, String(len));
});

// ---- final review: body links point only at the brief's sources ----

const offSource = (p: string) => has(withPara(p), 'off-source-link');

test('an off-source inline link fails off-source-link', () => {
  assert.ok(offSource('Buy at [this shop](https://spam.example.net/deal).'));
});

test('an off-source reference-style link fails off-source-link', () => {
  assert.ok(offSource('See [the deal][d].\n\n[d]: https://spam.example.net/deal "Deal"'));
});

test('an off-source autolink fails off-source-link', () => {
  assert.ok(offSource('See <https://spam.example.net/deal> now.'));
});

test('a bare URL (GFM turns it into a link) off the sources fails off-source-link', () => {
  assert.ok(offSource('See https://spam.example.net/deal for more.'));
  assert.ok(offSource('See www.spam.example.net for more.'));
});

test('a source link with different host casing, trailing slash or fragment passes', () => {
  for (const p of [
    'See [A](HTTPS://Example.COM/a/).',
    'See [A](https://example.com/a#part).',
    'See <https://EXAMPLE.com/b/>.',
    'See https://example.com/c.',
    '[ref]: https://example.com/a/',
  ]) {
    assert.ok(!offSource(p), p);
  }
});

test('relative and absolute links to allowed site paths pass', () => {
  for (const p of [
    'See [prices](/pricing).',
    'See [prices](/pricing/).',
    'See [notes](/blog).',
    'See [Columbus](/web-design/columbus-ga).',
    'See [a quote](/intake).',
    'See [prices](https://softsystemsstudiollc.com/pricing).',
    'See [Opelika](https://SoftSystemsStudioLLC.com/web-design/opelika-al/).',
  ]) {
    assert.ok(!offSource(p), p);
  }
});

test('other site paths, unknown towns, mailto and other hosts fail off-source-link', () => {
  for (const p of [
    'See [x](/random).',
    'See [x](/web-design/atlanta-ga).',
    'See [x](https://softsystemsstudiollc.com/random).',
    'See [x](//spam.example.net/a).',
    'Email [me](mailto:a@example.com).',
    'See [x](https://example.com/a?ref=spam).',
    'See [x](https://example.com.spam.net/a).',
  ]) {
    assert.ok(offSource(p), p);
  }
});

test('a /blog/<slug> link passes only for an existing post', () => {
  const posts = [{ slug: 'website-cost-phenix-city', body: 'unrelated older post body text' }];
  const offWith = (p: string) =>
    codes(runChecks({ markdown: withPara(p), existingPosts: posts, sourceTexts: {} })).includes(
      'off-source-link',
    );
  for (const p of [
    'See [costs](/blog/website-cost-phenix-city).',
    'See [costs](/blog/website-cost-phenix-city/).',
    'See [costs](/blog/website-cost-phenix-city#what-drives-the-price).',
    'See [costs](https://softsystemsstudiollc.com/blog/website-cost-phenix-city).',
  ]) {
    assert.ok(!offWith(p), p);
  }
  for (const p of [
    'See [x](/blog/not-a-post).',
    'See [x](/blog/website-cost-phenix-city/extra).',
    'See [x](/blog/website-cost-phenix-city?ref=x).',
    'See [x](/blog/feed.xml).',
    'See [x](https://softsystemsstudiollc.com/blog/not-a-post).',
  ]) {
    assert.ok(offWith(p), p);
  }
  // Without existing posts no /blog/<slug> is allowed at all.
  assert.ok(offSource('See [costs](/blog/website-cost-phenix-city).'));
});

test('the off-source failure names the URL', () => {
  const r = runChecks({ markdown: withPara('[x](https://spam.example.net/deal)'), ...base });
  const f = r.find((x) => x.code === 'off-source-link');
  assert.ok(f && f.message.includes('https://spam.example.net/deal'));
});

// ---- final review: title and description get the same phrase and price checks ----

const withFront = (from: string, to: string) => doc(GOOD_BODY, FRONT.replace(from, to));

test('a banned phrase in the title only fails banned-phrase', () => {
  const md = withFront(
    'title: How local businesses can plan a simple website',
    'title: Guaranteed ways to plan a simple website',
  );
  assert.ok(codes(runChecks({ markdown: md, ...base })).includes('banned-phrase'));
});

test('a banned phrase in the description only fails banned-phrase', () => {
  const md = withFront('A plain-English look', 'Top spot hunting aside, a plain-English look');
  assert.ok(codes(runChecks({ markdown: md, ...base })).includes('banned-phrase'));
});

test('a studio price literal in the description only fails studio-literal', () => {
  const md = withFront('A plain-English look', `From ${BUILD_FROM}, a plain-English look`);
  assert.ok(codes(runChecks({ markdown: md, ...base })).includes('studio-literal'));
});

test('a token in a tag fails unknown-token', () => {
  const md = withFront('  - websites', '  - "{{BUILD_FROM}}"');
  assert.ok(codes(runChecks({ markdown: md, ...base })).includes('unknown-token'));
});

// ---- studio-literal: distinct package prices vs ambiguous amounts (dry run 44030434491) ----

const COST_SOURCE = '[Source](https://example.com/a)';
const ok = (p: string) => runChecks({ markdown: withPara(p), ...base });

test('a market range that contains a studio amount passes when sourced and not about the studio', () => {
  const p = `Many agencies quote $500 to $2,000 for a small business site, according to ${COST_SOURCE}.`;
  assert.deepEqual(ok(p), []);
});

test('an ambiguous studio amount without studio context is a generic sourced number', () => {
  assert.deepEqual(ok(`Online ordering from $500 ${COST_SOURCE}`), []);
  assert.deepEqual(ok(`Typical care fees run $150-$200/month, per ${COST_SOURCE}.`), []);
});

test('a distinct package price fails studio-literal in any context, link or not', () => {
  for (const p of [
    'Our Starter package is $997.',
    `The starter site costs $997 according to ${COST_SOURCE}.`,
    `Agencies charge $1,997 to $3,497, per ${COST_SOURCE}.`,
    `It costs US$997, per ${COST_SOURCE}.`,
  ]) {
    assert.ok(has(withPara(p), 'studio-literal'), p);
  }
});

test('an ambiguous amount with studio-context wording fails studio-literal, link or not', () => {
  for (const p of [
    'We charge $500 for a store setup.',
    `We charge $500 for a store setup, per ${COST_SOURCE}.`,
    'A care plan runs $200 a month.',
    `Our care plan is $200 ${COST_SOURCE}.`,
    `The Soft Systems team adds a blog for $300 ${COST_SOURCE}.`,
    `The studio adds a blog for $300 ${COST_SOURCE}.`,
    `Booking is a $250 add-on ${COST_SOURCE}.`,
    `Booking is a $250 add on ${COST_SOURCE}.`,
    `A retainer of $150 ${COST_SOURCE}.`,
    `The hosting plan is $150 ${COST_SOURCE}.`,
    `The Custom package starts at $5,000 ${COST_SOURCE}.`,
    `The Business plan includes a $150 extra page ${COST_SOURCE}.`,
    `I charge $350 for payments ${COST_SOURCE}.`,
    `My price is $350 ${COST_SOURCE}.`,
    `Call us: $500 setup ${COST_SOURCE}.`,
  ]) {
    assert.ok(has(withPara(p), 'studio-literal'), p);
  }
});

test('an ambiguous amount with no link and no context fails unsourced-dollar, not studio-literal', () => {
  const r = codes(ok('Expect about $500 for that.'));
  assert.ok(r.includes('unsourced-dollar'));
  assert.ok(!r.includes('studio-literal'));
});

test('studio context in a different paragraph does not taint a market-price paragraph', () => {
  const body = `${words(790)}\n\nOur notes cover this below.\n\nMany agencies quote $500 to $2,000, according to ${COST_SOURCE}.`;
  assert.deepEqual(runChecks({ markdown: doc(body), ...base }), []);
  const same = `${words(790)}\n\nOur notes cover this. Many agencies quote $500 to $2,000, according to ${COST_SOURCE}.`;
  assert.ok(has(doc(same), 'studio-literal'));
});

test('"US" (country) and "i.e." are not studio context', () => {
  assert.deepEqual(
    ok(`In the US, agencies quote $500 to $2,000, i.e. a wide range ${COST_SOURCE}.`),
    [],
  );
});

test('title and description: studio context decides, and no link means unsourced-dollar', () => {
  const desc = (to: string) => withFront('A plain-English look', to);
  const ambiguousNoContext = codes(
    runChecks({ markdown: desc('From $500, a plain-English look'), ...base }),
  );
  assert.ok(ambiguousNoContext.includes('unsourced-dollar'));
  assert.ok(!ambiguousNoContext.includes('studio-literal'));
  assert.ok(has(desc('Our $500 setup, a plain-English look'), 'studio-literal'));
  assert.ok(has(desc('From $997, a plain-English look'), 'studio-literal'));
  const title = withFront(
    'title: How local businesses can plan a simple website',
    'title: Our care plan at $200 explained',
  );
  assert.ok(has(title, 'studio-literal'));
});
