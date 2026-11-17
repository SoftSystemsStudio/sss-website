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
    }),
  );
  assert.equal(closings(html), 1);
  assert.ok(html.endsWith('</script>'));
  const json = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  assert.equal((JSON.parse(json) as { headline: string }).headline, HOSTILE);
});

test('a hostile title cannot close the Breadcrumb JSON-LD block early', () => {
  const html = renderToStaticMarkup(
    createElement(BreadcrumbSchema, { items: [{ name: HOSTILE, path: '/blog/x' }] }),
  );
  assert.equal(closings(html), 1);
  assert.ok(html.endsWith('</script>'));
});
