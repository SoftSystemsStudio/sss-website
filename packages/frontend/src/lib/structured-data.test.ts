/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArticleSchema, BreadcrumbSchema } from '../components/StructuredData';
import { jsonLd } from './json-ld';

// The components are compiled with the classic JSX runtime under tsx (tsconfig has jsx: preserve).
(globalThis as Record<string, unknown>).React = React;

const HOSTILE = 'Hi </script><script>alert(1)</script> \u2028 \u2029 <!-- x';

const closings = (html: string) => html.match(/<\/script/gi)?.length ?? 0;

test('jsonLd escapes <, U+2028 and U+2029 and still parses back to the same value', () => {
  const out = jsonLd({ t: HOSTILE });
  assert.equal(out.includes('<'), false);
  assert.equal(out.includes('\u2028'), false);
  assert.equal(out.includes('\u2029'), false);
  assert.deepEqual(JSON.parse(out), { t: HOSTILE });
});

test('a hostile title cannot close the Article JSON-LD block early', () => {
  const html = renderToStaticMarkup(
    createElement(ArticleSchema, {
      title: HOSTILE,
      description: HOSTILE,
      path: '/blog/x',
      datePublished: '2026-11-16',
      wordCount: 800,
    }),
  );
  assert.equal(closings(html), 1);
  assert.ok(html.endsWith('</script>'));
  const json = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  assert.equal((JSON.parse(json) as { headline: string }).headline, HOSTILE);
});

test('Article JSON-LD carries image, mainEntityOfPage, wordCount, language and the studio', () => {
  const html = renderToStaticMarkup(
    createElement(ArticleSchema, {
      title: 'Lawn Care Website Cost',
      description: 'd',
      path: '/blog/lawn-care-website-cost',
      datePublished: '2026-11-16',
      wordCount: 912,
    }),
  );
  const ld = JSON.parse(html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')) as Record<
    string,
    unknown
  >;
  const url = 'https://softsystemsstudiollc.com/blog/lawn-care-website-cost';
  assert.equal(ld['@type'], 'Article');
  assert.equal(ld.url, url);
  assert.deepEqual(ld.mainEntityOfPage, { '@type': 'WebPage', '@id': url });
  assert.equal(
    ld.image,
    'https://softsystemsstudiollc.com/api/og?title=Lawn%20Care%20Website%20Cost',
  );
  assert.equal(ld.wordCount, 912);
  assert.equal(ld.inLanguage, 'en-US');
  assert.equal(ld.datePublished, '2026-11-16');
  assert.equal(ld.dateModified, '2026-11-16');
  for (const org of [ld.author, ld.publisher] as Record<string, string>[]) {
    assert.equal(org['@type'], 'Organization');
    assert.equal(org.name, 'Soft Systems Studio');
  }
});

test('a hostile title cannot close the Breadcrumb JSON-LD block early', () => {
  const html = renderToStaticMarkup(
    createElement(BreadcrumbSchema, { items: [{ name: HOSTILE, path: '/blog/x' }] }),
  );
  assert.equal(closings(html), 1);
  assert.ok(html.endsWith('</script>'));
});
