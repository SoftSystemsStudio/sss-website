/**
 * Deterministic on-page SEO scorecard for a draft. Advisory only: run.ts prints it in
 * the PR body so the owner can see at a glance what to fix; it never blocks a draft.
 *
 * Query matching is deliberately simple: the target query is lower-cased and split on
 * anything that is not a letter or digit (apostrophes are dropped first, so "don't" is
 * "dont"); stopwords and question words ("how", "much", "does", "a", "in", ...) are
 * removed; and each remaining word is folded to a crude singular (a trailing "s" is
 * dropped from words longer than three letters, unless it ends in "ss"). The same
 * folding is applied to the title and body words, so "costs" matches "cost".
 */

export interface SeoInput {
  title: string;
  description: string;
  body: string;
  targetQuery: string;
  existingSlugs: string[];
}

export interface SeoItem {
  key: string;
  ok: boolean;
  note: string;
}

export interface SeoReport {
  items: SeoItem[];
}

export const SEO_LIMITS = {
  titleMax: 60,
  descriptionMin: 120,
  descriptionMax: 155,
  openingWords: 100,
  minH2: 3,
  minInternalLinks: 2,
  minSourceLinks: 2,
  firstParagraphMin: 30,
  firstParagraphMax: 70,
  maxAvgSentenceWords: 22,
} as const;

const SITE_HOST = 'softsystemsstudiollc.com';

const STOPWORDS = new Set(
  (
    'a an the and or but of for to in on at by with from into about as ' +
    'is are was were be been being do does did done i im me my we our ' +
    'you your it its this that these those there their they them ' +
    'can could should would will shall may might must ' +
    'how what which who whom whose when where why much many ' +
    'if than then so not no yes vs versus get'
  ).split(' '),
);

function fold(word: string): string {
  return word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word;
}

/** Lower-case words with apostrophes dropped, split on anything not a letter or digit. */
function rawWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** The target query's significant words, folded, in order, without repeats. */
export function queryWords(query: string): string[] {
  const out: string[] = [];
  for (const w of rawWords(query)) {
    if (STOPWORDS.has(w)) continue;
    const f = fold(w);
    if (!out.includes(f)) out.push(f);
  }
  return out;
}

const HEADING_RE = /^ {0,3}(#{1,6})[ \t]+(.+?)[ \t#]*$/;
const LIST_RE = /^ {0,3}(?:[-*+]|\d+[.)])[ \t]+\S/m;
const TABLE_RE = /^ *\|.+\| *$/m;
const INLINE_LINK_RE = /\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
const AUTOLINK_RE = /<(https?:\/\/[^\s<>]+)>/gi;

/** Markdown to plain text: link text kept, URLs, emphasis and block markers removed. */
function plain(md: string): string {
  return md
    .replace(INLINE_LINK_RE, '$1')
    .replace(AUTOLINK_RE, ' ')
    .replace(/^ {0,3}#{1,6}[ \t]+/gm, '')
    .replace(/^ {0,3}(?:[-*+]|\d+[.)])[ \t]+/gm, '')
    .replace(/^ {0,3}>[ \t]?/gm, '')
    .replace(/[*_`]/g, '');
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function blocks(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

function headings(body: string): { level: number; text: string }[] {
  const out: { level: number; text: string }[] = [];
  for (const line of body.split('\n')) {
    const m = HEADING_RE.exec(line);
    if (m) out.push({ level: m[1].length, text: m[2] });
  }
  return out;
}

function linkDestinations(body: string): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(INLINE_LINK_RE)) out.push(m[2]);
  for (const m of body.matchAll(AUTOLINK_RE)) out.push(m[1]);
  return out;
}

/** Site path for an internal link (relative or on the site host), else null. */
function internalPath(dest: string): string | null {
  if (dest.startsWith('/') && !dest.startsWith('//')) {
    return dest.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  }
  try {
    const u = new URL(dest);
    if (u.host.toLowerCase() !== SITE_HOST) return null;
    return u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}

function externalUrl(dest: string): string | null {
  try {
    const u = new URL(dest);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.host.toLowerCase() === SITE_HOST) return null;
    u.hash = '';
    return u.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

function missingWords(needed: string[], have: Set<string>): string[] {
  return needed.filter((w) => !have.has(w));
}

function foldedSet(text: string): Set<string> {
  return new Set(rawWords(text).map(fold));
}

export function seoReport(input: SeoInput): SeoReport {
  const items: SeoItem[] = [];
  const add = (key: string, ok: boolean, note: string) => items.push({ key, ok, note });
  const L = SEO_LIMITS;

  const title = input.title.trim();
  add(
    'title-length',
    title.length > 0 && title.length <= L.titleMax,
    `${title.length} characters (max ${L.titleMax})`,
  );

  const description = input.description.trim();
  add(
    'description-length',
    description.length >= L.descriptionMin && description.length <= L.descriptionMax,
    `${description.length} characters (${L.descriptionMin} to ${L.descriptionMax})`,
  );

  const body = input.body;
  const plainBody = plain(body);
  const openingWords = rawWords(plainBody).slice(0, L.openingWords);
  const opening = new Set(openingWords.map(fold));
  const qWords = queryWords(input.targetQuery);

  if (!qWords.length) {
    add('query-in-title-or-opening', false, 'the target query has no significant words');
    add('query-in-opening', false, 'the target query has no significant words');
  } else {
    const inTitleOrOpening = new Set([...foldedSet(title), ...opening]);
    const missing = missingWords(qWords, inTitleOrOpening);
    add(
      'query-in-title-or-opening',
      missing.length === 0,
      missing.length
        ? `missing from the title and the first ${L.openingWords} words: ${missing.join(', ')}`
        : `every query word (${qWords.join(', ')}) is in the title or the first ${L.openingWords} words`,
    );

    const phrase = rawWords(input.targetQuery).join(' ');
    const exact = phrase.length > 0 && ` ${openingWords.join(' ')} `.includes(` ${phrase} `);
    const missingOpening = missingWords(qWords, opening);
    add(
      'query-in-opening',
      exact || missingOpening.length === 0,
      exact
        ? `the exact query is in the first ${L.openingWords} words`
        : missingOpening.length === 0
          ? `all query words are in the first ${L.openingWords} words`
          : `not in the first ${L.openingWords} words: ${missingOpening.join(', ')}`,
    );
  }

  const hs = headings(body);
  const h2 = hs.filter((h) => h.level === 2).length;
  add('h2-count', h2 >= L.minH2, `${h2} H2 heading${h2 === 1 ? '' : 's'} (min ${L.minH2})`);

  const dests = linkDestinations(body);
  const existing = new Set(input.existingSlugs);
  const internal = new Set<string>();
  const external = new Set<string>();
  for (const d of dests) {
    const path = internalPath(d);
    if (path !== null) {
      const post = /^\/blog\/([^/]+)$/.exec(path);
      if (post && !existing.has(post[1])) continue;
      internal.add(path);
      continue;
    }
    const ext = externalUrl(d);
    if (ext) external.add(ext);
  }
  add(
    'internal-links',
    internal.size >= L.minInternalLinks,
    `${internal.size} distinct internal link${internal.size === 1 ? '' : 's'} (min ${L.minInternalLinks})` +
      (internal.size ? `: ${[...internal].join(', ')}` : ''),
  );
  add(
    'source-links',
    external.size >= L.minSourceLinks,
    `${external.size} distinct external source link${external.size === 1 ? '' : 's'} (min ${L.minSourceLinks})`,
  );

  const hasList = LIST_RE.test(body);
  const hasTable = TABLE_RE.test(body);
  add(
    'list',
    hasList || hasTable,
    hasList ? 'has a list' : hasTable ? 'has a table' : 'no list or table',
  );

  const first = blocks(body).find((b) => !HEADING_RE.test(b.split('\n')[0]) && !LIST_RE.test(b));
  const firstWords = first ? wordCount(plain(first)) : 0;
  add(
    'first-paragraph',
    firstWords >= L.firstParagraphMin && firstWords <= L.firstParagraphMax,
    `${firstWords} words (${L.firstParagraphMin} to ${L.firstParagraphMax})`,
  );

  // Sentences: each list item is one unit; prose blocks split after . ! or ?.
  const sentences: number[] = [];
  for (const b of blocks(body)) {
    const lines = b.split('\n').filter((line) => !HEADING_RE.test(line));
    // A list block counts each line; a paragraph's soft line breaks are joined first.
    const units = LIST_RE.test(b) ? lines : [lines.join(' ')];
    for (const unit of units) {
      for (const s of plain(unit).split(/(?<=[.!?])\s+/)) {
        const n = wordCount(s);
        if (n) sentences.push(n);
      }
    }
  }
  const avg = sentences.length ? sentences.reduce((a, b) => a + b, 0) / sentences.length : 0;
  add(
    'sentence-length',
    sentences.length > 0 && avg <= L.maxAvgSentenceWords,
    `average ${avg.toFixed(1)} words per sentence (max ${L.maxAvgSentenceWords})`,
  );

  const seen = new Map<string, number>();
  for (const h of hs.filter((x) => x.level >= 2)) {
    const key = rawWords(plain(h.text)).join(' ');
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const dupes = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
  add(
    'unique-headings',
    dupes.length === 0,
    dupes.length ? `repeated: ${dupes.join('; ')}` : `${hs.length} headings, none repeated`,
  );

  return { items };
}
