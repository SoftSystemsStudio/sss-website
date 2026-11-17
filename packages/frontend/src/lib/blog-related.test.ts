/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relatedPosts } from './blog-related';

const p = (slug: string, date: string, tags: string[]) => ({ slug, date, tags });

// Newest first, the order getAllPosts returns.
const ALL = [
  p('newest', '2026-11-20', ['seo']),
  p('pricing-b', '2026-11-18', ['pricing', 'websites']),
  p('other', '2026-11-17', ['hosting']),
  p('current', '2026-11-16', ['pricing', 'websites']),
  p('pricing-a', '2026-11-10', ['pricing']),
  p('oldest', '2026-01-01', ['misc']),
];
const slugs = (xs: { slug: string }[]) => xs.map((x) => x.slug);

test('shared tags first (more shared first), then newest, never the current post', () => {
  assert.deepEqual(slugs(relatedPosts(ALL, ALL[3], 3)), ['pricing-b', 'pricing-a', 'newest']);
});

test('n caps the result and defaults to 3', () => {
  assert.equal(relatedPosts(ALL, ALL[3]).length, 3);
  assert.deepEqual(slugs(relatedPosts(ALL, ALL[3], 1)), ['pricing-b']);
  assert.deepEqual(relatedPosts(ALL, ALL[3], 0), []);
});

test('falls back to newest when nothing shares a tag, sorting by date not input order', () => {
  const shuffled = [ALL[5], ALL[2], ALL[0], ALL[4]];
  const lonely = p('lonely', '2026-11-19', ['nothing-shared']);
  assert.deepEqual(slugs(relatedPosts([...shuffled, lonely], lonely, 3)), [
    'newest',
    'other',
    'pricing-a',
  ]);
});

test('tags match case-insensitively', () => {
  const a = p('a', '2026-01-02', ['Pricing']);
  const b = p('b', '2026-01-03', ['misc']);
  const cur = p('cur', '2026-01-01', ['pricing']);
  assert.deepEqual(slugs(relatedPosts([a, b, cur], cur, 2)), ['a', 'b']);
});

test('a lone post has no related posts', () => {
  assert.deepEqual(relatedPosts([ALL[3]], ALL[3]), []);
  assert.deepEqual(relatedPosts([], ALL[3]), []);
});
