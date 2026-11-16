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
