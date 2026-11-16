/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postFrontmatterSchema, WORD_RANGE } from './blog-schema';

const valid = {
  title: 'How much does a small business website cost',
  description:
    'A plain look at what a small business website costs, what drives the price, and what you should expect to get for it.',
  slug: 'website-cost',
  date: '2026-11-16',
  tags: ['pricing'],
  sources: [
    { url: 'https://example.com/a', title: 'A' },
    { url: 'https://example.com/b', title: 'B' },
    { url: 'http://example.com/c', title: 'C' },
  ],
};

const src = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ url: `https://example.com/${i}`, title: `S${i}` }));

test('valid frontmatter parses', () => {
  assert.equal(postFrontmatterSchema.safeParse(valid).success, true);
});

test('word range', () => {
  assert.deepEqual(WORD_RANGE, { min: 700, max: 1200 });
});

const bad: [string, Record<string, unknown>][] = [
  ['bad slug', { slug: 'Bad Slug' }],
  ['bad date', { date: '11/16/2026' }],
  ['2 sources', { sources: src(2) }],
  ['7 sources', { sources: src(7) }],
  ['ftp source', { sources: [...src(2), { url: 'ftp://example.com/x', title: 'F' }] }],
  ['empty tags', { tags: [] }],
];

for (const [name, patch] of bad) {
  test(`rejects ${name}`, () => {
    assert.equal(postFrontmatterSchema.safeParse({ ...valid, ...patch }).success, false);
  });
}
