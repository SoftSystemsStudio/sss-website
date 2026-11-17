const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Anything outside XML 1.0's Char production (C0 controls, lone surrogates, U+FFFE/U+FFFF). */
// eslint-disable-next-line security/detect-unsafe-regex -- one negated character class, no nesting or backtracking
const XML_INVALID_RE = /[^\t\n\r\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu;

/** Escapes text for an XML element or attribute and drops characters XML 1.0 cannot hold. */
export function escapeXml(value: string): string {
  return value
    .replace(XML_INVALID_RE, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** `2026-11-16` -> `November 16, 2026`. Plain string work, so no timezone can shift the day. */
export function formatPostDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** What the root layout's title template appends (`%s | Soft Systems Studio`). */
export const SITE_TITLE_SUFFIX = ' | Soft Systems Studio';
/** Roughly what Google shows of a `<title>` before cutting it off. */
export const TITLE_BUDGET = 60;

/**
 * A post's metadata title: the template (with the site suffix) when the whole thing
 * fits in TITLE_BUDGET, otherwise the post title alone, so search results never cut
 * the post's own words off to make room for the site name.
 */
export function postTitle(title: string): string | { absolute: string } {
  return title.length + SITE_TITLE_SUFFIX.length <= TITLE_BUDGET ? title : { absolute: title };
}

/** Site-relative OG image for a post; the page metadata and the Article JSON-LD share it. */
export function postOgImage(title: string): string {
  return `/api/og?title=${encodeURIComponent(title)}`;
}
