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

/** How long a build-only site stays on our hosting after launch. */
export const BUILD_ONLY_HOSTING_DAYS = 30;

/** Service-area business — no street address is published (home-based). */
export const SERVICE_AREA_CITIES = ['Phenix City, AL', 'Smiths Station, AL', 'Columbus, GA'];
export const SERVICE_AREA_LABEL = 'Phenix City and Smiths Station, AL, and Columbus, GA';

/**
 * Austin doesn't have a published business phone number yet. Leave this
 * `null` until he does — never invent one, and never wire up a `tel:` link
 * with a placeholder number. Once a real number exists, set it here
 * (E.164 format, e.g. `'+17065551234'`) and every consumer of this constant
 * (footer, LocalBusiness schema, contact copy) picks it up automatically.
 */
export const BUSINESS_PHONE: string | null = null;

/** The one inbox Austin actually checks — see audit §5 / P5 #16. */
export const CONTACT_EMAIL = 'softsystemstudioco@gmail.com';
