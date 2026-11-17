import { test } from 'node:test';
import assert from 'node:assert/strict';
import { queryWords, seoReport, type SeoInput } from './seo';

const OPENING =
  'A website for a small lawn care business in Phenix City usually costs less than owners expect. ' +
  'The price depends on how many pages you need, who writes the words, and whether you want help after launch. ' +
  'Here is what drives the cost.';

const BODY = [
  OPENING,
  '## What drives the cost of a lawn care website?',
  'Most of the price is time. A [state guide](https://example.gov/guide) lists the basics every small business site should cover.',
  '- Pages you need',
  '- Words and photos',
  '- Help after launch',
  '## How long does a build take?',
  'A short build can be done in a few weeks. The [trade group](https://example.org/trades) explains why clear service pages help.',
  '## What should you do next?',
  'Write down your services and check [what each package includes](/pricing). If you are near Columbus, see [the Columbus page](/web-design/columbus-ga).',
].join('\n\n');

const GOOD: SeoInput = {
  title: 'Lawn Care Website Cost in Phenix City',
  description:
    'What a lawn care website costs in Phenix City, what drives the price, and the questions to ask before you pay anyone to build one.',
  body: BODY,
  targetQuery: 'how much does a lawn care website cost in phenix city',
  existingSlugs: ['website-cost-phenix-city'],
};

function item(input: Partial<SeoInput>, key: string) {
  const r = seoReport({ ...GOOD, ...input });
  const found = r.items.find((i) => i.key === key);
  assert.ok(found, `missing item ${key}`);
  return found;
}

test('a well-built draft passes every item', () => {
  const r = seoReport(GOOD);
  const failed = r.items.filter((i) => !i.ok);
  assert.deepEqual(failed, []);
  assert.deepEqual(
    r.items.map((i) => i.key),
    [
      'title-length',
      'description-length',
      'query-in-title-or-opening',
      'query-in-opening',
      'h2-count',
      'internal-links',
      'source-links',
      'list',
      'first-paragraph',
      'sentence-length',
      'unique-headings',
    ],
  );
  for (const i of r.items) assert.ok(i.note.length > 0, i.key);
});

test('queryWords drops stopwords and question words, and folds simple plurals', () => {
  assert.deepEqual(queryWords('How much does a lawn care website cost in Phenix City?'), [
    'lawn',
    'care',
    'website',
    'cost',
    'phenix',
    'city',
  ]);
  assert.deepEqual(queryWords('do I need websites for my salons'), ['need', 'website', 'salon']);
  assert.deepEqual(queryWords('the and of'), []);
});

test('title-length: 60 characters passes, 61 fails', () => {
  assert.equal(item({ title: 't'.repeat(60) }, 'title-length').ok, true);
  const f = item({ title: 't'.repeat(61) }, 'title-length');
  assert.equal(f.ok, false);
  assert.match(f.note, /61/);
});

test('description-length: 120 and 155 pass, 119 and 156 fail', () => {
  assert.equal(item({ description: 'd'.repeat(120) }, 'description-length').ok, true);
  assert.equal(item({ description: 'd'.repeat(155) }, 'description-length').ok, true);
  assert.equal(item({ description: 'd'.repeat(119) }, 'description-length').ok, false);
  assert.equal(item({ description: 'd'.repeat(156) }, 'description-length').ok, false);
});

test('query-in-title-or-opening: a word only in the title still counts; a missing one is named', () => {
  const titleOnly = item(
    { targetQuery: 'lawn care website cost phenix city 2027 grants' },
    'query-in-title-or-opening',
  );
  assert.equal(titleOnly.ok, false);
  assert.match(titleOnly.note, /grant/);
  // "Phenix" appears in the title even if the opening drops it.
  const opening = BODY.replace('in Phenix City ', '');
  assert.equal(item({ body: opening }, 'query-in-title-or-opening').ok, true);
});

test('query-in-opening: needs the phrase or all its words in the first 100 words', () => {
  assert.equal(item({}, 'query-in-opening').ok, true);
  const noCity = BODY.replace('in Phenix City ', '');
  const f = item({ body: noCity }, 'query-in-opening');
  assert.equal(f.ok, false);
  assert.match(f.note, /phenix/);
  // A word that appears only after the first 100 words does not count.
  const late = `${'filler '.repeat(100)}\n\n${BODY}`;
  assert.equal(item({ body: late }, 'query-in-opening').ok, false);
});

test('a query with no significant words fails both query items instead of passing vacuously', () => {
  assert.equal(item({ targetQuery: 'how to do it' }, 'query-in-title-or-opening').ok, false);
  assert.equal(item({ targetQuery: 'how to do it' }, 'query-in-opening').ok, false);
});

test('h2-count: three ## headings pass, two fail, ### does not count', () => {
  const two = BODY.replace('## What should you do next?', '### What should you do next?');
  const f = item({ body: two }, 'h2-count');
  assert.equal(f.ok, false);
  assert.match(f.note, /2/);
});

test('internal-links: counts distinct site links; /blog/<slug> only for existing posts', () => {
  const one = BODY.replace('[the Columbus page](/web-design/columbus-ga)', 'the Columbus page');
  assert.equal(item({ body: one }, 'internal-links').ok, false);
  const dupe = one.replace('Write down', 'See [prices](/pricing/) and write down');
  assert.equal(item({ body: dupe }, 'internal-links').ok, false);
  const post = one + '\n\nAlso read [the cost post](/blog/website-cost-phenix-city).';
  assert.equal(item({ body: post }, 'internal-links').ok, true);
  const missing = one + '\n\nAlso read [a missing post](/blog/not-a-post).';
  assert.equal(item({ body: missing }, 'internal-links').ok, false);
  const absolute =
    one + '\n\nSee [Opelika](https://softsystemsstudiollc.com/web-design/opelika-al).';
  assert.equal(item({ body: absolute }, 'internal-links').ok, true);
});

test('source-links: needs two distinct external links; site links do not count', () => {
  const one = BODY.replace('[trade group](https://example.org/trades)', 'trade group');
  const f = item({ body: one }, 'source-links');
  assert.equal(f.ok, false);
  assert.match(f.note, /1/);
  const same = BODY.replace('https://example.org/trades', 'https://example.gov/guide#part');
  assert.equal(item({ body: same }, 'source-links').ok, false);
  const auto = one + '\n\nMore at <https://example.net/more>.';
  assert.equal(item({ body: auto }, 'source-links').ok, true);
});

test('list: a bullet or numbered list or a table passes, prose alone fails', () => {
  const noList = BODY.replace(/^- /gm, '');
  assert.equal(item({ body: noList }, 'list').ok, false);
  assert.equal(item({ body: noList + '\n\n1. First step' }, 'list').ok, true);
  assert.equal(item({ body: noList + '\n\n| a | b |\n| - | - |\n| 1 | 2 |' }, 'list').ok, true);
});

test('first-paragraph: 30 to 70 words pass; shorter or longer fail', () => {
  assert.equal(item({}, 'first-paragraph').ok, true);
  const short = BODY.replace(OPENING, 'Lawn care website cost in Phenix City, answered.');
  const s = item({ body: short }, 'first-paragraph');
  assert.equal(s.ok, false);
  assert.match(s.note, /\d+ words/);
  const long = BODY.replace(OPENING, `${OPENING} ${'more words here. '.repeat(15)}`);
  assert.equal(item({ body: long }, 'first-paragraph').ok, false);
  // A heading before the first paragraph is skipped.
  assert.equal(item({ body: `## Intro\n\n${BODY}` }, 'first-paragraph').ok, true);
});

test('sentence-length: average over 22 words fails, link URLs and headings do not count', () => {
  assert.equal(item({}, 'sentence-length').ok, true);
  const rambling = `${'word '.repeat(40)}and more.\n\n${'word '.repeat(40)}again.`;
  const f = item({ body: rambling }, 'sentence-length');
  assert.equal(f.ok, false);
  assert.match(f.note, /average/i);
});

test('unique-headings: a repeated heading (any case or punctuation) fails and is named', () => {
  const dupe = BODY.replace(
    '## How long does a build take?',
    '## What drives the cost of a Lawn Care website',
  );
  const f = item({ body: dupe }, 'unique-headings');
  assert.equal(f.ok, false);
  assert.match(f.note, /what drives the cost/i);
  assert.equal(
    item({ body: `${BODY}\n\n### Pages you need\n\nText.` }, 'unique-headings').ok,
    true,
  );
});

test('seoReport never throws on empty input', () => {
  const r = seoReport({ title: '', description: '', body: '', targetQuery: '', existingSlugs: [] });
  assert.ok(r.items.every((i) => typeof i.ok === 'boolean'));
  assert.ok(r.items.some((i) => !i.ok));
});
