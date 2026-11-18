import { z } from 'zod';
import { isSafeSourceUrl } from './checks';
import { TOPIC_PILLAR_IDS } from './config';

/**
 * Length caps keep the researcher from relaying page text (a prompt-injected page)
 * through the brief into the writer's and reviewer's prompts. An over-long field fails
 * the parse, which the research stage retries once, then gives up.
 */
export const BRIEF_CAPS = {
  title: 150,
  field: 200,
  sourceTitle: 200,
  supports: 300,
  reason: 300,
  serpNotes: 300,
  relatedQuestion: 150,
  relatedQuestions: 5,
};

/**
 * How hard page one is for the target query: `high` = Google's own docs or
 * high-authority specialists, national publishers, big agencies, directories;
 * `medium` = a mix; `low` = forums, thin or off-target pages, small local sites.
 * The site's Domain Rating is about 7, so a `high` brief is never written.
 */
export const COMPETITION_LEVELS = ['low', 'medium', 'high'] as const;

export const briefSchema = z.object({
  title: z.string().min(1).max(BRIEF_CAPS.title),
  targetQuery: z.string().min(1).max(BRIEF_CAPS.field),
  intent: z.string().min(1).max(BRIEF_CAPS.field),
  localAngle: z.string().min(1).max(BRIEF_CAPS.field),
  notDuplicateBecause: z.string().min(1).max(BRIEF_CAPS.field),
  pillar: z.enum(TOPIC_PILLAR_IDS),
  competition: z.enum(COMPETITION_LEVELS),
  serpNotes: z.string().min(1).max(BRIEF_CAPS.serpNotes),
  relatedQuestions: z
    .array(z.string().min(1).max(BRIEF_CAPS.relatedQuestion))
    .max(BRIEF_CAPS.relatedQuestions)
    .optional(),
  sources: z.array(
    z.object({
      url: z.string().url().refine(isSafeSourceUrl, { message: 'must be a public http(s) URL' }),
      title: z.string().max(BRIEF_CAPS.sourceTitle),
      supports: z.string().max(BRIEF_CAPS.supports),
    }),
  ),
});
export type Brief = z.infer<typeof briefSchema>;

export const researchResultSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('topic'), brief: briefSchema }),
  z.object({ kind: z.literal('none'), reason: z.string().max(BRIEF_CAPS.reason) }),
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

/**
 * `already-ran-today` is only returned by a scheduled run's once-a-day gate; it is
 * never written to the run log and never notified.
 */
export type SkipReason =
  | 'gate-full'
  | 'no-topic'
  | 'reviewer-reject'
  | 'checks-failed'
  | 'slug-collision'
  | 'already-ran-today';

export type RunOutcome =
  { kind: 'pr'; url: string } | { kind: 'skipped'; reason: SkipReason; detail: string };
