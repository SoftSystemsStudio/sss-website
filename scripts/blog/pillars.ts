import { TOPIC_PILLARS, TOPIC_PILLAR_IDS, type TopicPillarId } from './config';

/**
 * Pillar rotation, decided in code (the researcher only follows the order it is given).
 * Coverage comes from the `**Pillar:**` line this pipeline writes into each draft PR's
 * body; merged and open drafts count, closed (rejected) ones do not. Published posts
 * carry no pillar in their frontmatter, so they are not counted separately.
 */

const KNOWN = new Set<string>(TOPIC_PILLAR_IDS);

function labelOf(id: TopicPillarId): string {
  return TOPIC_PILLARS.find((p) => p.id === id)?.label ?? id;
}

/** The PR body line for a brief's pillar: the label for people, the id for pillarOf. */
export function pillarLine(id: TopicPillarId): string {
  return `- **Pillar:** ${labelOf(id)} (\`${id}\`)`;
}

const PILLAR_LINE_RE = /^- \*\*Pillar:\*\* [^`\n]*\(`([a-z-]{1,40})`\)[ \t]*$/m;

/** The pillar id from a PR body's Pillar line; '' unless it is a strict line with a known id. */
export function pillarOf(body: string | null | undefined): TopicPillarId | '' {
  const m = PILLAR_LINE_RE.exec(body ?? '');
  return m && KNOWN.has(m[1]) ? (m[1] as TopicPillarId) : '';
}

/** How many merged or open drafts each pillar has. Unknown or missing pillars are ignored. */
export function pillarCounts(
  prs: { pillar: string; state: 'open' | 'closed'; merged: boolean }[],
): Record<TopicPillarId, number> {
  const counts = Object.fromEntries(TOPIC_PILLAR_IDS.map((id) => [id, 0])) as Record<
    TopicPillarId,
    number
  >;
  for (const p of prs) {
    if (!(p.state === 'open' || p.merged) || !KNOWN.has(p.pillar)) continue;
    counts[p.pillar as TopicPillarId]++;
  }
  return counts;
}

/** Day of the year (0-based, UTC) of `date`. */
function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.getTime() - start) / 86_400_000);
}

/**
 * Every pillar, least covered first. Pillars with the same count keep TOPIC_PILLARS
 * order, rotated by the run's day of year modulo the group size, so ties (including no
 * posts at all) start on a different pillar each day. Deterministic: no randomness.
 */
export function pillarOrder(counts: Record<TopicPillarId, number>, date: Date): TopicPillarId[] {
  const byCount = new Map<number, TopicPillarId[]>();
  for (const id of TOPIC_PILLAR_IDS) {
    const n = counts[id] ?? 0;
    byCount.set(n, [...(byCount.get(n) ?? []), id]);
  }
  const doy = dayOfYear(date);
  return [...byCount.keys()]
    .sort((a, b) => a - b)
    .flatMap((n) => {
      const group = byCount.get(n) ?? [];
      const shift = doy % group.length;
      return [...group.slice(shift), ...group.slice(0, shift)];
    });
}
