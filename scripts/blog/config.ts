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
