/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeXml,
  formatPostDate,
  postOgImage,
  postTitle,
  SITE_TITLE_SUFFIX,
} from './blog-format';

test('formatPostDate', () => {
  assert.equal(formatPostDate('2026-11-16'), 'November 16, 2026');
});

test('escapeXml escapes markup and strips XML-1.0-invalid characters', () => {
  const nul = String.fromCharCode(0);
  const vt = String.fromCharCode(0x0b);
  const fffe = String.fromCharCode(0xfffe);
  const lone = String.fromCharCode(0xd800);
  assert.equal(escapeXml(`a<b>&"'`), 'a&lt;b&gt;&amp;&quot;&apos;');
  assert.equal(escapeXml(`x${nul}y${vt}z${fffe}w${lone}v`), 'xyzwv');
  // Tab, newline, CR and astral characters are valid XML and kept.
  assert.equal(escapeXml('a\tb\nc\rd \u{1F600}'), 'a\tb\nc\rd \u{1F600}');
});

test('postTitle keeps the site suffix only when the full title stays within 60 characters', () => {
  assert.equal(SITE_TITLE_SUFFIX, ' | Soft Systems Studio');
  const short = 'x'.repeat(60 - SITE_TITLE_SUFFIX.length);
  assert.equal(postTitle(short), short);
  assert.equal(`${short}${SITE_TITLE_SUFFIX}`.length, 60);
  const long = `${short}y`;
  assert.deepEqual(postTitle(long), { absolute: long });
  assert.deepEqual(postTitle('t'.repeat(60)), { absolute: 't'.repeat(60) });
});

test('postOgImage is the site-relative OG image path for a title', () => {
  assert.equal(postOgImage('A & B?'), '/api/og?title=A%20%26%20B%3F');
});
