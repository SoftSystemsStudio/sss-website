/* eslint-disable security/detect-non-literal-fs-filename -- temp dirs in tests */
/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getAllPosts, getPost, renderMarkdown } from './blog';

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
    'a.md': fm('older-post', '2026-01-01') + 'Hello {{BUILD_FROM}}',
    'b.md': fm('newer-post', '2026-06-01') + 'Hi',
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
