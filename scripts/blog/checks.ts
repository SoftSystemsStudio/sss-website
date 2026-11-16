import matter from 'gray-matter';
import { postFrontmatterSchema, WORD_RANGE } from '../../packages/frontend/src/lib/blog-schema';
import {
  listTokens,
  resolveTokens,
  STUDIO_LITERALS,
} from '../../packages/frontend/src/lib/blog-tokens';
import { SIMILARITY } from './config';

export interface CheckFailure {
  code: string;
  message: string;
}

export const BANNED_PHRASES: RegExp[] = [
  /#1\b/i,
  /\bnumber one\b/i,
  /\bguarantee(d|s)?\b/i,
  /\brank(s|ed)? (first|#1|on page one)\b/i,
  /\btop spot\b/i,
];

const FETCH_TIMEOUT_MS = 10_000;
const FETCH_HEADERS = {
  'User-Agent': 'SoftSystemsStudioBlogBot/1.0 (+https://softsystemsstudiollc.com)',
};

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Fraction of a's n-word shingles that also occur in b (0 when a has fewer than n words). */
export function shingleOverlap(a: string, b: string, n: number = SIMILARITY.shingleWords): number {
  const aw = normalizeWords(a);
  if (aw.length < n) return 0;
  const bw = normalizeWords(b);
  const bSet = new Set<string>();
  for (let i = 0; i + n <= bw.length; i++) bSet.add(bw.slice(i, i + n).join(' '));
  let total = 0;
  let hit = 0;
  for (let i = 0; i + n <= aw.length; i++) {
    total++;
    if (bSet.has(aw.slice(i, i + n).join(' '))) hit++;
  }
  return hit / total;
}

const RAW_HTML_RE = /<!--|<\/?[a-z][a-z0-9-]*(\s[^>]*)?\/?>/i;
const MD_LINK_RE = /\[[^\]]+\]\([^)]+\)/;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function unknownTokens(text: string): string[] {
  const bad: string[] = [];
  for (const t of listTokens(text)) {
    try {
      resolveTokens(`{{${t}}}`);
    } catch {
      bad.push(t);
    }
  }
  return bad;
}

export function runChecks(input: {
  markdown: string;
  existingPosts: { slug: string; body: string }[];
  sourceTexts: Record<string, string>;
}): CheckFailure[] {
  const failures: CheckFailure[] = [];
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(input.markdown);
  } catch (e) {
    return [{ code: 'frontmatter', message: `Frontmatter could not be parsed: ${String(e)}` }];
  }

  // YAML turns an unquoted 2026-11-16 into a Date; the schema wants the string.
  const data: Record<string, unknown> = { ...parsed.data };
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  const fm = postFrontmatterSchema.safeParse(data);
  if (!fm.success) {
    failures.push({ code: 'frontmatter', message: fm.error.message });
  }
  // Tokens are body-only: they are never resolved in the title or description.
  if (JSON.stringify(parsed.data).includes('{{')) {
    failures.push({
      code: 'unknown-token',
      message: 'Frontmatter contains "{{": tokens are only allowed in the body.',
    });
  }

  const body = parsed.content;

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  if (wordCount < WORD_RANGE.min || wordCount > WORD_RANGE.max) {
    failures.push({
      code: 'word-count',
      message: `Body has ${wordCount} words; must be ${WORD_RANGE.min}-${WORD_RANGE.max}.`,
    });
  }

  for (const re of BANNED_PHRASES) {
    const m = re.exec(body);
    if (m) failures.push({ code: 'banned-phrase', message: `Banned phrase: "${m[0]}".` });
  }

  if (RAW_HTML_RE.test(body)) {
    failures.push({ code: 'raw-html', message: 'Body contains raw HTML; use Markdown only.' });
  }

  for (const t of unknownTokens(body)) {
    failures.push({ code: 'unknown-token', message: `Unknown token {{${t}}}.` });
  }

  for (const lit of STUDIO_LITERALS) {
    // eslint-disable-next-line security/detect-non-literal-regexp -- literal is escaped and derived from business.ts
    const re = new RegExp(`${escapeRe(lit)}(?!\\d)`);
    if (re.test(body)) {
      failures.push({
        code: 'studio-literal',
        message: `Studio price "${lit}" typed literally; use a {{TOKEN}}.`,
      });
    }
  }

  for (const para of body.split(/\n\s*\n/)) {
    if (/\$\s?\d/.test(para) && !MD_LINK_RE.test(para)) {
      failures.push({
        code: 'unsourced-dollar',
        message: `Dollar amount without a source link in the same paragraph: "${para.trim().slice(0, 80)}".`,
      });
    }
  }

  for (const post of input.existingPosts) {
    const o = shingleOverlap(body, post.body);
    if (o >= SIMILARITY.existingPosts) {
      failures.push({
        code: 'duplicate',
        message: `${Math.round(o * 100)}% of the draft's phrasing matches existing post "${post.slug}".`,
      });
    }
  }

  for (const [url, text] of Object.entries(input.sourceTexts)) {
    const o = shingleOverlap(body, text);
    if (o >= SIMILARITY.sources) {
      failures.push({
        code: 'copied',
        message: `${Math.round(o * 100)}% of the draft's phrasing matches source ${url}.`,
      });
    }
  }

  return failures;
}

function request(fetchFn: typeof fetch, url: string): Promise<Response> {
  return fetchFn(url, {
    headers: FETCH_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

export async function checkSourceUrls(
  urls: string[],
  fetchFn: typeof fetch,
): Promise<CheckFailure[]> {
  const failures: CheckFailure[] = [];
  for (const url of urls) {
    try {
      const s = (await request(fetchFn, url)).status;
      // 2xx/3xx pass; 403/429 mean the site blocks bots, not that the page is gone.
      if (s < 400 || s === 403 || s === 429) continue;
      failures.push({ code: 'source-url', message: `Source ${url} returned HTTP ${s}.` });
    } catch (e) {
      failures.push({
        code: 'source-url',
        message: `Source ${url} could not be fetched: ${String(e)}.`,
      });
    }
  }
  return failures;
}

export async function fetchSourceTexts(
  urls: string[],
  fetchFn: typeof fetch,
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const url of urls) {
    try {
      const res = await request(fetchFn, url);
      if (res.status >= 400) continue;
      const html = await res.text();
      out[url] = html
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch {
      // best effort: failures are omitted
    }
  }
  return out;
}
