import Image from 'next/image';
import Link from 'next/link';
import { Navbar, Footer, Section, Button } from '@/components/ui';
import Faq from '@/components/Faq';
import QuoteCta from '@/components/QuoteCta';
import ShowcaseParallax from '@/components/ShowcaseParallax';
import ConceptCard from '@/components/ConceptCard';
import { PhoneFrame } from '@/components/DeviceFrames';
import { CONCEPTS } from '@/lib/concepts';
import {
  OrganizationSchema,
  LocalBusinessSchema,
  FAQSchema,
  WebSiteSchema,
} from '@/components/StructuredData';
import {
  BUILD_FEE,
  BUILD_ONLY_HOSTING_DAYS,
  BUILD_REVISION_ROUNDS,
  CARE_PLANS,
  CONTACT_EMAIL,
  HOME_BASE,
  RETAINER_RANGE,
  SERVICE_AREA_LABEL,
  WEBSITE_FEATURES,
} from '@/lib/business';

const STEPS = [
  {
    title: 'Tell me about your business',
    body: 'A five-minute form, then a short call. You get a launch date before you commit to anything.',
  },
  {
    title: 'I design, write and build it',
    body: 'You don’t have to write a word. I draft everything, and you approve it.',
  },
  {
    title: 'Review, refine, launch',
    body: `${BUILD_REVISION_ROUNDS} rounds of changes, then your site goes live on your own domain.`,
  },
];

const FAQS = [
  {
    question: 'How long does a website build take?',
    answer:
      "It depends on scope, so I'll give you a specific date during your intake call — before you commit to anything, not after.",
  },
  {
    question: 'Do you use AI to build websites?',
    answer:
      "Yes — I use AI tools to move faster, but every site is personally designed and reviewed by me before it ships. It's just me; there's no team of designers behind the scenes.",
  },
  {
    question: 'What’s included in revisions?',
    answer: `The build includes ${BUILD_REVISION_ROUNDS} rounds of revisions before launch. A round is one list of everything you’d like changed — I make the changes and send the updated site back to you.`,
  },
  {
    question: 'What if I need changes after launch?',
    answer: `That’s what the Care Plans (${RETAINER_RANGE}) are for: hosting plus 2, 3 or 4 hours of edits a month, depending on the plan. Unused hours don’t roll over. Without a plan, changes are quoted before any work starts.`,
  },
  {
    question: 'Who owns the domain?',
    answer:
      'You do. You register it in your own name (usually about $12 a year), and I connect it to your site and walk you through the setup.',
  },
  {
    question: 'Can I see examples of your work?',
    answer:
      "The concept sites above are my work: sites I designed and built for invented businesses, each clearly labeled as a concept. Soft Systems Studio is new, so there aren't client sites to show yet.",
  },
  {
    question: 'Do you offer hosting?',
    answer: `Hosting is included with every Care Plan (${RETAINER_RANGE}). Without one, I hand over your finished site files and help point your domain wherever you choose to host it. Your site stays live on my hosting for ${BUILD_ONLY_HOSTING_DAYS} days after launch while you move it.`,
  },
  {
    question: 'Where are you located, and who do you work with?',
    answer: `Based near ${HOME_BASE}. I work with local businesses anywhere — everything runs by phone, email and video call. If you're around ${SERVICE_AREA_LABEL}, we can also meet in person.`,
  },
];

const EYEBROW =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]';
const SECTION_TITLE =
  'font-serif text-[48px] leading-[0.98] tracking-[-0.015em] sm:text-[64px] lg:text-[76px]';

/** The hero stage: the three concept sites on a laptop-width browser and two phones. */
function Showcase() {
  return (
    <ShowcaseParallax className="rise relative mt-10 h-[360px] overflow-hidden rounded-md bg-limestone [--rise-delay:0.45s] sm:h-[460px] lg:mt-14 lg:h-[580px]">
      <p className="absolute left-4 top-4 z-30 rounded-full bg-paper px-3.5 py-2 text-[13px] font-medium text-ink-soft sm:left-6 sm:top-6">
        Concept sites
        <span className="hidden sm:inline"> · the businesses are invented, the design is real</span>
      </p>

      {/* Phone-sized screens: one phone, centred */}
      <div className="rise absolute left-1/2 top-[72px] z-20 w-[200px] -translate-x-1/2 [--rise-delay:0.65s] md:hidden">
        <PhoneFrame
          src="/images/work/ironwood-auto-mobile.jpg"
          alt="The Ironwood Auto & Tire concept site on a phone"
          eager
        />
      </div>

      {/* Tablet and up: the browser, plus phones either side */}
      <div className="rise absolute left-[4%] top-[76px] z-10 hidden w-[70%] [--rise-delay:0.6s] md:block lg:left-1/2 lg:w-[64%] lg:-translate-x-1/2">
        <div className="parallax overflow-hidden rounded-[10px] bg-white shadow-[0_40px_80px_-30px_rgba(23,49,43,0.4)] [--depth:-8]">
          <div
            className="flex h-9 items-center gap-[7px] border-b border-[#E3E5DE] px-3.5"
            aria-hidden="true"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#CDD1C7]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#CDD1C7]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#CDD1C7]" />
            <span className="mx-auto hidden h-[22px] w-1/2 items-center justify-center rounded-md bg-[#F1F2EC] text-xs text-ink-muted lg:flex">
              Ironwood Auto &amp; Tire
            </span>
          </div>
          <div className="relative aspect-[1440/900]">
            <Image
              src="/images/work/ironwood-auto-desktop.jpg"
              alt="The Ironwood Auto & Tire concept site on a laptop"
              fill
              sizes="(min-width: 1440px) 820px, (min-width: 1024px) 64vw, 70vw"
              className="object-cover object-top"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
      <div className="rise absolute left-[6.25%] top-[150px] z-20 hidden w-[17%] max-w-[220px] [--rise-delay:0.75s] lg:block">
        <PhoneFrame
          src="/images/work/kettle-and-grain-mobile.jpg"
          alt="The Kettle & Grain Coffee concept site on a phone"
        />
      </div>
      <div className="rise absolute right-[4%] top-[110px] z-20 hidden w-[24%] max-w-[220px] [--rise-delay:0.85s] md:block lg:right-[6.25%] lg:w-[17%]">
        <PhoneFrame
          src="/images/work/green-bench-mobile.jpg"
          alt="The Green Bench Lawn & Landscape concept site on a phone"
          depth={22}
        />
      </div>
    </ShowcaseParallax>
  );
}

export default function Home() {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema />
      <WebSiteSchema />
      <FAQSchema faqs={FAQS} />

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <Section className="pb-10 pt-8 sm:pt-12 lg:pt-14">
          <p className={`rise ${EYEBROW}`}>
            <span className="hidden sm:inline">Websites for local businesses · </span>Based in
            Phenix City, AL
          </p>
          <h1 className="rise mt-5 font-serif text-[56px] leading-[0.92] tracking-[-0.015em] sm:mt-8 sm:text-[72px] md:text-[88px] lg:text-[108px] xl:text-[132px] [--rise-delay:0.1s]">
            You built the business. <br className="hidden sm:inline" />
            <em>
              I’ll build the <span className="marker marker-draw">website.</span>
            </em>
          </h1>
          <div className="rise mt-6 flex flex-col gap-6 [--rise-delay:0.3s] lg:mt-10 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[600px] text-[17px] leading-[1.55] text-ink-soft sm:text-[21px]">
              Custom websites for local businesses anywhere, designed and written by me, Austin, for
              one flat price of {BUILD_FEE}.
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-8">
              <Button
                as="link"
                href="/intake"
                variant="primary"
                size="lg"
                className="max-sm:h-[54px] max-sm:px-0"
              >
                Get a quote
              </Button>
              <Link
                href="#portfolio"
                className="inline-flex h-[54px] items-center justify-center rounded border-[1.5px] border-ink font-semibold text-ink sm:order-first sm:h-auto sm:border-0 sm:text-[17px] sm:underline sm:underline-offset-[6px] sm:hover:text-ink-soft"
              >
                See the work
              </Link>
            </div>
          </div>
          <Showcase />
        </Section>

        {/* Where */}
        <Section>
          <p className="reveal border-y border-line py-7 text-center font-serif text-2xl italic leading-snug tracking-[-0.01em] sm:py-10 sm:text-[30px] lg:text-[34px]">
            Based in {HOME_BASE}. Working with local businesses from the next street over to the
            next state over.
          </p>
        </Section>

        {/* Work */}
        <Section id="portfolio" className="scroll-mt-16 py-20 lg:scroll-mt-[88px] lg:py-[120px]">
          <div className="reveal grid gap-6 lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-[72px]">
            <h2 className={SECTION_TITLE}>
              Concept work. <em className="text-ink-muted">Invented businesses, real design.</em>
            </h2>
            <p className="text-[17px] leading-relaxed text-ink-soft sm:text-lg">
              I built these to show range before I had client sites to show. Each one is designed
              around how its customers actually decide, and each is labeled as a concept.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:mt-20 lg:gap-8">
            {CONCEPTS.map((concept) => (
              <ConceptCard key={concept.slug} concept={concept} className="reveal" />
            ))}
          </div>
        </Section>

        {/* Pricing */}
        <Section
          id="pricing"
          className="scroll-mt-16 bg-limestone py-20 lg:scroll-mt-[88px] lg:py-[120px]"
          innerClassName="grid gap-20 lg:grid-cols-2 lg:gap-28"
        >
          <h2 className="sr-only">Pricing</h2>
          <div className="reveal">
            <p className={EYEBROW}>The build</p>
            <p className="mt-5 font-serif text-[128px] leading-[0.82] tracking-[-0.03em] sm:text-[200px]">
              {BUILD_FEE}
              <em className="text-[44px] tracking-normal text-ink-muted sm:text-[64px]">, once.</em>
            </p>
            <p className="mt-7 font-serif text-[26px] leading-tight sm:text-[30px]">
              One flat price. No packages, no tiers, no surprises on the invoice.
            </p>
            <ul className="mt-9 border-t border-line">
              {WEBSITE_FEATURES.map((feature) => (
                <li key={feature} className="border-b border-line py-3.5 text-[17px]">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal">
            <p className={EYEBROW}>After launch</p>
            <h3 className={`mt-5 ${SECTION_TITLE}`}>Care Plans</h3>
            <p className="mt-6 text-[17px] leading-relaxed text-ink-soft sm:text-lg">
              Hosting, updates and a person who answers your email. Every plan has the same
              services; the difference is how many hours of edits you get each month.
            </p>
            <ul className="mt-9 border-y border-ink">
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
            <p className="mt-6 text-[15px] leading-relaxed text-ink-muted">
              Every plan includes hosting and uptime monitoring, content and text updates, small
              design tweaks and email support. Optional. Cancel anytime. Unused hours don’t roll
              over.
            </p>
          </div>
        </Section>

        {/* Process */}
        <Section id="process" className="scroll-mt-16 py-20 lg:scroll-mt-[88px] lg:py-[120px]">
          <h2 className={`reveal ${SECTION_TITLE}`}>How it goes</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 lg:mt-14 lg:gap-14">
            {STEPS.map((step, index) => (
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

        {/* Who */}
        <Section
          id="about"
          className="scroll-mt-16 border-t border-line-soft py-20 lg:scroll-mt-[88px] lg:py-[120px]"
          innerClassName="grid gap-12 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-24"
        >
          <div className="reveal">
            <p className={EYEBROW}>Who you’ll work with</p>
            <h2 className="mt-5 font-serif text-[64px] leading-[0.95] tracking-[-0.015em] sm:text-[96px]">
              Hi, I’m <em>Austin.</em>
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-ink-soft sm:text-[21px]">
              Soft Systems Studio is one person: me. I’m based near {HOME_BASE} and build websites
              for local businesses anywhere. We work by phone, email and video, so it doesn’t matter
              how far away you are.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-[21px]">
              It’s a new studio, so I charge for the work itself, not for a reputation I haven’t
              built yet. You deal with the person designing your site from the first call to launch
              day. I use AI tools to work quickly, and I check every page myself.
            </p>
            <p className="mt-8 font-serif text-[26px] italic text-ink-soft">— Austin Hodges</p>
          </div>
          <div className="reveal rounded-md bg-limestone p-7 sm:p-10">
            <dl>
              {[
                ['Based', `Near ${HOME_BASE}`],
                ['Works with', 'Local businesses anywhere, by phone, email and video'],
                ['In person', `Around ${SERVICE_AREA_LABEL}`],
                ['You talk to', 'Austin, from the first call to launch day'],
                ['Replies', 'Within 24 hours'],
              ].map(([term, detail]) => (
                <div key={term} className="border-b border-line py-4 first:pt-0">
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    {term}
                  </dt>
                  <dd className="mt-1 text-[17px]">{detail}</dd>
                </div>
              ))}
              <div className="pt-4">
                <dt className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Email
                </dt>
                <dd className="mt-1 text-[17px]">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline break-all">
                    {CONTACT_EMAIL}
                  </a>
                </dd>
              </div>
            </dl>
            <Link href="/about" className="link-underline mt-8 inline-block font-semibold">
              More about the studio{' '}
              <span className="nudge" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </Section>

        {/* FAQ */}
        <Section
          id="faq"
          className="scroll-mt-16 pb-24 lg:scroll-mt-[88px] lg:pb-[120px]"
          innerClassName="grid gap-10 lg:grid-cols-[4fr_8fr] lg:gap-16"
        >
          <div className="reveal">
            <h2 className={SECTION_TITLE}>Questions</h2>
            <p className="mt-5 max-w-xs text-[17px] leading-relaxed text-ink-soft">
              Something not covered here? Ask it in the quote form or by email.
            </p>
          </div>
          <div className="reveal">
            <Faq faqs={FAQS} />
          </div>
        </Section>

        <QuoteCta />
      </main>

      <Footer />
    </>
  );
}
