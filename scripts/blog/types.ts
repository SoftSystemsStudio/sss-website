import { z } from 'zod';
import { isSafeSourceUrl } from './checks';

export const briefSchema = z.object({
  title: z.string().min(1),
  targetQuery: z.string().min(1),
  intent: z.string().min(1),
  localAngle: z.string().min(1),
  notDuplicateBecause: z.string().min(1),
  sources: z.array(
    z.object({
      url: z.string().url().refine(isSafeSourceUrl, { message: 'must be a public http(s) URL' }),
      title: z.string(),
      supports: z.string(),
    }),
  ),
});
export type Brief = z.infer<typeof briefSchema>;

export const researchResultSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('topic'), brief: briefSchema }),
  z.object({ kind: z.literal('none'), reason: z.string() }),
]);
export type ResearchResult = z.infer<typeof researchResultSchema>;

export const CHECKLIST_KEYS = [
  'sourced',
  'noInventedNumbers',
  'noGuarantees',
  'studioFactsOnly',
  'noCopiedPhrasing',
  'localValue',
  'voice',
  'notDuplicate',
] as const;
export type ChecklistKey = (typeof CHECKLIST_KEYS)[number];

export const reviewResultSchema = z.object({
  verdict: z.enum(['pass', 'revise', 'reject']),
  notes: z.array(z.string()),
  checklist: z.object({
    sourced: z.boolean(),
    noInventedNumbers: z.boolean(),
    noGuarantees: z.boolean(),
    studioFactsOnly: z.boolean(),
    noCopiedPhrasing: z.boolean(),
    localValue: z.boolean(),
    voice: z.boolean(),
    notDuplicate: z.boolean(),
  }),
});
export type ReviewResult = z.infer<typeof reviewResultSchema>;

export type SkipReason =
  'gate-full' | 'no-topic' | 'reviewer-reject' | 'checks-failed' | 'slug-collision';

export type RunOutcome =
  { kind: 'pr'; url: string } | { kind: 'skipped'; reason: SkipReason; detail: string };
