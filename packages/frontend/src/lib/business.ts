/**
 * Canonical facts about the business — pricing, service area, contact.
 *
 * Single source of truth so copy, metadata, and JSON-LD can't drift into
 * five different pricing schemes again (see SITE-AUDIT-2026-09.md in the
 * repo root for the incident that made this file necessary).
 */

/** Flat, one-time website build fee. */
export const BUILD_FEE = '$997';

/** Monthly retainer tiers — $150 is the intended entry ask. */
export const RETAINER_MIN = '$150';
export const RETAINER_MAX = '$200';
export const RETAINER_RANGE = '$150–$200/month';

/**
 * Care Plans (the monthly retainer). The plans include the same services and
 * differ only in edit hours per month. Must match the Lead Tool's
 * docs/SCOPE.md and lib/retainerPlans.ts, and the live Stripe products
 * "Website Care — Essential / Plus / Premium" (decided 2026-09-25).
 */
export const CARE_PLANS = [
  { name: 'Essential', price: '$150', editHours: 2 },
  { name: 'Plus', price: '$175', editHours: 3 },
  { name: 'Premium', price: '$200', editHours: 4 },
] as const;

/** Revision rounds included in the build, before launch. */
export const BUILD_REVISION_ROUNDS = 2;

/** What the build ships. Must match the Lead Tool's docs/SCOPE.md §1. */
export const WEBSITE_FEATURES = [
  'A custom one-page site built around your business and brand',
  'The words written for you — you review, you don’t have to write',
  'Mobile-first and fast, with tap-to-call on phones',
  'Contact form that emails you directly',
  'Basic on-page SEO',
  `${BUILD_REVISION_ROUNDS} rounds of revisions before launch`,
  'Launched on your own domain — registered in your name, so you own it',
];

/** How long a build-only site stays on our hosting after launch. */
export const BUILD_ONLY_HOSTING_DAYS = 30;

/**
 * Where Austin is based. The studio works with local businesses anywhere
 * (remotely, by phone, email and video), and in person around the cities
 * below — decided 2026-09-30, so copy can lead with the local area without
 * implying the studio only serves it.
 */
export const HOME_BASE = 'Smiths Station, Alabama';
export const HOME_BASE_SHORT = 'Smiths Station, AL';

/**
 * The in-person area: where meetings can happen face to face. Also the
 * LocalBusiness schema's `areaServed`. No street address is published
 * (home-based), only the town.
 */
export const SERVICE_AREA_CITIES = [
  { name: 'Smiths Station', state: 'Alabama', stateCode: 'AL' },
  { name: 'Phenix City', state: 'Alabama', stateCode: 'AL' },
  { name: 'Columbus', state: 'Georgia', stateCode: 'GA' },
  { name: 'Auburn', state: 'Alabama', stateCode: 'AL' },
  { name: 'Opelika', state: 'Alabama', stateCode: 'AL' },
] as const;
export const SERVICE_AREA_LABEL = 'Columbus, Phenix City, Auburn and Opelika';

/**
 * Austin doesn't have a published business phone number yet. Leave this
 * `null` until he does — never invent one, and never wire up a `tel:` link
 * with a placeholder number. Once a real number exists, set it here
 * (E.164 format, e.g. `'+17065551234'`) and every consumer of this constant
 * (footer, LocalBusiness schema, contact copy) picks it up automatically.
 */
export const BUSINESS_PHONE: string | null = null;

/**
 * Where "Get a quote" goes (2026-10-02): the Lead Tool's sign-up page. A
 * short form there creates the lead in the Lead Tool and emails the person
 * a private link to the detailed questionnaire. /intake on this site
 * redirects here (next.config.mjs), so every existing quote link — buttons,
 * trade pages, outreach emails — lands on it, with `?type=` carried along.
 */
export const START_PROJECT_URL = 'https://tool.softsystemsstudiollc.com/start';

/** The one inbox Austin actually checks — see audit §5 / P5 #16. */
export const CONTACT_EMAIL = 'austin@softsystemsstudiollc.com';
