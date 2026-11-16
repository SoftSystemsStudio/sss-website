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

// Characters that could break out of JSON-LD/HTML or make the RSS feed invalid XML.
const BAD_CHARS: [string, string][] = [
  ['<', '<'],
  ['>', '>'],
  ['NUL', '\u0000'],
  ['tab', '\t'],
  ['newline', '\n'],
  ['US (0x1F)', '\u001F'],
  ['DEL', '\u007F'],
  ['U+2028', '\u2028'],
  ['U+2029', '\u2029'],
];

for (const [label, ch] of BAD_CHARS) {
  test(`rejects ${label} in title, description and tags`, () => {
    const cases: Record<string, unknown>[] = [
      { title: `${valid.title}${ch}x` },
      { description: `${valid.description}${ch}x` },
      { tags: ['pricing', `bad${ch}tag`] },
    ];
    for (const patch of cases) {
      assert.equal(
        postFrontmatterSchema.safeParse({ ...valid, ...patch }).success,
        false,
        JSON.stringify(patch),
      );
    }
  });
}

test('a </script> title is rejected', () => {
  const r = postFrontmatterSchema.safeParse({ ...valid, title: 'Hi </script><script>alert(1)' });
  assert.equal(r.success, false);
});

for (const [name, patch] of bad) {
  test(`rejects ${name}`, () => {
    assert.equal(postFrontmatterSchema.safeParse({ ...valid, ...patch }).success, false);
  });
}
