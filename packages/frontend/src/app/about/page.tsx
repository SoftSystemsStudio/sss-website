import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar, Footer, Section } from '@/components/ui';
import QuoteCta from '@/components/QuoteCta';
import { HOME_BASE, SERVICE_AREA_LABEL } from '@/lib/business';

export const metadata: Metadata = {
  title: 'About Austin',
  description: `I’m Austin Hodges. I design, write and build websites for local businesses from ${HOME_BASE}. Here’s who I am and how I work.`,
  alternates: { canonical: '/about' },
};

const EYEBROW =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]';

const HOW_I_WORK = [
  {
    title: 'You deal with me',
    body: 'No account managers and no handoffs. The person on your first call is the person building your site, and the one answering your emails after it launches.',
  },
  {
    title: 'I write the words',
    body: 'If writing about yourself sounds like a chore, good news: you don’t have to. I draft every page from what you tell me, and you approve it.',
  },
  {
    title: 'AI helps, I check',
    body: 'I use AI tools to work quickly, and every page is designed and reviewed by me before it ships. The software is fast; I’m the one who makes sure it’s right.',
  },
  {
    title: 'You always know where things stand',
    body: 'You get a written quote and a launch date before you commit, and I keep you posted from the first draft to launch day. You’ll never have to wonder whether I fell off the face of the earth.',
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
            One person. <br className="hidden sm:inline" />
            <em>Every detail.</em>
          </h1>
          <p className="rise mt-8 max-w-3xl text-lg leading-relaxed text-ink-soft [--rise-delay:0.25s] sm:text-[21px]">
            I’m Austin Hodges. I started Soft Systems Studio in December 2025 to build websites for
            local businesses. I’m based in {HOME_BASE}, I meet clients in person around{' '}
            {SERVICE_AREA_LABEL}, and I work with businesses anywhere else by phone and video. It’s
            just me, which means I design, write, build and support every site myself. It also means
            you always know exactly who’s responsible.
          </p>
        </Section>

        <Section
          className="border-t border-line-soft py-20 lg:py-[120px]"
          innerClassName="grid gap-8 lg:grid-cols-[4fr_8fr] lg:gap-16"
        >
          <h2 className={`reveal ${EYEBROW} lg:pt-3`}>Why I do this</h2>
          <div className="reveal">
            <p className="font-serif text-[30px] leading-[1.2] tracking-[-0.01em] sm:text-[40px]">
              A good local business deserves a website as good as the work it does.
            </p>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                Plenty of great businesses have a website that’s out of date, painful to use on a
                phone, or still “coming soon” from a few years back. That’s rarely because the owner
                doesn’t care. It’s because they’re busy actually running the business.
              </p>
              <p>
                That’s the part I take off your plate. I learn how your business works and who your
                customers are, then I design the site, write every word and build it myself, so it
                sounds like you and works the way your customers expect. You won’t have to stare at
                a blank page trying to sum yourself up in three sentences. That’s my job.
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
                href: '/pricing',
                detail: 'A custom site, designed and written around how your customers decide.',
              },
              {
                name: 'Care Plans',
                href: '/pricing#care-plans',
                detail: 'Hosting and monthly edits after launch, so your site stays current.',
              },
            ].map((service) => (
              <Link
                key={service.name}
                href={service.href}
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
