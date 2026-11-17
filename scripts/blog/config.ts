export const MODELS = {
  researcher: 'claude-sonnet-5-5',
  writer: 'claude-sonnet-5-5',
  reviewer: 'claude-opus-5-5',
} as const;

export const MAX_OPEN_DRAFTS = 3;
export const STALE_DAYS = 14;
export const MAX_REVISIONS = 1;
export const LABEL_DRAFT = 'blog-draft';
export const LOG_ISSUE_TITLE = 'Blog pipeline log';

export const SIMILARITY = { existingPosts: 0.35, sources: 0.2, shingleWords: 5 } as const;

/**
 * Content pillars the blog builds topical clusters around. Code orders them each run,
 * least covered first (scripts/blog/pillars.ts), and the researcher uses the first one
 * where it finds a winnable topic. `id` goes in the brief and the PR body. Keep the
 * wording on narrow, local questions a one-person web studio can answer and rank for;
 * not Google Business Profile, reviews or other local-SEO-specialist ground.
 */
export const TOPIC_PILLARS = [
  {
    id: 'cost',
    label: 'Website cost and pricing',
    examples: 'how much a small business website costs, what drives the price, one-time vs monthly',
  },
  {
    id: 'need',
    label: 'Do I need a website',
    examples: 'a website vs only a Facebook page, when a one-page site is enough for a small shop',
  },
  {
    id: 'nearby-customers',
    label: 'A website that brings in nearby customers',
    examples:
      'should my website show my address and hours, one page or a page per town, what to put on the site so nearby customers call',
  },
  {
    id: 'trades',
    label: 'Websites by trade',
    examples: 'what a lawn care, florist, salon, auto repair or contractor site needs on it',
  },
  {
    id: 'mobile-speed',
    label: 'Mobile and speed',
    examples:
      'checking your own site on your phone, tap-to-call buttons, what makes a small site slow to load',
  },
  {
    id: 'hiring',
    label: 'Choosing a web designer',
    examples: 'questions to ask, who owns the domain and the site, red flags in a quote',
  },
  {
    id: 'whats-included',
    label: 'What is included in a website build',
    examples: 'pages, copy, domain, hosting, email, how long a build takes',
  },
  {
    id: 'after-launch',
    label: 'After-launch care',
    examples: 'updates, hosting renewals, edits, keeping hours and prices current',
  },
] as const;
export type TopicPillarId = (typeof TOPIC_PILLARS)[number]['id'];
export const TOPIC_PILLAR_IDS = TOPIC_PILLARS.map((p) => p.id) as [
  TopicPillarId,
  ...TopicPillarId[],
];

/** Towns the researcher may use as query modifiers (the studio's in-person area). */
export const TOPIC_TOWNS = [
  'Smiths Station',
  'Phenix City',
  'Columbus GA',
  'Auburn',
  'Opelika',
] as const;

/** Trades the researcher may use as query modifiers. */
export const TOPIC_TRADES = [
  'lawn care',
  'florists',
  'coffee shops',
  'auto repair',
  'cleaners',
  'contractors',
  'salons',
] as const;
