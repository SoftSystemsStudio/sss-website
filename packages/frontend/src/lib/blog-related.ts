interface Relatable {
  slug: string;
  date: string;
  tags: string[];
}

/**
 * Up to `n` other posts to link from `current`: most shared tags first (case-insensitive),
 * then newest. Never includes `current` itself. Pure, so it is unit-tested directly.
 */
export function relatedPosts<T extends Relatable>(all: T[], current: Relatable, n = 3): T[] {
  if (n <= 0) return [];
  const tags = new Set(current.tags.map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.slug !== current.slug)
    .map((post) => ({ post, shared: post.tags.filter((t) => tags.has(t.toLowerCase())).length }))
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        (a.post.date < b.post.date ? 1 : a.post.date > b.post.date ? -1 : 0) ||
        (a.post.slug < b.post.slug ? -1 : 1),
    )
    .slice(0, n)
    .map((x) => x.post);
}
