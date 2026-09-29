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
  /** Who the site is designed around, in one line */
  builtFor: string;
  /** What's actually on the demo — keep these true to the page */
  features: string[];
}

export const CONCEPTS: Concept[] = [
  {
    slug: 'ironwood-auto',
    name: 'Ironwood Auto & Tire',
    type: 'Auto repair',
    href: '/demo/ironwood-auto',
    fullImage: '/images/work/ironwood-auto-full.jpg',
    mobileImage: '/images/work/ironwood-auto-mobile.jpg',
    builtFor: 'Drivers searching on a phone, often next to a car that won’t start.',
    features: [
      'Call button up top',
      'Sticky call bar on phones',
      'Services at a glance',
      'Hours and location',
    ],
  },
  {
    slug: 'kettle-and-grain',
    name: 'Kettle & Grain Coffee Co.',
    type: 'Coffee shop',
    href: '/demo/kettle-and-grain',
    fullImage: '/images/work/kettle-and-grain-full.jpg',
    mobileImage: '/images/work/kettle-and-grain-mobile.jpg',
    builtFor: 'People choosing where to spend a slow morning.',
    features: [
      'Full-bleed photography',
      'Readable, priced menu',
      'Photo gallery',
      'Hours and directions',
    ],
  },
  {
    slug: 'green-bench',
    name: 'Green Bench Lawn & Landscape',
    type: 'Lawn & landscape',
    href: '/demo/green-bench',
    fullImage: '/images/work/green-bench-full.jpg',
    mobileImage: '/images/work/green-bench-mobile.jpg',
    builtFor: 'Homeowners comparing lawn companies by the yards they’ve done.',
    features: [
      'Recent work gallery',
      'Seasonal timeline',
      'Services list',
      'Quote by call or email',
    ],
  },
  {
    slug: 'mayhaw',
    name: 'Mayhaw Flower Studio',
    type: 'Florist',
    href: '/demo/mayhaw',
    fullImage: '/images/work/mayhaw-full.jpg',
    mobileImage: '/images/work/mayhaw-mobile.jpg',
    builtFor: 'Someone buying flowers for an occasion, often the same day.',
    features: [
      'Same-day cutoff up top',
      'Shop by occasion',
      'This week’s bouquets',
      'Order by phone',
    ],
  },
];

export function getConcept(slug: string): Concept {
  const concept = CONCEPTS.find((c) => c.slug === slug);
  if (!concept) throw new Error(`Unknown concept: ${slug}`);
  return concept;
}
