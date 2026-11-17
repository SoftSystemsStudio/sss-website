/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from './blog-frontmatter';

test('parses YAML and returns the body', () => {
  const r = parseFrontmatter('---\ntitle: Hello there\ntags:\n  - a\n---\nbody text\n');
  assert.equal(r.data.title, 'Hello there');
  assert.deepEqual(r.data.tags, ['a']);
  assert.equal(r.content.trim(), 'body text');
});

test('normalises an unquoted date to YYYY-MM-DD', () => {
  assert.equal(parseFrontmatter('---\ndate: 2026-11-16\n---\nx').data.date, '2026-11-16');
});

test('a ---js block throws and runs no code', () => {
  const g = globalThis as Record<string, unknown>;
  delete g.PWNED;
  assert.throws(() => parseFrontmatter('---js\n({title:(globalThis.PWNED=1,"x")})\n---\nbody'));
  assert.equal(g.PWNED, undefined);
});

test('a ---javascript block throws and runs no code', () => {
  const g = globalThis as Record<string, unknown>;
  delete g.PWNED2;
  assert.throws(() =>
    parseFrontmatter('---javascript\n({title:(globalThis.PWNED2=1,"x")})\n---\nbody'),
  );
  assert.equal(g.PWNED2, undefined);
});

test('a ---json block throws', () => {
  assert.throws(() => parseFrontmatter('---json\n{"title":"x"}\n---\nbody'));
});
