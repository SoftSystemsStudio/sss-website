import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar, Footer, Section, Button } from '@/components/ui';
import QuoteCta from '@/components/QuoteCta';
import {
  ADD_ONS_FROM,
  BUILD_ADD_ONS,
  BUILD_FROM,
  BUILD_ONLY_HOSTING_DAYS,
  BUILD_PACKAGES,
  BUILD_REVISION_ROUNDS,
  CARE_PLANS,
  DEPOSIT_THRESHOLD,
  NOT_IN_ANY_PACKAGE,
  PACKAGE_COMPARISON,
  SECURE_CARE_PLAN_RANGE,
  WEBSITE_FEATURES,
  getPackage,
  priceLabel,
} from '@/lib/business';

const BUSINESS = getPackage('business');
const GROWTH = getPackage('growth');
const CUSTOM = getPackage('custom');

const TITLE = 'Website pricing';
const DESCRIPTION = `Website packages for local businesses: one page for ${BUILD_FROM}, up to 5 pages for ${BUSINESS.price}, up to 12 pages with booking, payments or a blog for ${GROWTH.price}, and sites with logins quoted from ${CUSTOM.price}. Exactly what each one includes.`;
const OG_IMAGE = `/api/og?title=${encodeURIComponent('Pay for the site you need.')}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const EYEBROW =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]';
const SECTION_TITLE =
  'font-serif text-[48px] leading-[0.98] tracking-[-0.015em] sm:text-[64px] lg:text-[76px]';

/** The ground rules every quote follows. Must match the Lead Tool's docs/SCOPE.md §1. */
const SCOPE_RULES = [
  {
    title: 'What counts as a page',
    body: 'One page in your site’s menu, like Home, About, a service, Gallery or Contact. Legal pages such as a privacy policy don’t count toward your total; you provide or approve their wording.',
  },
  {
    title: 'Revisions',
    body: `${BUILD_REVISION_ROUNDS} rounds before launch. A round is one list of everything you’d like changed; I make the changes and send the site back. Extra rounds are ${ADD_ONS_FROM} each.`,
  },
  {
    title: 'The words',
    body: 'I write every page from your questionnaire and our call. You review and approve it; you don’t have to write it.',
  },
  {
    title: 'Photos',
    body: 'Yours if you have them. If not, licensed stock photos, credited in the footer, until you send your own.',
  },
  {
    title: 'Your launch date',
    body: 'Agreed on our call, in writing, before you pay. Bigger packages take longer, so the date comes from your scope rather than a generic promise.',
  },
  {
    title: 'Paying',
    body: `Builds up to ${DEPOSIT_THRESHOLD} are paid in full before work starts. Above that, it’s half to start and half at launch. Payments go through Stripe.`,
  },
  {
    title: 'Your domain',
    body: 'You register it in your own name, so you own it. I connect it to your site and walk you through the setup.',
  },
  {
    title: 'Anything else',
    body: 'If it isn’t in your package or an add-on, it’s quoted before any work starts. Never a surprise on the invoice.',
  },
];

const QUOTE_STEPS = [
  {
    title: 'Tell me about the business',
    body: 'A one-minute form. I email you a private link to the questionnaire.',
  },
  {
    title: 'Answer the questionnaire',
    body: 'The size of the site, the features, the look. It saves as you go, so you can come back to it.',
  },
  {
    title: 'Get a written quote',
    body: 'The package, any add-ons, the total and a launch date. Nothing starts until you’ve paid the first payment.',
  },
];

export default function PricingPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        {/* Intro */}
        <Section className="pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
          <p className={`rise ${EYEBROW}`}>Pricing</p>
          <h1 className="rise mt-5 font-serif text-[56px] leading-[0.92] tracking-[-0.015em] [--rise-delay:0.1s] sm:mt-8 sm:text-[80px] lg:text-[108px]">
            Pay for the site <br className="hidden sm:inline" />
            <em>you need.</em>
          </h1>
          <p className="rise mt-8 max-w-3xl text-lg leading-relaxed text-ink-soft [--rise-delay:0.25s] sm:text-[21px]">
            Four packages, priced by how much the site has to do. Every price is on this page, and
            your written quote lists exactly what’s included before you pay anything.
          </p>
          <div className="rise mt-8 flex flex-col gap-4 [--rise-delay:0.35s] sm:flex-row sm:items-center sm:gap-8">
            <Button as="link" href="/intake" variant="primary" size="lg">
              Get a quote
              <span className="nudge ml-2" aria-hidden="true">
                →
              </span>
            </Button>
            <Link href="#compare" className="link-underline self-start font-semibold sm:self-auto">
              Compare the packages
            </Link>
          </div>
        </Section>

        {/* At a glance */}
        <Section
          id="compare"
          className="scroll-mt-16 border-t border-line-soft py-20 lg:scroll-mt-[88px] lg:py-[120px]"
        >
          <h2 className={`reveal ${SECTION_TITLE}`}>At a glance</h2>
          <p className="reveal mt-4 text-[15px] text-ink-muted lg:hidden">
            Swipe the table to see all four packages.
          </p>
          <div className="reveal mt-8 overflow-x-auto lg:mt-14">
            <table className="w-full min-w-[720px] border-collapse text-left text-[17px]">
              <caption className="sr-only">The four website packages side by side</caption>
              <thead>
                <tr className="border-b border-ink">
                  <td className="w-[28%] py-4 pr-4" />
                  {BUILD_PACKAGES.map((pkg) => (
                    <th key={pkg.id} scope="col" className="py-4 pr-4 align-bottom">
                      <a href={`#${pkg.id}`} className="text-lg font-semibold hover:underline">
                        {pkg.name}
                      </a>
                      <span className="mt-1 block font-serif text-[32px] font-normal leading-none">
                        {priceLabel(pkg)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PACKAGE_COMPARISON.map((row) => (
                  <tr key={row.label} className="border-b border-line">
                    <th scope="row" className="py-3.5 pr-4 font-normal text-ink-soft">
                      {row.label}
                    </th>
                    {BUILD_PACKAGES.map((pkg) => (
                      <td
                        key={pkg.id}
                        className={`py-3.5 pr-4 ${row.values[pkg.id] === 'No' ? 'text-ink-muted' : ''}`}
                      >
                        {row.values[pkg.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* In every package */}
        <Section
          className="bg-limestone py-20 lg:py-[120px]"
          innerClassName="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-24"
        >
          <div className="reveal">
            <p className={EYEBROW}>In every package</p>
            <h2 className={`mt-5 ${SECTION_TITLE}`}>The essentials, done properly.</h2>
          </div>
          <ul className="reveal self-end border-t border-ink">
            {WEBSITE_FEATURES.map((feature) => (
              <li key={feature} className="border-b border-line py-3.5 text-[17px]">
                {feature}
              </li>
            ))}
          </ul>
        </Section>

        {/* Each package */}
        <Section className="py-20 lg:py-[120px]">
          <h2 className={`reveal ${SECTION_TITLE}`}>What each package includes</h2>
          <div className="mt-12 lg:mt-14">
            {BUILD_PACKAGES.map((pkg) => (
              <article
                key={pkg.id}
                id={pkg.id}
                className="reveal grid scroll-mt-16 gap-8 border-t border-ink py-10 lg:scroll-mt-[88px] lg:grid-cols-[4fr_8fr] lg:gap-16 lg:py-14"
              >
                <div>
                  <h3 className="font-serif text-[48px] leading-none tracking-[-0.015em] sm:text-[56px]">
                    {pkg.name}
                  </h3>
                  <p className="mt-4 font-serif text-[40px] leading-none">
                    {pkg.quoted && (
                      <span className="mr-2 font-sans text-[15px] text-ink-muted">From</span>
                    )}
                    {pkg.price}
                  </p>
                  <p className="mt-4 text-[17px] font-medium">{pkg.summary}</p>
                  <p className="mt-1 text-[15px] text-ink-muted">{pkg.payment}</p>
                </div>
                <div>
                  <p className="text-lg leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">Best for: </span>
                    {pkg.bestFor}
                  </p>
                  <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
                    <div>
                      <h4 className={EYEBROW}>What you get</h4>
                      <ul className="mt-3 border-t border-line">
                        {pkg.includes.map((item) => (
                          <li key={item} className="border-b border-line py-3 text-[17px]">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className={EYEBROW}>Not included</h4>
                      <ul className="mt-3 border-t border-line">
                        {pkg.notIncluded.map((item) => (
                          <li
                            key={item}
                            className="border-b border-line py-3 text-[17px] text-ink-soft"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {pkg.id === 'custom' && (
                    <p className="mt-8 text-[17px] leading-relaxed text-ink-soft">
                      <span className="font-semibold text-ink">
                        Already have software with a client login?{' '}
                      </span>
                      Booking, practice-management and field-service tools often include one.
                      Linking your site to it is an add-on, not a Custom build.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* Add-ons and not included */}
        <Section
          className="bg-limestone py-20 lg:py-[120px]"
          innerClassName="grid gap-20 lg:grid-cols-2 lg:gap-28"
        >
          <div className="reveal">
            <p className={EYEBROW}>On any package</p>
            <h2 className={`mt-5 ${SECTION_TITLE}`}>Add-ons</h2>
            <ul className="mt-9 border-t border-ink">
              {BUILD_ADD_ONS.map((addOn) => (
                <li
                  key={addOn.name}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-3.5 text-[17px]"
                >
                  <span>{addOn.name}</span>
                  <span className="shrink-0 font-semibold">{addOn.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-muted">
              A store, or anything that collects sensitive information, also needs a Care Plan (see
              below).
            </p>
          </div>
          <div className="reveal">
            <p className={EYEBROW}>In no package</p>
            <h2 className={`mt-5 ${SECTION_TITLE}`}>Not included</h2>
            <ul className="mt-9 border-t border-ink">
              {NOT_IN_ANY_PACKAGE.map((item) => (
                <li key={item} className="border-b border-line py-3.5 text-[17px]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Ground rules */}
        <Section className="py-20 lg:py-[120px]">
          <h2 className={`reveal ${SECTION_TITLE}`}>How the scope works</h2>
          <dl className="mt-12 grid gap-x-14 gap-y-10 md:grid-cols-2 lg:mt-14">
            {SCOPE_RULES.map((rule) => (
              <div key={rule.title} className="reveal border-t border-ink pt-6">
                <dt className="text-[21px] font-semibold">{rule.title}</dt>
                <dd className="mt-2.5 text-[17px] leading-relaxed text-ink-soft">{rule.body}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Care Plans */}
        <Section
          id="care-plans"
          className="scroll-mt-16 border-t border-line-soft py-20 lg:scroll-mt-[88px] lg:py-[120px]"
          innerClassName="grid gap-12 lg:grid-cols-2 lg:gap-28"
        >
          <div className="reveal">
            <p className={EYEBROW}>After launch</p>
            <h2 className={`mt-5 ${SECTION_TITLE}`}>Care Plans</h2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink-soft sm:text-lg">
              Optional for most sites. Every plan includes hosting and uptime monitoring, content
              and text updates, photo swaps, small design tweaks and email support; the difference
              is how many hours of edits you get each month.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-soft sm:text-lg">
              <span className="font-semibold text-ink">
                Sites with logins, a store or sensitive information need one.{' '}
              </span>
              They make me responsible for other people’s data, so the plan covers security, backups
              and user support too. It’s quoted with the build, usually {SECURE_CARE_PLAN_RANGE}.
            </p>
          </div>
          <div className="reveal">
            <ul className="border-y border-ink">
              {CARE_PLANS.map((plan, index) => (
                <li
                  key={plan.name}
                  className={`grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-5 sm:grid-cols-[150px_1fr_auto] ${index > 0 ? 'border-t border-line' : ''}`}
                >
                  <span className="text-lg font-semibold">{plan.name}</span>
                  <span className="order-last col-span-2 text-[17px] text-ink-soft sm:order-none sm:col-span-1">
                    {plan.editHours} hours of edits a month
                  </span>
                  <span className="font-serif text-[40px] leading-none">
                    {plan.price}
                    <span className="font-sans text-[15px] text-ink-muted">/mo</span>
                  </span>
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-2 text-[15px] leading-relaxed text-ink-muted">
              <li>
                Unused hours don’t roll over. Work beyond your hours is quoted before it starts.
              </li>
              <li>Billed monthly in advance. Cancel anytime; no refunds for part of a month.</li>
              <li>
                No plan? You get your finished site files, and your site stays on my hosting for{' '}
                {BUILD_ONLY_HOSTING_DAYS} days after launch while you move it.
              </li>
            </ul>
          </div>
        </Section>

        {/* Getting a quote */}
        <Section className="bg-limestone py-20 lg:py-[120px]">
          <h2 className={`reveal ${SECTION_TITLE}`}>Getting a quote</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 lg:mt-14 lg:gap-14">
            {QUOTE_STEPS.map((step, index) => (
              <li key={step.title} className="reveal border-t border-ink pt-6">
                <span
                  className="block font-serif text-[64px] italic leading-none"
                  aria-hidden="true"
                >
                  {index + 1}.
                </span>
                <h3 className="mt-5 text-[21px] font-semibold">{step.title}</h3>
                <p className="mt-2.5 text-[17px] leading-relaxed text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <QuoteCta />
      </main>

      <Footer />
    </>
  );
}
