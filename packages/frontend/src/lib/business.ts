/**
 * Canonical facts about the business — pricing, service area, contact.
 *
 * Single source of truth so copy, metadata, and JSON-LD can't drift into
 * five different pricing schemes again (see SITE-AUDIT-2026-09.md in the
 * repo root for the incident that made this file necessary).
 */

/**
 * Website builds come in packages priced by the size of the site (decided
 * 2026-10-02). Must match the Lead Tool's docs/SCOPE.md §1 — the scope of
 * work for each package — and its lib/pricing.ts, which charges these
 * amounts. Change SCOPE.md first, then here.
 */
export type PackageId = 'starter' | 'business' | 'growth' | 'custom';

export interface BuildPackage {
  id: PackageId;
  name: string;
  /** '$997'. For Custom, the starting point of the quote. */
  price: string;
  /** `price` in dollars, for structured data. */
  priceValue: number;
  /** True for Custom: `price` is a starting point and the build is quoted. */
  quoted: boolean;
  /** One line: what it is. */
  summary: string;
  pages: string;
  bestFor: string;
  /** What you get; each package builds on the one before it. */
  includes: string[];
  /** The things people most often assume are in it and aren't. */
  notIncluded: string[];
  payment: string;
}

/** Revision rounds included in every package, before launch. */
export const BUILD_REVISION_ROUNDS = 2;

/** Builds above this are paid half up front, half at launch. */
export const DEPOSIT_THRESHOLD = '$2,500';

export const BUILD_PACKAGES: BuildPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$997',
    priceValue: 997,
    quoted: false,
    summary: 'A one-page site',
    pages: '1 page',
    bestFor:
      'Looking established and getting the call: who you are, what you do, and how to reach you.',
    includes: [
      'One scrolling page: your main call to action, services or menu, why choose you, Google reviews, hours and map, photos, and contact',
      'A contact form that emails you',
    ],
    notIncluded: [
      'More pages or forms, booking, payments, a blog or a store: add-ons, or a bigger package',
      'Logins, portals or memberships: Custom',
    ],
    payment: 'Paid in full before work starts',
  },
  {
    id: 'business',
    name: 'Business',
    price: '$1,997',
    priceValue: 1997,
    quoted: false,
    summary: 'Up to 5 pages',
    pages: 'Up to 5 pages',
    bestFor: 'Several services, or customers who want the details before they call.',
    includes: [
      'Everything in Starter, spread over up to 5 pages',
      'A page for each main service (within the 5)',
      'A quote or request form, as well as the contact form',
      'A photo gallery page',
    ],
    notIncluded: [
      'Online booking, payments, a blog or a store: add-ons',
      'Logins, portals or memberships: Custom',
    ],
    payment: 'Paid in full before work starts',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$3,497',
    priceValue: 3497,
    quoted: false,
    summary: 'Up to 12 pages and one connected feature',
    pages: 'Up to 12 pages',
    bestFor: 'Booking or taking payments online, or showing up in searches across several towns.',
    includes: [
      'Everything in Business, over up to 12 pages',
      'One connected feature: online booking (with your scheduling tool), online payments or deposits, or a blog',
      'A page for each town you serve, so you show up in local searches (within the 12)',
    ],
    notIncluded: [
      'A second connected feature: an add-on',
      'A store: an add-on under 50 products, Custom above that',
      'Logins, portals or memberships: Custom',
    ],
    payment: 'Half to start, half at launch',
  },
  {
    id: 'custom',
    name: 'Custom',
    price: '$5,000',
    priceValue: 5000,
    quoted: true,
    summary: 'Logins, portals, memberships and bigger stores',
    pages: 'As quoted',
    bestFor:
      'A site people log in to: client portals, staff, contractor or consultant portals, memberships, stores with 50 or more products, or connections to your own software.',
    includes: [
      'Everything in Growth',
      'The logins, portals, store or connections your quote lists',
      'A written scope before any work: every page, every feature, who can log in and what they can do, and a fixed price',
    ],
    notIncluded: [
      'Running it after launch: sites with logins, a store or sensitive information need a Care Plan, quoted with the build',
    ],
    payment: 'Half to start, half at launch',
  },
];

/** '$997', or 'From $5,000' for a quoted package. */
export function priceLabel(pkg: BuildPackage): string {
  return pkg.quoted ? `From ${pkg.price}` : pkg.price;
}

export function getPackage(id: PackageId): BuildPackage {
  return BUILD_PACKAGES.find((pkg) => pkg.id === id)!;
}

/** The lowest build price, for headlines and metadata. */
export const BUILD_FROM = BUILD_PACKAGES[0].price;

/** The cheapest add-on, for "add-ons from …". */
export const ADD_ONS_FROM = '$150';

/** The /pricing page's side-by-side table. Same facts as BUILD_PACKAGES, by row. */
export const PACKAGE_COMPARISON: { label: string; values: Record<PackageId, string> }[] = [
  {
    label: 'Pages',
    values: { starter: '1', business: 'Up to 5', growth: 'Up to 12', custom: 'As quoted' },
  },
  {
    label: 'Forms',
    values: {
      starter: 'Contact',
      business: 'Contact and quote',
      growth: 'Contact and quote',
      custom: 'As quoted',
    },
  },
  {
    label: 'Online booking, payments or a blog',
    values: { starter: 'Add-on', business: 'Add-on', growth: 'One included', custom: 'As quoted' },
  },
  {
    label: 'A page for each town you serve',
    values: { starter: 'No', business: 'No', growth: 'Included', custom: 'As quoted' },
  },
  {
    label: 'Logins, portals or memberships',
    values: { starter: 'No', business: 'No', growth: 'No', custom: 'Included' },
  },
  {
    label: 'Revision rounds before launch',
    values: {
      starter: String(BUILD_REVISION_ROUNDS),
      business: String(BUILD_REVISION_ROUNDS),
      growth: String(BUILD_REVISION_ROUNDS),
      custom: String(BUILD_REVISION_ROUNDS),
    },
  },
  {
    label: 'Payment',
    values: {
      starter: 'In full, up front',
      business: 'In full, up front',
      growth: 'Half now, half at launch',
      custom: 'Half now, half at launch',
    },
  },
];

/** Not in any package. Must match the Lead Tool's docs/SCOPE.md §1. */
export const NOT_IN_ANY_PACKAGE = [
  'Changes after launch: that’s a Care Plan, or a quote before any work starts',
  'Logo design',
  'Email inboxes',
  'The domain itself: you pay the registrar, usually about $12 a year',
  'Hosting after launch without a Care Plan',
];

/** Add-ons, on any package. Must match the Lead Tool's lib/pricing.ts ADD_ONS. */
export const BUILD_ADD_ONS = [
  { name: 'Extra page', price: '$150 each' },
  { name: 'Extra form', price: '$150 each' },
  { name: 'Online booking, connected to your scheduling tool', price: '$250' },
  { name: 'Online payments or deposits', price: '$350' },
  { name: 'Blog', price: '$300' },
  { name: 'Small online store (under 50 products)', price: 'From $1,500' },
  { name: 'Linking to a client login your software already has', price: 'From $250' },
  { name: 'Extra revision round', price: '$150' },
] as const;

/**
 * The monthly Care Plan a site with logins, a store or sensitive information
 * needs — we're responsible for other people's data. Quoted per site; not a
 * Stripe product yet (Lead Tool docs/SCOPE.md §2).
 */
export const SECURE_CARE_PLAN_RANGE = '$350–$500/month';

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

/** What every package ships. Must match the Lead Tool's docs/SCOPE.md §1. */
export const WEBSITE_FEATURES = [
  'A custom site built around your business and brand',
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
