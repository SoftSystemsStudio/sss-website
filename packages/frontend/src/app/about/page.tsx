import type { Metadata } from 'next';
import { Navbar, Footer, Section } from '@/components/ui';
import { FadeIn, StaggerContainer } from '@/components/motion';
import { BUILD_FEE, CARE_PLANS, RETAINER_MIN, SERVICE_AREA_LABEL } from '@/lib/business';

export const metadata: Metadata = {
  title: 'About',
  description: `A new studio, one person, honest pricing. Why Soft Systems Studio charges ${BUILD_FEE} for a website build instead of $3,000+.`,
  alternates: { canonical: '/about' },
};

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Website Build', href: '/#website' },
  { label: 'Care Plans', href: '/#retainer' },
  { label: 'Contact', href: '/intake' },
];

const VALUES = [
  {
    title: 'Ship Fast, Iterate Faster',
    description:
      'No 6-month development cycles. I build in days, launch quickly, and improve based on real feedback.',
  },
  {
    title: 'No Fluff, No Filler',
    description:
      "Every line of code serves a purpose. I cut everything that doesn't help your business get customers.",
  },
  {
    title: 'AI-Assisted, Personally Reviewed',
    description:
      'I use AI to work faster, but every site is designed and reviewed by me — the person who actually builds it, not a team you never meet.',
  },
  {
    title: 'Transparent by Default',
    description: `Clear pricing, no hidden fees. A ${BUILD_FEE} flat build fee, Care Plans at ${CARE_PLANS.map((p) => p.price).join(', ')} a month. That's the whole price list.`,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen text-brand-ink">
      <Navbar
        items={NAV_ITEMS}
        ctaLabel="Get a Quote"
        ctaHref="/intake"
        brand="Soft Systems Studio"
        variant="light"
      />

      <main>
        <Section className="sss-paper pt-16 md:pt-24">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-lime mb-4">
              About
            </p>
            <h1 className="sss-display text-5xl md:text-6xl font-extrabold leading-[1.02] max-w-3xl">
              Soft Systems Studio
            </h1>
            <p className="mt-5 text-xl md:text-2xl text-brand-ink-soft font-medium">
              A new studio. Honest pricing.
            </p>
            <p className="mt-5 text-lg text-brand-muted max-w-2xl leading-relaxed">
              I&apos;m Austin. I started Soft Systems Studio this year, and I don&apos;t have a
              client roster to point to yet — just a handful of demo sites and a price that reflects
              exactly where I&apos;m starting from.
            </p>
          </FadeIn>
        </Section>

        <Section className="bg-brand-paper-elevated">
          <FadeIn>
            <h2 className="sss-display text-3xl md:text-4xl font-extrabold mb-8">
              The Honest Version
            </h2>
            <div className="max-w-2xl space-y-5 text-brand-ink-soft leading-relaxed text-lg">
              <p>
                I started Soft Systems Studio at the beginning of 2026. I don&apos;t have a roster
                of clients yet — what I have is a handful of demo sites I built myself to show what
                I can do, and a {BUILD_FEE} flat build fee that reflects exactly that: a new studio
                building its first portfolio, not an established shop with ten years of case studies
                to point to.
              </p>
              <p>
                That&apos;s not something I&apos;m hiding — it&apos;s the reason the price is what
                it is. An established studio with a client list can charge $3,000 or more, because
                they&apos;re not just selling you a website, they&apos;re selling you their track
                record. I don&apos;t have one of those yet. So instead of charging for a reputation
                I haven&apos;t built, I charge for the work itself — and I do the work myself.
              </p>
              <p>
                AI is what makes that math work. It lets one person build and ship what used to take
                a small team, which is how a solo studio can charge {BUILD_FEE} instead of $3,000+
                and still do the work properly.
              </p>
              <p className="font-semibold text-brand-ink">
                So that&apos;s the pitch: a new studio, one person, a fair price for where I
                actually am — building websites for local businesses in {SERVICE_AREA_LABEL}.
              </p>
              <p className="text-brand-lime font-semibold">
                No invented history. No fake case studies. Just the work.
              </p>
            </div>
          </FadeIn>
        </Section>

        <Section className="sss-paper">
          <FadeIn>
            <h2 className="sss-display text-3xl md:text-4xl font-extrabold text-center mb-3">
              What I Believe
            </h2>
            <p className="text-brand-muted text-center mb-12 max-w-xl mx-auto">
              The principles that guide everything I build
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="border border-brand-ink/10 bg-white/50 p-7 rounded-md"
              >
                <h3 className="sss-display text-xl font-bold text-brand-ink mb-2">{value.title}</h3>
                <p className="text-brand-muted leading-relaxed">{value.description}</p>
              </div>
            ))}
          </StaggerContainer>
        </Section>

        <Section className="bg-brand-paper-elevated">
          <FadeIn>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="sss-display text-3xl md:text-4xl font-extrabold mb-3">Just Me</h2>
              <p className="text-brand-muted mb-10">
                No bureaucracy, no account manager — just the person building your site.
              </p>
              <div className="border border-brand-ink/10 bg-white/60 p-10 rounded-md">
                <div className="w-20 h-20 rounded-md bg-brand-lime text-white flex items-center justify-center mx-auto mb-5 sss-display text-2xl font-extrabold">
                  AH
                </div>
                <h3 className="sss-display text-2xl font-bold">Austin Hodges</h3>
                <p className="text-brand-lime font-semibold mt-1 mb-4">Founder</p>
                <p className="text-brand-muted leading-relaxed">
                  I started Soft Systems Studio in 2026 to build websites for local service
                  businesses near Phenix City, Alabama. I use AI to build fast and keep prices
                  honest, and I do the design, build, and support myself.
                </p>
              </div>
            </div>
          </FadeIn>
        </Section>

        <Section className="sss-paper">
          <FadeIn>
            <h2 className="sss-display text-3xl md:text-4xl font-extrabold text-center mb-12">
              What I Do
            </h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="border border-brand-ink/10 bg-white/50 p-7 rounded-md text-center">
              <h3 className="sss-display text-xl font-bold mb-2">Website Build</h3>
              <p className="text-brand-muted text-sm mb-4">
                A flat {BUILD_FEE} build for local service businesses — no tiers, no upsells.
              </p>
              <a href="/#website" className="text-brand-lime font-semibold text-sm hover:underline">
                See the Details →
              </a>
            </div>
            <div className="border border-brand-ink/10 bg-white/50 p-7 rounded-md text-center">
              <h3 className="sss-display text-xl font-bold mb-2">Care Plans</h3>
              <p className="text-brand-muted text-sm mb-4">
                Optional hosting and monthly edits from {RETAINER_MIN}/month after launch.
              </p>
              <a
                href="/#retainer"
                className="text-brand-lime font-semibold text-sm hover:underline"
              >
                See Care Plans →
              </a>
            </div>
          </StaggerContainer>
        </Section>

        <Section className="bg-brand-ink text-white">
          <FadeIn>
            <div className="max-w-2xl">
              <h2 className="sss-display text-4xl md:text-5xl font-extrabold">
                Ready to be an early client?
              </h2>
              <p className="mt-4 text-lg text-white/65">
                Get a quote for a {BUILD_FEE} website build
              </p>
              <a
                href="/intake"
                className="mt-8 inline-flex px-8 py-3.5 bg-brand-lime text-white font-semibold rounded-md hover:bg-brand-lime-bright transition-colors"
              >
                Start a Project
              </a>
            </div>
          </FadeIn>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
