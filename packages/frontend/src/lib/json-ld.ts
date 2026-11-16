/**
 * JSON for an inline <script type="application/ld+json"> block. Escapes "<" so a
 * value such as "</script>" can never end the block early, and U+2028/U+2029 so the
 * text stays valid JavaScript for any tool that evals it. JSON.parse reads it back
 * unchanged.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
