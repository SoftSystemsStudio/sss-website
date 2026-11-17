/* eslint-disable security/detect-non-literal-fs-filename -- paths come from the content dir, never user input */
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { getEnv } from './env';
import { postFrontmatterSchema, type PostFrontmatter } from './blog-schema';
import { resolveTokens } from './blog-tokens';
import { parseFrontmatter } from './blog-frontmatter';

export interface Post extends PostFrontmatter {
  html: string;
  wordCount: number;
}

const ALLOWED_TAGS = [
  'p',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'strong',
  'em',
  'code',
  'pre',
  'br',
  'hr',
  'a',
];

const linkOptions: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: { a: ['href', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: /^https?:\/\//i.test(attribs.href ?? '') ? { ...attribs, rel: 'noopener' } : attribs,
    }),
  },
};

/** The only shape a heading id can take: ASCII kebab-case. */
// eslint-disable-next-line security/detect-unsafe-regex -- kebab-case groups are '-'-delimited, no ambiguous backtracking
const SAFE_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ID_LENGTH = 60;

/** Ids the post page's own markup uses, so a heading id never duplicates one. */
const RESERVED_IDS = [
  'main-content',
  'mobile-menu',
  'modal-title',
  'more-notes',
  'article-schema',
  'breadcrumb-schema',
  'organization-schema',
  'local-business-schema',
  'website-schema',
  'faq-schema',
  'city-service-schema',
];

/** Kebab-case id for a heading's (already sanitized) inner HTML; "section" if nothing is left. */
export function headingId(innerHtml: string): string {
  const base = innerHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, ' and ')
    .replace(/&[#a-z0-9]+;/gi, ' ')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base) return 'section';
  if (base.length <= MAX_ID_LENGTH) return base;
  const cut = base.slice(0, MAX_ID_LENGTH + 1);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > 0 ? cut.slice(0, lastDash) : base.slice(0, MAX_ID_LENGTH)).replace(/-+$/, '');
}

/**
 * Adds ids to the h2/h3 of HTML that sanitize-html has already stripped of every
 * heading attribute, so `<h2>` and `<h3>` appear bare. Ids are generated here only
 * (kebab-case, de-duplicated, never a reserved page id); post text cannot choose one.
 */
function addHeadingIds(html: string): string {
  const used = new Set(RESERVED_IDS);
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
    const base = headingId(inner);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

/**
 * Markdown to safe HTML. Pass one sanitizes with no heading attributes at all, so
 * raw HTML in a post can never set an id; code then adds generated heading ids; pass
 * two re-sanitizes with `id` allowed on h2/h3 only, and only in the generated shape.
 */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(resolveTokens(md), { async: false });
  const clean = sanitizeHtml(raw, linkOptions);
  const keepSafeId = (tagName: string, attribs: sanitizeHtml.Attributes) => {
    const kept: sanitizeHtml.Attributes = {};
    if (attribs.id && SAFE_ID_RE.test(attribs.id)) kept.id = attribs.id;
    return { tagName, attribs: kept };
  };
  return sanitizeHtml(addHeadingIds(clean), {
    ...linkOptions,
    allowedAttributes: { a: ['href', 'rel'], h2: ['id'], h3: ['id'] },
    transformTags: { ...linkOptions.transformTags, h2: keepSafeId, h3: keepSafeId },
  });
}

/**
 * content/blog under `cwd`, unless BLOG_CONTENT_DIR overrides it. The override is for
 * tests and CI only, so a Vercel production build ignores it: production always
 * publishes the real posts.
 */
export function resolveContentDir(env: {
  cwd: string;
  BLOG_CONTENT_DIR?: string;
  VERCEL_ENV?: string;
}): string {
  const override = env.VERCEL_ENV === 'production' ? undefined : env.BLOG_CONTENT_DIR;
  return override ?? path.join(env.cwd, 'content', 'blog');
}

function contentDir(dir?: string): string {
  if (dir) return dir;
  const { BLOG_CONTENT_DIR, VERCEL_ENV } = getEnv();
  return resolveContentDir({ cwd: process.cwd(), BLOG_CONTENT_DIR, VERCEL_ENV });
}

function countWords(md: string): number {
  return md.split(/\s+/).filter(Boolean).length;
}

export function getAllPosts(dir?: string): Post[] {
  const root = contentDir(dir);
  if (!fs.existsSync(/*turbopackIgnore: true*/ root)) return [];
  const posts: Post[] = [];
  /** slug -> file, to report duplicates. */
  const files = new Map<string, string>();
  const mismatched: string[] = [];
  for (const file of fs
    .readdirSync(/*turbopackIgnore: true*/ root)
    .filter((f) => f.endsWith('.md'))
    .sort()) {
    const parsed = parseFrontmatter(
      fs.readFileSync(
        /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ root, file),
        'utf8',
      ),
    );
    const result = postFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      throw new Error(`Invalid frontmatter in ${file}: ${result.error.message}`);
    }
    // blog-published.yml takes slugs from file names; the site uses the frontmatter slug.
    const slug = result.data.slug;
    const twin = files.get(slug);
    if (twin) throw new Error(`Duplicate slug "${slug}" in ${twin} and ${file}`);
    files.set(slug, file);
    if (file !== `${slug}.md`) mismatched.push(`${file} (slug "${slug}")`);
    try {
      posts.push({
        ...result.data,
        html: renderMarkdown(parsed.content),
        wordCount: countWords(parsed.content),
      });
    } catch (e) {
      throw new Error(`${file}: ${(e as Error).message}`);
    }
  }
  if (mismatched.length) {
    throw new Error(
      `Frontmatter slug must match the file name (without .md): ${mismatched.join(', ')}`,
    );
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug: string, dir?: string): Post | undefined {
  return getAllPosts(dir).find((p) => p.slug === slug);
}
