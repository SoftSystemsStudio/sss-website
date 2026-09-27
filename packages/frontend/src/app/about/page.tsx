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
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-lime-900/20 via-transparent to-transparent pointer-events-none" />

      <Navbar
        items={NAV_ITEMS}
        ctaLabel="Get a Quote"
        ctaHref="/intake"
        brand="Soft Systems Studio"
      />

      <div className="antialiased min-h-screen bg-black text-gray-100 selection:bg-lime-400 selection:text-black overflow-x-hidden">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-lime-400 focus:text-black focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>

        <main id="main-content" className="relative z-10">
          <Section className="pt-32 pb-16">
            <FadeIn>
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                  Soft Systems Studio
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 font-medium mb-4">
                  A new studio. Honest pricing.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  I&apos;m Austin. I started Soft Systems Studio this year, and I don&apos;t have a
                  client roster to point to yet — just a handful of demo sites and a price that
                  reflects exactly where I&apos;m starting from.
                </p>
              </div>
            </FadeIn>
          </Section>

          <Section className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-900/5 to-transparent pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
                  The Honest Version
                </h2>
                <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
                  <p>
                    I started Soft Systems Studio at the beginning of 2026. I don&apos;t have a
                    roster of clients yet — what I have is a handful of demo sites I built myself to
                    show what I can do, and a {BUILD_FEE} flat build fee that reflects exactly that:
                    a new studio building its first portfolio, not an established shop with ten
                    years of case studies to point to.
                  </p>
                  <p>
                    That&apos;s not something I&apos;m hiding — it&apos;s the reason the price is
                    what it is. An established studio with a client list can charge $3,000 or more,
                    because they&apos;re not just selling you a website, they&apos;re selling you
                    their track record. I don&apos;t have one of those yet. So instead of charging
                    for a reputation I haven&apos;t built, I charge for the work itself — and I do
                    the work myself.
                  </p>
                  <p>
                    AI is what makes that math work. It lets one person build and ship what used to
                    take a small team, which is how a solo studio can charge {BUILD_FEE} instead of
                    $3,000+ and still do the work properly.
                  </p>
                  <p className="text-white font-bold">
                    So that&apos;s the pitch: a new studio, one person, a fair price for where I
                    actually am — building websites for local businesses in {SERVICE_AREA_LABEL}.
                  </p>
                  <p className="text-lime-400 font-medium">
                    No invented history. No fake case studies. Just the work.
                  </p>
                </div>
              </FadeIn>
            </div>
          </Section>

          <Section className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent pointer-events-none" />

            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">
                What I Believe
              </h2>
              <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                The principles that guide everything I build
              </p>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto relative z-10">
              {VALUES.map((value) => (
                <div
                  key={value.title}
                  className="group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-lime-400/50 transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lime-400 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </StaggerContainer>
          </Section>

          <Section className="py-24 relative">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">
                Just Me
              </h2>
              <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
                No bureaucracy, no meetings, no account manager relaying messages — just the person
                building your site.
              </p>
            </FadeIn>

            <div className="max-w-2xl mx-auto">
              <FadeIn>
                <div className="p-10 text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime-400 to-cyan-400 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-black text-black">AH</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Austin Hodges</h3>
                  <p className="text-lime-400 font-medium mb-4">Founder</p>
                  <p className="text-gray-300 leading-relaxed max-w-lg mx-auto">
                    I started Soft Systems Studio in 2026 to build websites for local service
                    businesses near Phenix City, Alabama. I use AI to build fast and keep prices
                    honest, and I do the design, build, and support myself.
                  </p>
                </div>
              </FadeIn>
            </div>

            <FadeIn className="text-center mt-12">
              <p className="text-gray-500 text-sm mb-4">Want to work together?</p>
              <a
                href="/intake"
                className="inline-block px-8 py-4 border-2 border-lime-400/50 text-lime-400 font-bold rounded-lg hover:bg-lime-400/10 transition-all duration-300"
              >
                Start a Project
              </a>
            </FadeIn>
          </Section>

          <Section className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-900/10 via-transparent to-cyan-900/10 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-16">
                  What I Do
                </h2>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl border border-lime-400/30 bg-gradient-to-br from-lime-400/5 to-transparent backdrop-blur text-center">
                  <h3 className="text-xl font-bold text-white mb-3">Website Build</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    A flat {BUILD_FEE} build for local service businesses — no tiers, no upsells.
                  </p>
                  <a href="/#website" className="text-lime-400 text-sm font-medium hover:underline">
                    See the Details →
                  </a>
                </div>

                <div className="p-6 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/5 to-transparent backdrop-blur text-center">
                  <h3 className="text-xl font-bold text-white mb-3">Care Plans</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Optional hosting and monthly edits from {RETAINER_MIN}/month after launch.
                  </p>
                  <a
                    href="/#retainer"
                    className="text-lime-400 text-sm font-medium hover:underline"
                  >
                    See Care Plans →
                  </a>
                </div>
              </StaggerContainer>
            </div>
          </Section>

          <Section className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-lime-900/20 pointer-events-none" />

            <FadeIn>
              <div className="max-w-3xl mx-auto text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Ready to Be an Early Client?
                </h2>
                <p className="text-xl text-gray-300 mb-10">
                  Get a quote for a {BUILD_FEE} website build
                </p>
                <a
                  href="/intake"
                  className="inline-block px-10 py-5 bg-lime-400 text-black font-bold text-lg rounded-lg hover:bg-lime-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime-400/40"
                >
                  Start a Project
                </a>
              </div>
            </FadeIn>
          </Section>
        </main>

        <Footer />
      </div>
    </>
  );
}
