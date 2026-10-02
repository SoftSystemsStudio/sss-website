/**
 * Trade landing pages at /for/<slug>, written to be linked from outreach
 * emails only: they're noindex and not linked from the site, because the
 * public site doesn't advertise specific business types. Each pairs with the
 * concept site for that trade, and its quote
 * links pass the business type along to the Lead Tool's sign-up page (/intake
 * redirects there), which saves it as the new lead's category.
 *
 * Keep claims inside what the Starter package ships, since that's the price
 * these pages lead with (WEBSITE_FEATURES and BUILD_PACKAGES in
 * lib/business.ts): a one-page site with a contact form — no online ordering
 * or checkout.
 */
export interface TradeNeed {
  title: string;
  body: string;
}

export interface Trade {
  slug: string;
  /** "lawn care companies" — used in "Websites for …" */
  audience: string;
  /** Second line of the headline, set in italics */
  promise: string;
  intro: string;
  needs: TradeNeed[];
  conceptSlug: string;
  businessType: string;
}

export const TRADES: Trade[] = [
  {
    slug: 'lawn-care',
    audience: 'lawn care companies',
    promise: 'Your yards look great. Your website should too.',
    intro:
      'Homeowners pick a lawn company by the yards they’ve seen. I build one-page sites that put your finished work first and make asking for a quote easy.',
    needs: [
      {
        title: 'Show the work',
        body: 'Finished yards and before-and-afters up front, because that’s what people judge you on.',
      },
      {
        title: 'Get the quote request',
        body: 'A short form that asks for the address and what they need, so you can price the job without phone tag.',
      },
      {
        title: 'Follow the seasons',
        body: 'Spring cleanups, weekly mowing, leaf season: your services, laid out the way customers think about their yard.',
      },
    ],
    conceptSlug: 'green-bench',
    businessType: 'Landscaping',
  },
  {
    slug: 'coffee-shops',
    audience: 'coffee shops',
    promise: 'Sell the room before they walk in.',
    intro:
      'People find a coffee shop on their phone on the way somewhere. Your site has about ten seconds to show the room, the menu and whether you’re open.',
    needs: [
      {
        title: 'Show the room',
        body: 'Photography that sells the atmosphere, because that’s the reason people choose you over the drive-through.',
      },
      {
        title: 'A menu people can read',
        body: 'Real text, not a blurry photo of the chalkboard, laid out so it’s easy to change when the menu does.',
      },
      {
        title: 'Hours and directions, one tap',
        body: 'Open-or-closed on the first screen, with directions and tap-to-call a thumb away.',
      },
    ],
    conceptSlug: 'kettle-and-grain',
    businessType: 'Coffee / Food Service',
  },
  {
    slug: 'florists',
    audience: 'florists',
    promise: 'As beautiful as what you make.',
    intro:
      'Most flower orders start on a phone, often the same day, from someone who has never ordered from you. Your site should look like your arrangements and make ordering for a birthday or a funeral easy.',
    needs: [
      {
        title: 'Let the flowers lead',
        body: 'Your own arrangements, shot and laid out like they deserve, instead of a wire-service catalog template.',
      },
      {
        title: 'Organized by occasion',
        body: 'Birthdays, sympathy, weddings: people arrive with an occasion in mind, so the page starts there.',
      },
      {
        title: 'Same-day, made clear',
        body: 'Your order cutoff, delivery area and phone number where people look first, so the call comes to you.',
      },
    ],
    conceptSlug: 'mayhaw',
    businessType: 'Florist',
  },
];

export function getTrade(slug: string): Trade | undefined {
  return TRADES.find((t) => t.slug === slug);
}

export function quoteHref(trade: Trade): string {
  return `/intake?type=${encodeURIComponent(trade.businessType)}`;
}
