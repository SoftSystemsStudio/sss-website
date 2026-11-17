/* eslint-disable @typescript-eslint/no-floating-promises -- node:test registers tests, no await needed */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTokens, listTokens, UnknownTokenError, STUDIO_LITERALS } from './blog-tokens';
import { BUILD_FROM, BUILD_PACKAGES, getPackage } from './business';

test('resolves named tokens', () => {
  assert.equal(resolveTokens('From {{BUILD_FROM}}'), `From ${BUILD_FROM}`);
});

test('resolves package tokens', () => {
  assert.equal(resolveTokens('{{price:growth}}'), getPackage('growth').price);
  assert.equal(resolveTokens('{{name:growth}}'), getPackage('growth').name);
});

test('unknown token throws naming it', () => {
  assert.throws(
    () => resolveTokens('{{nope}}'),
    (e) => e instanceof UnknownTokenError && /nope/.test(e.message),
  );
});

test('listTokens', () => {
  assert.deepEqual(listTokens('a {{BUILD_FROM}} b {{price:growth}}'), [
    'BUILD_FROM',
    'price:growth',
  ]);
});

test('STUDIO_LITERALS covers prices', () => {
  assert.ok(STUDIO_LITERALS.includes(BUILD_FROM));
  for (const p of BUILD_PACKAGES) assert.ok(STUDIO_LITERALS.includes(p.price));
});
