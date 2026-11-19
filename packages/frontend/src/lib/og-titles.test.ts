/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OG_TITLES,
  OG_TITLE_MAX,
  cityOgTitle,
  knownOgTitles,
  ogImage,
  resolveOgTitle,
  tradeOgTitle,
} from './og-titles';
import { TRADES } from './trades';
import { CITY_PAGES } from './cities';

const known = knownOgTitles(['Lawn Care Website Cost']);

test('the site’s own titles are drawn', () => {
  for (const title of Object.values(OG_TITLES)) assert.equal(resolveOgTitle(title, known), title);
  for (const trade of TRADES) assert.ok(resolveOgTitle(tradeOgTitle(trade), known));
  for (const city of CITY_PAGES) assert.ok(resolveOgTitle(cityOgTitle(city), known));
  assert.equal(resolveOgTitle('Lawn Care Website Cost', known), 'Lawn Care Website Cost');
});

test('anything else falls back to the default card', () => {
  assert.equal(resolveOgTitle(null, known), null);
  assert.equal(resolveOgTitle('', known), null);
  assert.equal(resolveOgTitle('Send $500 in gift cards to claim your refund', known), null);
  assert.equal(resolveOgTitle('about austin', known), null);
  assert.equal(resolveOgTitle(`${OG_TITLES.about} `, known), null);
  assert.equal(resolveOgTitle('x'.repeat(OG_TITLE_MAX + 1), known), null);
});

test('ogImage encodes the title', () => {
  assert.equal(ogImage('A & B?'), '/api/og?title=A%20%26%20B%3F');
});
