import { SERVICE_AREA_CITIES } from '@/lib/business';

/**
 * City pages at /web-design/<slug> (added 2026-11-12), one per in-person
 * service-area town in SERVICE_AREA_CITIES (lib/business.ts). They are real,
 * indexed pages, in the sitemap and linked from the footer.
 *
 * The exact-match domains (next.config.mjs) redirect to these pages; the pages
 * themselves are the thing that ranks, so each one has its own copy rather
 * than a template with the town name swapped in.
 *
 * Keep claims true and small (compliance standard item 12): no rankings, no
 * numbers, no "best in", no invented local facts. Prices and scope come from
 * lib/business.ts; Austin's base is HOME_BASE.
 */
export interface CityPage {
  slug: string;
  /** "Columbus" */
  name: string;
  /** "Georgia" */
  state: string;
  /** "GA" */
  stateCode: string;
  /** Second line of the headline, set in italics */
  promise: string;
  intro: string;
  /** Why a website matters for a business in this town: two short paragraphs. */
  angle: [string, string];
  /** Slugs of the neighbouring towns to link to */
  nearby: string[];
}

const COPY: Record<string, Omit<CityPage, 'slug' | 'name' | 'state' | 'stateCode'>> = {
  'columbus-ga': {
    promise: 'Easy to find, easy to trust, easy to call.',
    intro:
      'I design, write and build websites for Columbus businesses. I’m based a short way across the state line in Smiths Station, and I’m happy to meet in person in Columbus, or by video if that’s easier.',
    angle: [
      'Columbus is a big enough town that most businesses have several others doing the same thing. When someone searches on their phone, your site has a few seconds to say what you do, where you are and how to reach you.',
      'That’s the job I take on: a site that answers those three questions on the first screen, reads well on a phone, and has a button that calls you. I write the words from what you tell me, so you don’t have to.',
    ],
    nearby: ['phenix-city-al', 'smiths-station-al', 'auburn-al'],
  },
  'phenix-city-al': {
    promise: 'Built for customers on both sides of the river.',
    intro:
      'I design, write and build websites for Phenix City businesses. I’m based in nearby Smiths Station, so a meeting in Phenix City is an easy one, and video works just as well.',
    angle: [
      'Phenix City sits right across the Chattahoochee from Columbus, and plenty of customers move back and forth without thinking about the state line. A good site makes it obvious where you are and what you offer, whichever side they’re searching from.',
      'I build one-page and multi-page sites that put your location, hours and phone number where people look first, and I handle the writing so the site sounds like you.',
    ],
    nearby: ['columbus-ga', 'smiths-station-al', 'opelika-al'],
  },
  'auburn-al': {
    promise: 'A site that keeps up with your calendar.',
    intro:
      'I design, write and build websites for Auburn businesses. I’m based in Smiths Station and meet clients in person around Auburn and Opelika, or by video.',
    angle: [
      'A lot of business in Auburn moves with the school calendar and game weekends. Hours change, specials come and go, and a website that’s hard to update is out of date before the next busy week.',
      'I build sites that are straightforward to keep current, and the optional Care Plans cover hosting and a set number of edit hours each month, so changes are a quick email rather than a project.',
    ],
    nearby: ['opelika-al', 'smiths-station-al', 'phenix-city-al'],
  },
  'opelika-al': {
    promise: 'Clear about who you are and where you are.',
    intro:
      'I design, write and build websites for Opelika businesses. I’m based in Smiths Station and meet clients in person around Opelika and Auburn, or by video.',
    angle: [
      'Opelika sits right next to Auburn, and someone searching for a business nearby may see both towns in the results. Your site should make it plain that you’re in Opelika, what you do and how to get in touch.',
      'I design each site around how your customers decide, write every page for you, and launch it on a domain registered in your own name, so you own it.',
    ],
    nearby: ['auburn-al', 'smiths-station-al', 'phenix-city-al'],
  },
  'smiths-station-al': {
    promise: 'Your neighbor builds your website.',
    intro:
      'Smiths Station is home base: it’s where I live and work, and where Soft Systems Studio is based. If your business is here, I can meet you in person without a long drive.',
    angle: [
      'You work with one person from the first call to launch day, and he lives down the road. No account managers, no handoffs, and no waiting on a team to get back to you.',
      'I design the site, write the words, build it and answer your emails afterward. You get a written quote and a launch date before you commit to anything.',
    ],
    nearby: ['phenix-city-al', 'auburn-al', 'opelika-al'],
  },
};

export const CITY_PAGES: CityPage[] = SERVICE_AREA_CITIES.map((city) => ({
  slug: city.slug,
  name: city.name,
  state: city.state,
  stateCode: city.stateCode,
  ...COPY[city.slug],
}));

export function getCity(slug: string): CityPage | undefined {
  return CITY_PAGES.find((c) => c.slug === slug);
}

/** "Columbus, GA" */
export function cityLabel(city: Pick<CityPage, 'name' | 'stateCode'>): string {
  return `${city.name}, ${city.stateCode}`;
}
