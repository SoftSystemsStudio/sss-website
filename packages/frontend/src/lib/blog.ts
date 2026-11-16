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

export function renderMarkdown(md: string): string {
  const raw = marked.parse(resolveTokens(md), { async: false });
  return sanitizeHtml(raw, {
    allowedTags: [
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
    ],
    allowedAttributes: { a: ['href', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: /^https?:\/\//i.test(attribs.href ?? '')
          ? { ...attribs, rel: 'noopener' }
          : attribs,
      }),
    },
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
