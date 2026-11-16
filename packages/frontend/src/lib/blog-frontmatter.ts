import matter from 'gray-matter';

function refuse(): never {
  throw new Error('Only YAML frontmatter is allowed (no js/json/other engines).');
}

/**
 * Parse a post's frontmatter as YAML only. gray-matter's default engines would
 * execute JavaScript from a `---js` block, and drafts are untrusted LLM output,
 * so every non-YAML engine throws. A YAML date is normalised to YYYY-MM-DD.
 */
export function parseFrontmatter(markdown: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const parsed = matter(markdown, {
    language: 'yaml',
    engines: { js: refuse, javascript: refuse, json: refuse },
  });
  const data: Record<string, unknown> = { ...parsed.data };
  // YAML turns an unquoted 2026-11-16 into a Date; the schema wants the string.
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  return { data, content: parsed.content };
}
