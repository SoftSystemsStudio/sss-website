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
 * Content pillars the blog builds topical clusters around. The researcher gets this
 * list with the existing post titles and picks the pillar the posts cover least, so
 * the blog rotates through them instead of drifting. `id` goes in the brief.
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
    examples: 'website vs Facebook page or Google listing only, when a one-page site is enough',
  },
  {
    id: 'local-search',
    label: 'Local search basics for small businesses',
    examples: 'showing up when people nearby search, consistent name, address and phone, reviews',
  },
  {
    id: 'trades',
    label: 'Websites by trade',
    examples: 'what a lawn care, florist, salon, auto repair or contractor site needs on it',
  },
  {
    id: 'mobile-speed',
    label: 'Mobile and speed',
    examples: 'why the site has to work on a phone, what makes a small site slow',
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
