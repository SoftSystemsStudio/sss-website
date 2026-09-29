import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar, Footer, Section } from '@/components/ui';
import QuoteCta from '@/components/QuoteCta';
import { BUILD_FEE, CARE_PLANS, HOME_BASE, RETAINER_MIN } from '@/lib/business';

export const metadata: Metadata = {
  title: 'About',
  description: `A new studio, one person, honest pricing. Why Soft Systems Studio charges ${BUILD_FEE} for a website build instead of $3,000+.`,
  alternates: { canonical: '/about' },
};

const EYEBROW =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]';

const CARE_PLAN_PRICES = CARE_PLANS.map((plan) => plan.price);

const HOW_I_WORK = [
  {
    title: 'You deal with me',
    body: 'No account managers and no handoffs. The person on your first call is the person building your site.',
  },
  {
    title: 'I write the words',
    body: 'You don’t have to supply copy. I draft every page from what you tell me, and you approve it.',
  },
  {
    title: 'AI helps, I check',
    body: 'I use AI tools to work quickly, and every page is designed and reviewed by me before it ships.',
  },
  {
    title: 'The price list is the whole list',
    body: `A ${BUILD_FEE} flat build fee, and Care Plans at ${CARE_PLAN_PRICES.slice(0, -1).join(', ')} or ${CARE_PLAN_PRICES[CARE_PLAN_PRICES.length - 1]} a month. That’s everything.`,
  },
];

export default function AboutPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Section className="pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
          <p className={`rise ${EYEBROW}`}>About the studio</p>
          <h1 className="rise mt-5 font-serif text-[56px] [--rise-delay:0.1s] leading-[0.92] tracking-[-0.015em] sm:mt-8 sm:text-[80px] lg:text-[108px]">
            A new studio. <br className="hidden sm:inline" />
            <em>Honest pricing.</em>
          </h1>
          <p className="rise mt-8 max-w-3xl text-lg leading-relaxed text-ink-soft [--rise-delay:0.25s] sm:text-[21px]">
            I’m Austin Hodges. I started Soft Systems Studio in 2026 to build websites for local
            businesses. I’m based near {HOME_BASE} and work with businesses anywhere. It’s just me:
            I design, write, build and support every site myself.
          </p>
        </Section>

        <Section
          className="border-t border-line-soft py-20 lg:py-[120px]"
          innerClassName="grid gap-8 lg:grid-cols-[4fr_8fr] lg:gap-16"
        >
          <h2 className={`reveal ${EYEBROW} lg:pt-3`}>Why it’s {BUILD_FEE}</h2>
          <div className="reveal">
            <p className="font-serif text-[30px] leading-[1.2] tracking-[-0.01em] sm:text-[40px]">
              I charge for the work itself, not for a reputation I haven’t built yet.
            </p>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                I don’t have a roster of clients yet. What I have is a handful of concept sites I
                built to show what I can do, and a price that reflects exactly that: a new studio
                building its first portfolio, not an established shop with ten years of case
                studies.
              </p>
              <p>
                An established studio with a client list can charge $3,000 or more, because they’re
                selling their track record as well as a website. I don’t have one of those yet, so
                the price covers the work, and I do the work myself.
              </p>
              <p>
                AI tools are what make that math work. They let one person build what used to take a
                small team, which is how a solo studio can charge {BUILD_FEE} and still do the job
                properly.
              </p>
            </div>
            <p className="mt-10 font-serif text-[26px] italic text-ink-soft">
              No invented history. No fake case studies. Just the work.
            </p>
          </div>
        </Section>

        <Section className="bg-limestone py-20 lg:py-[120px]">
          <h2 className="reveal font-serif text-[48px] leading-[0.98] tracking-[-0.015em] sm:text-[64px] lg:text-[76px]">
            How I work
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-x-14 lg:mt-14">
            {HOW_I_WORK.map((item) => (
              <div key={item.title} className="reveal border-t border-ink pt-6">
                <h3 className="font-serif text-[32px] leading-tight">{item.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section className="py-20 lg:py-[120px]">
          <h2 className="reveal font-serif text-[48px] leading-[0.98] tracking-[-0.015em] sm:text-[64px] lg:text-[76px]">
            What I do
          </h2>
          <div className="reveal mt-12 border-t border-ink lg:mt-14">
            {[
              {
                name: 'Website build',
                detail: `${BUILD_FEE}, once. A custom one-page site for a local service business.`,
              },
              {
                name: 'Care Plans',
                detail: `From ${RETAINER_MIN}/month. Hosting and monthly edits after launch.`,
              },
            ].map((service) => (
              <Link
                key={service.name}
                href="/#pricing"
                className="group flex flex-col gap-2 border-b border-line py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="font-serif text-[36px] leading-none group-hover:italic">
                  {service.name}
                </span>
                <span className="text-[17px] text-ink-soft">
                  {service.detail}{' '}
                  <span className="nudge" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Section>

        <QuoteCta />
      </main>

      <Footer />
    </>
  );
}
