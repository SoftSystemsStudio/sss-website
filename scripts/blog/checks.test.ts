import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUILD_FROM } from '../../packages/frontend/src/lib/business';
import {
  BANNED_PHRASES,
  checkSourceUrls,
  fetchSourceTexts,
  runChecks,
  shingleOverlap,
} from './checks';

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

test('fetchSourceTexts strips tags and omits failures', async () => {
  const f = (async (url: string) => {
    if (url.endsWith('bad')) throw new Error('x');
    return { status: 200, ok: true, text: async () => '<p>hi <b>there</b></p>' } as Response;
  }) as unknown as typeof fetch;
  const r = await fetchSourceTexts(['https://example.com/good', 'https://example.com/bad'], f);
  assert.deepEqual(r, { 'https://example.com/good': 'hi there' });
});
