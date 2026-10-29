import type { Metadata } from 'next';
import Image from 'next/image';
import { Navbar, Footer, Section, Button } from '@/components/ui';
import {
  BUSINESS_PHONE,
  CONTACT_EMAIL,
  FACEBOOK_URL,
  HOME_BASE,
  SERVICE_AREA_LABEL,
  START_PROJECT_URL,
} from '@/lib/business';

/**
 * Where the QR code on Austin's business card lands (2026-10-29; the card
 * files are in sss-mockups/brand/cards/). Built for a phone that has just
 * scanned it: who Austin is, one tap to save his contact (the .vcf next to
 * this page), and the ways on into the site. The card is printed, so keep
 * this URL working; change what the page says, never where it lives.
 */
export const metadata: Metadata = {
  title: 'Austin Hodges',
  description: `Austin Hodges, founder of Soft Systems Studio. I design, write and build websites for local businesses from ${HOME_BASE}.`,
  alternates: { canonical: '/hi' },
  // For people holding the card, not for search: like the /for pages, it
  // stays out of results and the sitemap.
  robots: { index: false, follow: true },
};

const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-on-ink sm:text-[13px]';

const VCARD = '/hi/austin-hodges.vcf';

export default function HiPage() {
  const links = [
    { label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    ...(BUSINESS_PHONE
      ? [{ label: 'Phone', value: BUSINESS_PHONE, href: `tel:${BUSINESS_PHONE}` }]
      : []),
    { label: 'Website', value: 'softsystemsstudiollc.com', href: '/' },
    {
      label: 'Start a project',
      value: 'A minute to start. I reply within 24 hours.',
      href: START_PROJECT_URL,
    },
    { label: 'Facebook', value: 'Soft Systems Studio', href: FACEBOOK_URL },
  ];

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Section className="surface-ink bg-ink pb-16 pt-12 text-paper sm:pt-16 lg:pb-24 lg:pt-20">
          <Image
            src="/images/brand/logo-mark-reversed.svg"
            alt=""
            width={72}
            height={72}
            className="rise h-16 w-16 sm:h-20 sm:w-20"
          />
          <p className={`rise mt-8 [--rise-delay:0.05s] ${EYEBROW}`}>Soft Systems Studio</p>
          <h1 className="rise mt-4 font-serif text-[56px] [--rise-delay:0.1s] leading-[0.92] tracking-[-0.015em] sm:text-[80px] lg:text-[108px]">
            Austin Hodges
          </h1>
          <p className="rise mt-6 max-w-2xl text-lg leading-relaxed text-on-ink [--rise-delay:0.2s] sm:text-[21px]">
            Founder. I design, write and build websites for local businesses from {HOME_BASE}, and
            meet clients in person around {SERVICE_AREA_LABEL}.
          </p>
          <div className="rise mt-10 flex flex-col gap-4 [--rise-delay:0.3s] sm:flex-row sm:items-center sm:gap-6">
            <Button as="anchor" href={VCARD} variant="accent" size="lg">
              Save my contact
            </Button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="link-underline self-start text-base text-on-ink hover:text-paper sm:self-auto"
            >
              or email {CONTACT_EMAIL}
            </a>
          </div>
        </Section>

        <Section className="py-12 sm:py-16">
          <ul className="divide-y divide-line-soft border-y border-line-soft">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]">
                    {link.label}
                  </span>
                  <span className="text-lg [overflow-wrap:anywhere] text-ink group-hover:text-ink-soft sm:text-xl">
                    {link.value}
                    <span className="nudge ml-2" aria-hidden="true">
                      →
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <Footer />
    </>
  );
}
