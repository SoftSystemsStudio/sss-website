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

function contentDir(dir?: string): string {
  return dir ?? getEnv().BLOG_CONTENT_DIR ?? path.join(process.cwd(), 'content', 'blog');
}

function countWords(md: string): number {
  return md.split(/\s+/).filter(Boolean).length;
}

export function getAllPosts(dir?: string): Post[] {
  const root = contentDir(dir);
  if (!fs.existsSync(/*turbopackIgnore: true*/ root)) return [];
  const posts: Post[] = [];
  for (const file of fs
    .readdirSync(/*turbopackIgnore: true*/ root)
    .filter((f) => f.endsWith('.md'))) {
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
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug: string, dir?: string): Post | undefined {
  return getAllPosts(dir).find((p) => p.slug === slug);
}
