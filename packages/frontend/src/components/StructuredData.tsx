/**
 * Structured Data (JSON-LD) Components for SEO
 *
 * These components add rich snippets to improve search engine understanding
 * and enable enhanced search results (rich cards, knowledge panels, etc.)
 *
 * Deliberately plain <script> tags, not next/script: next/script's default
 * `afterInteractive` strategy injects the tag client-side after hydration,
 * so it never appears in the server-rendered HTML crawlers (and curl) see —
 * which defeats the entire point of JSON-LD. A plain <script> is a normal
 * host element and gets server-rendered like any other markup. This matches
 * Next.js's own documented pattern for JSON-LD.
 */

import {
  BUILD_FEE,
  START_PROJECT_URL,
  CARE_PLANS,
  CONTACT_EMAIL,
  RETAINER_MIN,
  RETAINER_MAX,
  SERVICE_AREA_CITIES,
  BUSINESS_PHONE,
} from '@/lib/business';

const SITE_URL = 'https://softsystemsstudiollc.com';
/** One `@id` for the business, so every schema on the site describes the same entity. */
const BUSINESS_ID = `${SITE_URL}/#business`;

/** The facts search engines and AI answers quote: what, where, who, how much. */
const BUSINESS_DESCRIPTION =
  'Custom websites for local businesses, designed and written by one person for a flat ' +
  `${BUILD_FEE}, with optional Care Plans for hosting and edits. Based in Smiths Station, AL, ` +
  'meeting in person around Columbus, GA, Phenix City, AL, and Auburn and Opelika, AL, and ' +
  'working with businesses anywhere by phone, email and video.';

const ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Smiths Station',
  addressRegion: 'AL',
  addressCountry: 'US',
};

const FOUNDER = { '@type': 'Person', name: 'Austin Hodges', jobTitle: 'Founder and web designer' };

const dollars = (price: string) => Number(price.replace(/[^0-9.]/g, ''));

interface FAQ {
  question: string;
  answer: string;
}

/**
 * Organization Schema - Helps Google understand your business
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Soft Systems Studio LLC',
    url: SITE_URL,
    logo: `${SITE_URL}/images/soft-systems-logo.png`,
    description: BUSINESS_DESCRIPTION,
    email: CONTACT_EMAIL,
    foundingDate: '2026',
    founder: FOUNDER,
    address: ADDRESS,
    sameAs: [
      // Add your social media profiles here
      // 'https://twitter.com/softsystems',
      // 'https://linkedin.com/company/soft-systems-studio',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: CONTACT_EMAIL,
      url: START_PROJECT_URL,
    },
  };

  return (
    <script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * LocalBusiness Schema - service-area business, no street address.
 *
 * Austin works from home; we were told explicitly not to publish a home
 * address, so `address` carries the town only and `areaServed` carries the
 * in-person cities. Phone is added automatically once BUSINESS_PHONE
 * (lib/business.ts) is set — until then this schema simply omits
 * `telephone` rather than invent one.
 */
export function LocalBusinessSchema() {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: 'Soft Systems Studio',
    legalName: 'Soft Systems Studio LLC',
    url: SITE_URL,
    image: `${SITE_URL}/images/soft-systems-logo.png`,
    description: BUSINESS_DESCRIPTION,
    email: CONTACT_EMAIL,
    founder: FOUNDER,
    address: ADDRESS,
    priceRange: `${BUILD_FEE} / ${RETAINER_MIN}-${RETAINER_MAX} per month`,
    areaServed: SERVICE_AREA_CITIES.map((city) => ({
      '@type': 'City',
      name: `${city.name}, ${city.stateCode}`,
      containedInPlace: { '@type': 'State', name: city.state },
    })),
    knowsAbout: [
      'Website design',
      'Small business websites',
      'Website copywriting',
      'Local SEO',
      'Website hosting and maintenance',
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        name: 'Custom website build',
        description: 'Designed, written and launched on your own domain. One flat fee.',
        price: dollars(BUILD_FEE),
        priceCurrency: 'USD',
        itemOffered: { '@type': 'Service', name: 'Custom website for a local business' },
      },
      ...CARE_PLANS.map((plan) => ({
        '@type': 'Offer',
        name: `Care Plan — ${plan.name}`,
        description: `Hosting plus ${plan.editHours} hours of edits a month. Optional.`,
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: dollars(plan.price),
          priceCurrency: 'USD',
          unitCode: 'MON',
        },
        itemOffered: { '@type': 'Service', name: 'Website hosting and maintenance' },
      })),
    ],
  };

  if (BUSINESS_PHONE) {
    schema.telephone = BUSINESS_PHONE;
  }

  return (
    <script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ Schema - Enables FAQ rich results in Google Search
 */
export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * WebSite Schema - basic site identity for search engines.
 *
 * No `potentialAction`/`SearchAction` here on purpose: the site has no
 * search feature, so promising Google a `/?s={search_term_string}` box
 * would just fail if anyone used it.
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Soft Systems Studio',
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
