import { z } from 'zod';

/** Word-count window every published post must fall inside. */
export const WORD_RANGE = { min: 700, max: 1200 } as const;

const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), { message: 'must be an http(s) URL' });

export const postFrontmatterSchema = z.object({
  title: z.string().min(10).max(90),
  description: z.string().min(70).max(160),
  slug: z
    .string()
    .max(80)
    // eslint-disable-next-line security/detect-unsafe-regex -- kebab-case groups are '-'-delimited, no ambiguous backtracking
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be kebab-case'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  tags: z.array(z.string().min(1)).min(1).max(4),
  sources: z
    .array(z.object({ url: httpUrl, title: z.string().min(1) }))
    .min(3)
    .max(6),
});

export interface PostFrontmatter {
  title: string;
  description: string;
  slug: string;
  date: string;
  tags: string[];
  sources: { url: string; title: string }[];
}
