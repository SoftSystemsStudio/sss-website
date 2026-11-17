import { parseFrontmatter } from '../../packages/frontend/src/lib/blog-frontmatter';
import { postFrontmatterSchema, WORD_RANGE } from '../../packages/frontend/src/lib/blog-schema';
import {
  listTokens,
  resolveTokens,
  STUDIO_DISTINCT_LITERALS,
  STUDIO_LITERALS,
} from '../../packages/frontend/src/lib/blog-tokens';
import { CITY_PAGES } from '../../packages/frontend/src/lib/cities';
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
const MAX_REDIRECTS = 3;
const MAX_BODY_BYTES = 1_500_000;
const TEXT_TYPES = ['text/html', 'text/plain', 'application/xhtml+xml'];
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

// Only <http(s)://...> autolinks may contain a "<" in a post body.
const ALLOWED_AUTOLINK_RE = /<https?:\/\/[^\s<>]*>/gi;
// A "<" followed by a letter, "/", "!" or "?" can open a tag, comment or processing instruction.
const TAG_OPEN_RE = /<[A-Za-z/!?]/;
const HTTP_LINK_RE = /\[[^\]]*\]\(\s*<?https?:\/\/[^)\s]+|<https?:\/\/[^\s<>]+>/i;
const DOLLAR_RE = /\$\s*\d|\d\s*(?:dollars?|usd|bucks)\b|\busd\s*\d/i;
const INLINE_LINK_RE = /\[[^\]]*\]\(\s*<?([^)\s>]*)/g;
const REF_LINK_RE = /^ {0,3}\[[^\]]+\]:\s*<?(\S+)/gm;
const ANGLE_LINK_RE = /<([A-Za-z][A-Za-z0-9+.-]*:[^\s<>]*)>/g;
const TYPED_AMOUNT_RE =
  /(?:(?:\$|\busd\b)\s*(\d[\d,]*)(?!\d|,\d))|(?:(\d[\d,]*)(?!\d|,\d)(?:\.\d+)?\s*(?:dollars?|usd|bucks)\b)/gi;

// GFM (marked's default) also turns bare http(s)://, www. and email text into links.
const BARE_URL_RE = /(?:\bhttps?:\/\/|\bwww\.)[^\s<>()[\]]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi;

/** Every link destination in the body: inline, reference definitions and <autolinks>. */
function linkDestinations(body: string): string[] {
  const urls: string[] = [];
  for (const re of [INLINE_LINK_RE, REF_LINK_RE, ANGLE_LINK_RE]) {
    for (const m of body.matchAll(re)) urls.push(m[1]);
  }
  return urls;
}

function unsafeLinkSchemes(body: string): string[] {
  const urls = linkDestinations(body);
  const bad: string[] = [];
  for (const u of urls) {
    // Browsers ignore control characters and spaces inside a scheme.
    // eslint-disable-next-line no-control-regex
    const cleaned = u.replace(/[\u0000-\u0020]/g, '');
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(cleaned);
    if (scheme && !['http', 'https', 'mailto'].includes(scheme[1].toLowerCase())) bad.push(u);
  }
  return bad;
}

const SITE_HOST = 'softsystemsstudiollc.com';
/** Site pages a body may link to, besides the brief's sources. */
const ALLOWED_SITE_PATHS = new Set([
  '/pricing',
  '/blog',
  '/intake',
  ...CITY_PAGES.map((c) => `/web-design/${c.slug}`),
]);

/** Lower-case scheme and host, no fragment, no trailing slash; null if not an http(s) URL. */
function normalizeUrl(u: string): string | null {
  try {
    const url = new URL(u);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    url.hash = '';
    return url.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

/** An allowed site path, or `/blog/<slug>` for a slug in `postSlugs` (existing posts). */
function isAllowedSitePath(path: string, postSlugs: Set<string>): boolean {
  if (ALLOWED_SITE_PATHS.has(path)) return true;
  const post = /^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(path);
  return post !== null && postSlugs.has(post[1]);
}

function isAllowedLink(dest: string, sources: Set<string>, postSlugs: Set<string>): boolean {
  if (dest.startsWith('/') && !dest.startsWith('//')) {
    return isAllowedSitePath(dest.split('#')[0].replace(/\/$/, ''), postSlugs);
  }
  const n = normalizeUrl(dest);
  if (!n) return false;
  if (sources.has(n)) return true;
  const url = new URL(n);
  return (
    url.protocol === 'https:' &&
    url.host === SITE_HOST &&
    !url.search &&
    isAllowedSitePath(url.pathname.replace(/\/$/, ''), postSlugs)
  );
}

/**
 * Link destinations that are neither one of the draft's frontmatter sources nor an
 * allowed site page (including `/blog/<slug>` of an existing post). Anything
 * unparseable fails closed, and mailto links are not allowed.
 */
function offSourceLinks(body: string, sourceUrls: string[], postSlugs: Set<string>): string[] {
  const sources = new Set(sourceUrls.map(normalizeUrl).filter((u): u is string => u !== null));
  const dests = linkDestinations(body);
  for (const m of body.matchAll(BARE_URL_RE)) {
    const bare = m[0].replace(/[.,;:!?*_~'"]+$/, '');
    dests.push(/^www\./i.test(bare) ? `http://${bare}` : bare);
  }
  return [...new Set(dests.filter((d) => !isAllowedLink(d.trim(), sources, postSlugs)))];
}

/** Amounts (digits only, no commas) in the given price strings: "$1,500" -> "1500". */
function amountsIn(literals: string[]): Set<string> {
  const out = new Set<string>();
  for (const lit of literals) {
    for (const m of lit.matchAll(/\d[\d,]*/g)) out.add(m[0].replace(/,/g, ''));
  }
  return out;
}

/** Headline package prices: typing one is always a studio-literal failure. */
const DISTINCT_AMOUNTS = amountsIn(STUDIO_DISTINCT_LITERALS);
/** Every other studio amount: a failure only next to studio-context wording. */
const AMBIGUOUS_AMOUNTS = new Set(
  [...amountsIn(STUDIO_LITERALS)].filter((n) => !DISTINCT_AMOUNTS.has(n)),
);

/**
 * Signals that make an amount in the same paragraph a claim about the studio's own
 * price. The writer must name the studio's packages and prices through tokens, so a
 * token is the strong signal; typed product words are kept narrow (branded, capitalised
 * forms only) so ordinary market wording ("care plans", "hosting plan", "we", "I paid")
 * never counts.
 */
const STUDIO_CONTEXT_RES: RegExp[] = [
  /\{\{\s*[A-Za-z_]+(?::[A-Za-z0-9_-]+)?\s*\}\}/, // any studio token
  /\bsoft systems\b/i,
  /\bthe studio\b/i,
  /\b(?:Starter|Business|Growth|Custom) (?:package|plan)\b/,
  /\bCare Plans?\b/,
];

function hasStudioContext(text: string): boolean {
  return STUDIO_CONTEXT_RES.some((re) => re.test(text));
}

/**
 * Studio amounts typed as "$997", "$ 997", "997 dollars", "USD 997" in one paragraph
 * (or the title, or the description). A distinct package price always counts and a
 * link never excuses it; an ambiguous amount counts only when the same paragraph has
 * studio-context wording, otherwise it is a generic number for the unsourced-dollar rule.
 */
function typedStudioAmounts(para: string): string[] {
  const context = hasStudioContext(para);
  const found = new Set<string>();
  for (const m of para.matchAll(TYPED_AMOUNT_RE)) {
    const n = (m[1] ?? m[2]).replace(/,/g, '');
    if (DISTINCT_AMOUNTS.has(n) || (context && AMBIGUOUS_AMOUNTS.has(n))) found.add(n);
  }
  return [...found];
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
  let parsed: ReturnType<typeof parseFrontmatter>;
  try {
    parsed = parseFrontmatter(input.markdown);
  } catch (e) {
    return [{ code: 'frontmatter', message: `Frontmatter could not be parsed: ${String(e)}` }];
  }

  const fm = postFrontmatterSchema.safeParse(parsed.data);
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

  // Title and description are public too: phrase and price checks cover them with the body.
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const allText = [str(parsed.data.title), str(parsed.data.description), body].join('\n');

  for (const re of BANNED_PHRASES) {
    const m = re.exec(allText);
    if (m) failures.push({ code: 'banned-phrase', message: `Banned phrase: "${m[0]}".` });
  }

  if (TAG_OPEN_RE.test(body.replace(ALLOWED_AUTOLINK_RE, ''))) {
    failures.push({ code: 'raw-html', message: 'Body contains raw HTML; use Markdown only.' });
  }
  for (const u of unsafeLinkSchemes(body)) {
    failures.push({
      code: 'raw-html',
      message: `Unsafe link scheme (only http, https, mailto): "${u.slice(0, 60)}".`,
    });
  }

  const rawSources: unknown[] = Array.isArray(parsed.data.sources) ? parsed.data.sources : [];
  const sourceUrls = rawSources.map((s) => str((s as { url?: unknown } | null)?.url));
  const postSlugs = new Set(input.existingPosts.map((p) => p.slug));
  for (const u of offSourceLinks(body, sourceUrls, postSlugs)) {
    failures.push({
      code: 'off-source-link',
      message: `Link is not one of the draft's sources or an allowed site page: "${u.slice(0, 100)}".`,
    });
  }

  for (const t of unknownTokens(body)) {
    failures.push({ code: 'unknown-token', message: `Unknown token {{${t}}}.` });
  }

  // The title and the description are each their own paragraph (with no links).
  const paragraphs = [
    str(parsed.data.title),
    str(parsed.data.description),
    ...body.split(/\n\s*\n/),
  ];
  for (const n of new Set(paragraphs.flatMap(typedStudioAmounts))) {
    failures.push({
      code: 'studio-literal',
      message: `Studio price amount ${n} typed literally; use a {{TOKEN}}.`,
    });
  }

  for (const para of paragraphs) {
    // A link only excuses non-studio amounts, and only an http(s) link counts as a source.
    if (DOLLAR_RE.test(para) && !HTTP_LINK_RE.test(para)) {
      failures.push({
        code: 'unsourced-dollar',
        message: `Dollar amount without an http(s) source link in the same paragraph: "${para.trim().slice(0, 80)}".`,
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

function ipv4Parts(host: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  return m ? m.slice(1).map(Number) : null;
}

function isBlockedIpv4([a, b, c]: number[]): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast, reserved, broadcast
  );
}

/** True only for a public-looking http(s) URL: no credentials, no internal or private-IP hosts. */
export function isSafeSourceUrl(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
  if (u.username || u.password) return false;
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (!host) return false;
  if (host.startsWith('[')) {
    const v6 = host.slice(1, -1);
    if (v6 === '::' || v6 === '::1') return false;
    if (/^f[cd]/.test(v6)) return false; // ULA fc00::/7
    if (/^fe[89ab]/.test(v6)) return false; // link-local fe80::/10
    if (/^::ffff:/.test(v6) || /^64:ff9b:/.test(v6)) return false; // IPv4-mapped / NAT64
    return true;
  }
  const v4 = ipv4Parts(host);
  if (v4) return !isBlockedIpv4(v4);
  if (!host.includes('.')) return false; // bare single-label hostname
  if (/^[\d.]+$/.test(host)) return false; // numeric forms the URL parser did not normalise
  return !/(^|\.)(localhost|local|internal|localdomain|home|lan|corp)$/.test(host);
}

/** GET with manual redirects (max 3), re-checking every hop with isSafeSourceUrl. */
async function request(fetchFn: typeof fetch, url: string): Promise<Response> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isSafeSourceUrl(current)) throw new Error(`unsafe URL: ${current}`);
    const res = await fetchFn(current, {
      headers: FETCH_HEADERS,
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const location = res.headers?.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      await res.body?.cancel().catch(() => undefined);
      current = new URL(location, current).toString();
      continue;
    }
    return res;
  }
  throw new Error(`too many redirects (more than ${MAX_REDIRECTS})`);
}

export async function checkSourceUrls(
  urls: string[],
  fetchFn: typeof fetch,
): Promise<CheckFailure[]> {
  const failures: CheckFailure[] = [];
  for (const url of urls) {
    try {
      const res = await request(fetchFn, url);
      await res.body?.cancel().catch(() => undefined);
      const s = res.status;
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

/** Read at most MAX_BODY_BYTES of the body, then cancel the stream. */
async function readCapped(res: Response): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  const all = new Uint8Array(Math.min(size, MAX_BODY_BYTES));
  let off = 0;
  for (const c of chunks) {
    const part = c.subarray(0, all.length - off);
    all.set(part, off);
    off += part.length;
    if (off >= all.length) break;
  }
  return new TextDecoder().decode(all);
}

export async function fetchSourceTexts(
  urls: string[],
  fetchFn: typeof fetch,
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const url of urls) {
    try {
      const res = await request(fetchFn, url);
      const type = (res.headers?.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
      if (res.status >= 400 || !TEXT_TYPES.includes(type)) {
        await res.body?.cancel().catch(() => undefined);
        continue;
      }
      const html = await readCapped(res);
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
