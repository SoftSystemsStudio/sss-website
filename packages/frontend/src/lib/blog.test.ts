/* eslint-disable security/detect-non-literal-fs-filename -- temp dirs in tests */
/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllPosts, getPost, renderMarkdown, resolveContentDir } from './blog';

const fm = (slug: string, date: string) => `---
title: "A sufficiently long title for ${slug}"
description: "A description that is long enough to satisfy the schema minimum of seventy characters for sure."
slug: ${slug}
date: ${date}
tags: [pricing]
sources:
  - { url: "https://example.com/1", title: "One" }
  - { url: "https://example.com/2", title: "Two" }
  - { url: "https://example.com/3", title: "Three" }
---
`;

async function tmp(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'blog-'));
  for (const [n, c] of Object.entries(files)) await writeFile(path.join(dir, n), c);
  return dir;
}

test('sorts newest first and resolves tokens', async () => {
  const dir = await tmp({
    'older-post.md': fm('older-post', '2026-01-01') + 'Hello {{BUILD_FROM}}',
    'newer-post.md': fm('newer-post', '2026-06-01') + 'Hi',
  });
  const posts = getAllPosts(dir);
  assert.deepEqual(
    posts.map((p) => p.slug),
    ['newer-post', 'older-post'],
  );
  assert.ok(!posts[1].html.includes('{{'));
  assert.ok(posts[0].wordCount >= 1);
  assert.equal(getPost('older-post', dir)?.slug, 'older-post');
});

test('sanitizes scripts and handlers', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=x>\n\ntext');
  assert.ok(!html.includes('<script'));
  assert.ok(!html.includes('alert(1)'));
  assert.ok(!html.includes('onerror'));
  assert.ok(!html.includes('<img'));
});

test('external links get rel noopener', () => {
  const html = renderMarkdown('[x](https://example.com) [y](/pricing)');
  assert.match(html, /<a href="https:\/\/example\.com"[^>]*rel="noopener"/);
  assert.match(html, /<a href="\/pricing">/);
});

test('h2 and h3 get stable slug ids; h4 and other tags do not', () => {
  const html = renderMarkdown(
    '## How Much Does a Site Cost?\n\ntext\n\n### Café & Hosting\n\ntext\n\n#### Small print',
  );
  assert.match(html, /<h2 id="how-much-does-a-site-cost">How Much Does a Site Cost\?<\/h2>/);
  assert.match(html, /<h3 id="cafe-and-hosting">Café &amp; Hosting<\/h3>/);
  assert.match(html, /<h4>Small print<\/h4>/);
  assert.equal(renderMarkdown('## A\n\n## A').includes('id="a-2"'), true);
});

test('heading ids are de-duplicated, never empty and never clash with page ids', () => {
  const html = renderMarkdown('## Costs\n\n## Costs\n\n### costs\n\n## !!!\n\n## Main content');
  const ids = [...html.matchAll(/ id="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ['costs', 'costs-2', 'costs-3', 'section', 'main-content-2']);
});

test('heading ids resolve tokens and stay ASCII kebab-case under 60 characters', () => {
  const html = renderMarkdown(`## Builds start at {{BUILD_FROM}}\n\n## ${'word '.repeat(30)}`);
  const ids = [...html.matchAll(/ id="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(ids.length, 2);
  for (const id of ids) {
    // eslint-disable-next-line security/detect-unsafe-regex -- test-only, short fixed input
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(id.length <= 60, id);
  }
  assert.ok(!ids[0].includes('{'));
});

test('post text cannot set or inject heading attributes', () => {
  const hostile = [
    '<h2 id="main-content" onclick="alert(1)" class="x">Raw heading</h2>',
    '## Title <span id="evil" onmouseover="alert(1)">here</span>',
    '## "><img src=x onerror=alert(1)> quote " attack',
    '<h3 style="color:red" id="javascript:alert(1)">Styled</h3>',
    '## Spoof {#custom-id}',
  ].join('\n\n');
  const html = renderMarkdown(hostile);
  assert.ok(!/onclick|onmouseover|onerror|style=|class=|<img|<span/i.test(html), html);
  assert.ok(!html.includes('id="main-content"'));
  assert.ok(!html.includes('id="evil"'));
  assert.ok(!html.includes('javascript'));
  // Every heading attribute is a code-generated id and nothing else.
  for (const m of html.matchAll(/<h[1-6]([^>]*)>/g)) {
    // eslint-disable-next-line security/detect-unsafe-regex -- test-only, short fixed input
    assert.match(m[1], /^( id="[a-z0-9]+(-[a-z0-9]+)*")?$/, m[0]);
  }
  // No other element carries an id.
  assert.equal((html.match(/ id="/g) ?? []).length, (html.match(/<h[23] /g) ?? []).length);
});

test('invalid frontmatter throws naming the file', async () => {
  const dir = await tmp({ 'broken.md': '---\ntitle: x\n---\nbody' });
  assert.throws(() => getAllPosts(dir), /broken\.md/);
});

test('empty dir and missing post', async () => {
  const dir = await tmp({});
  assert.deepEqual(getAllPosts(dir), []);
  assert.equal(getPost('missing', dir), undefined);
});

test('a slug that differs from the file name throws naming the file', async () => {
  const dir = await tmp({ 'file-name.md': fm('other-slug', '2026-01-01') + 'Hi' });
  assert.throws(() => getAllPosts(dir), /file-name\.md.*other-slug|other-slug.*file-name\.md/);
});

test('a duplicate slug throws naming both files', async () => {
  // The duplicate check runs before the file-name check, so it names both files.
  const dir = await tmp({
    'same-post.md': fm('same-post', '2026-01-01') + 'Hi',
    'same-post.markdown.md': fm('same-post', '2026-01-02') + 'Hi',
  });
  assert.throws(
    () => getAllPosts(dir),
    (e: Error) =>
      /duplicate slug "same-post"/i.test(e.message) &&
      e.message.includes('same-post.md') &&
      e.message.includes('same-post.markdown.md'),
  );
});

// The real content dir, resolved from this file (never from env): CI builds the site with
// the fixture dir, so this is what makes a bad draft post fail Core CI.
const REAL_CONTENT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../content/blog',
);

test('every real post in content/blog is valid and its slug matches its file name', () => {
  const posts = getAllPosts(REAL_CONTENT_DIR);
  const files = fs
    .readdirSync(REAL_CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3))
    .sort();
  assert.deepEqual(posts.map((p) => p.slug).sort(), files);
});

test('the real-content check throws with the file name when a post is invalid', async () => {
  const dir = await tmp({ 'bad-draft.md': fm('bad-draft', '2026-01-01') + 'Hi {{NOPE}}' });
  assert.throws(() => getAllPosts(dir), /bad-draft\.md/);
});

test('resolveContentDir uses BLOG_CONTENT_DIR only outside Vercel production', () => {
  const cwd = path.join('x', 'site');
  const def = path.join(cwd, 'content', 'blog');
  assert.equal(resolveContentDir({ cwd }), def);
  assert.equal(resolveContentDir({ cwd, BLOG_CONTENT_DIR: '/fixtures' }), '/fixtures');
  assert.equal(
    resolveContentDir({ cwd, BLOG_CONTENT_DIR: '/fixtures', VERCEL_ENV: 'preview' }),
    '/fixtures',
  );
  assert.equal(
    resolveContentDir({ cwd, BLOG_CONTENT_DIR: '/fixtures', VERCEL_ENV: 'production' }),
    def,
  );
});
