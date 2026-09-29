/**
 * The concept (demo) sites under /demo/*, as shown on the homepage and the
 * /for/* trade pages. Screenshots in public/images/work/ are captured from
 * the live demo pages — re-capture them when a demo changes (see CLAUDE.md).
 * The businesses are fictional; see PORTFOLIO_CONCEPTS.md.
 */
export interface Concept {
  slug: string;
  name: string;
  type: string;
  href: string;
  /** 1440×2700 capture of the top of the demo, panned on hover */
  fullImage: string;
  /** 390×844 (2x) capture of the demo's first screen on a phone */
  mobileImage: string;
  problem: string;
  design: string;
}

export const CONCEPTS: Concept[] = [
  {
    slug: 'ironwood-auto',
    name: 'Ironwood Auto & Tire',
    type: 'Auto repair',
    href: '/demo/ironwood-auto',
    fullImage: '/images/work/ironwood-auto-full.jpg',
    mobileImage: '/images/work/ironwood-auto-mobile.jpg',
    problem:
      'People find a repair shop on their phone, often standing next to a car that won’t start.',
    design:
      'The phone number sits above the fold, a call bar follows you down the page, and services scan in seconds.',
  },
  {
    slug: 'kettle-and-grain',
    name: 'Kettle & Grain Coffee Co.',
    type: 'Coffee shop',
    href: '/demo/kettle-and-grain',
    fullImage: '/images/work/kettle-and-grain-full.jpg',
    mobileImage: '/images/work/kettle-and-grain-mobile.jpg',
    problem: 'A coffee shop sells a room, not an emergency. Urgency would feel wrong.',
    design:
      'Big, quiet photography, a menu you can actually read, and hours and directions one tap away.',
  },
  {
    slug: 'green-bench',
    name: 'Green Bench Lawn & Landscape',
    type: 'Lawn & landscape',
    href: '/demo/green-bench',
    fullImage: '/images/work/green-bench-full.jpg',
    mobileImage: '/images/work/green-bench-mobile.jpg',
    problem: 'Lawn care is judged by finished yards, and the work changes with the seasons.',
    design:
      'Recent work leads the page, services are grouped by season, and asking for a quote takes one tap.',
  },
  {
    slug: 'mayhaw',
    name: 'Mayhaw Flower Studio',
    type: 'Florist',
    href: '/demo/mayhaw',
    fullImage: '/images/work/mayhaw-full.jpg',
    mobileImage: '/images/work/mayhaw-mobile.jpg',
    problem:
      'Flowers are bought for an occasion, often on the same day, by someone who has never ordered from you before.',
    design:
      'The arrangements lead, ordering is organized by occasion, and the same-day cutoff sits above everything else.',
  },
];

export function getConcept(slug: string): Concept {
  const concept = CONCEPTS.find((c) => c.slug === slug);
  if (!concept) throw new Error(`Unknown concept: ${slug}`);
  return concept;
}
