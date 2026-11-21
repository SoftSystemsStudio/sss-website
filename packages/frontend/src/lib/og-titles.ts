import { TRADES, type Trade } from './trades';
import { CITY_PAGES, type CityPage } from './cities';

/**
 * Titles the branded share card (/api/og) will draw (security audit 2026-11-18).
 *
 * The card used to render whatever ?title= said, so anyone could mint a
 * "Soft Systems Studio" image saying anything, and burn compute doing it. Now
 * it draws only titles this site itself links to; any other title gets the
 * default card. Every page that sets an OG image builds its title with one of
 * the helpers below, so a page and the allowlist can't drift apart.
 */

/** Fixed card titles for single pages. */
export const OG_TITLES = {
  about: 'About Austin',
  pricing: 'What a website costs.',
  blog: 'Notes for local business owners',
  shop: 'Templates and checklists',
} as const;

/** Longer than any real title; anything past this is rejected before the lookup. */
export const OG_TITLE_MAX = 120;

export function tradeOgTitle(trade: Pick<Trade, 'audience'>): string {
  return `Websites for ${trade.audience}.`;
}

export function cityOgTitle(city: Pick<CityPage, 'name'>): string {
  return `Web design in ${city.name}`;
}

/** Site-relative card URL for a title. Pass a title built by this module. */
export function ogImage(title: string): string {
  return `/api/og?title=${encodeURIComponent(title)}`;
}

/** Every title the card will draw: the fixed ones, trade and town pages, and blog posts. */
export function knownOgTitles(postTitles: readonly string[]): Set<string> {
  return new Set([
    ...Object.values(OG_TITLES),
    ...TRADES.map(tradeOgTitle),
    ...CITY_PAGES.map(cityOgTitle),
    ...postTitles,
  ]);
}

/**
 * The title to draw for a ?title= value, or null for the default card. Only an
 * exact match with a known title passes; length is checked first so a huge
 * value never reaches the lookup.
 */
export function resolveOgTitle(raw: string | null, known: ReadonlySet<string>): string | null {
  if (raw === null || raw.length === 0 || raw.length > OG_TITLE_MAX) return null;
  return known.has(raw) ? raw : null;
}
