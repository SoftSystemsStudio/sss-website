'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bodoni_Moda, Jost } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

const display = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});
const body = Jost({ subsets: ['latin'], variable: '--font-body' });

// Headings here set their weight with Tailwind's `!` modifier: the demo layout's
// shared heading rule (globals.css) forces bold with !important, and Bodoni
// reads best light.

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    // Backstop for static renders (crawlers, link previews, screenshots) that
    // never scroll — same as the other demos.
    const backstop = setTimeout(() => setVisible(true), 600);
    return () => {
      io.disconnect();
      clearTimeout(backstop);
    };
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const occasions = [
  {
    name: 'Birthdays',
    line: 'Bright, a little loud, and wrapped to go.',
    from: '$48',
    src: '/images/demo/mayhaw/occasion-birthday.jpg',
    alt: 'Pink hydrangeas, roses and carnations arranged low in a white vessel',
  },
  {
    name: 'Sympathy',
    line: 'Quiet whites and greens, delivered to the home or the service.',
    from: '$65',
    src: '/images/demo/mayhaw/occasion-sympathy.jpg',
    alt: 'White roses in a clear glass vase in soft light',
  },
  {
    name: 'Weddings',
    line: 'Bouquets to arches, planned stem by stem with you.',
    from: 'Consult',
    src: '/images/demo/mayhaw/occasion-wedding-bouquet.jpg',
    alt: 'A bride holding a loose bouquet of garden roses and greenery',
  },
  {
    name: 'Anniversaries',
    line: 'Peonies in season, garden roses when they aren’t.',
    from: '$58',
    src: '/images/demo/mayhaw/occasion-anniversary.jpg',
    alt: 'Close-up of a coral peony in full bloom',
  },
];

const weekly = [
  {
    name: 'The Porch Swing',
    stems: 'Pink tulips, snapdragon and baby’s breath, wrapped in blush paper.',
    price: '$48',
    src: '/images/demo/mayhaw/bouquet-tulips-pink.jpg',
    alt: 'A bouquet of pink and orange tulips wrapped in pink paper',
  },
  {
    name: 'Sunday Market',
    stems: 'Two-tone tulips and a cloud of baby’s breath in kraft paper.',
    price: '$42',
    src: '/images/demo/mayhaw/bouquet-tulips-kraft.jpg',
    alt: 'Red and white tulips with baby’s breath wrapped in brown kraft paper',
  },
  {
    name: 'Linen & Lace',
    stems: 'All-white sprays, hand-tied and wrapped in tissue and kraft.',
    price: '$55',
    src: '/images/demo/mayhaw/bouquet-white.jpg',
    alt: 'A round bouquet of small white flowers wrapped in white tissue and kraft paper',
  },
];

const hours = [
  ['Tuesday – Friday', '9 AM – 6 PM'],
  ['Saturday', '9 AM – 3 PM'],
  ['Sunday & Monday', 'Closed · weddings by appointment'],
];

const H_DISPLAY = { fontFamily: 'var(--font-display)' };

export default function MayhawDemo() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-[#F6ECE7] text-[#3A1D2E] antialiased`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* ───────── DEMO BADGE ───────── */}
      <div className="fixed bottom-4 md:bottom-auto md:top-4 right-4 z-[60] px-3 py-1.5 bg-[#A3303F] text-white text-xs font-semibold rounded-full shadow-lg tracking-wider uppercase">
        Demo Site
      </div>
      <Link
        href="/#portfolio"
        className="fixed bottom-4 md:bottom-auto md:top-4 left-4 z-[60] px-3 py-1.5 bg-white/80 backdrop-blur-md text-[#3A1D2E] text-sm font-medium rounded-full hover:bg-white transition-all duration-300 shadow-sm"
      >
        ← Back to Portfolio
      </Link>

      {/* ───────── CUTOFF BAR ───────── */}
      <div className="bg-[#3A1D2E] text-[#F6ECE7] text-center text-sm py-2.5 px-4">
        Order by 1 PM for same-day delivery
        <span className="hidden sm:inline"> in Columbus and Phenix City</span>
      </div>

      {/* ───────── NAV ───────── */}
      <nav className="sticky top-0 z-40 bg-[#F6ECE7]/95 backdrop-blur-md border-b border-[#3A1D2E]/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
          <span className="flex items-baseline gap-2">
            <span className="text-[28px] italic" style={{ ...H_DISPLAY, fontWeight: 500 }}>
              Mayhaw
            </span>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#5E4652]">
              Flower Studio
            </span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-[15px] text-[#5E4652]">
            <a href="#occasions" className="hover:text-[#A3303F] transition-colors">
              Occasions
            </a>
            <a href="#this-week" className="hover:text-[#A3303F] transition-colors">
              This week
            </a>
            <a href="#weddings" className="hover:text-[#A3303F] transition-colors">
              Weddings
            </a>
            <a href="#visit" className="hover:text-[#A3303F] transition-colors">
              Visit
            </a>
          </div>
          <a
            href="#order"
            className="hidden md:inline-block px-6 py-3 bg-[#A3303F] text-white text-sm font-medium tracking-wide rounded-full hover:bg-[#8A2735] transition-colors"
          >
            Order flowers
          </a>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="md:hidden text-sm border border-[#3A1D2E]/20 rounded-full px-4 py-1.5"
            aria-expanded={mobileMenu}
            aria-label="Toggle navigation"
          >
            {mobileMenu ? 'Close' : 'Menu'}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-[#3A1D2E]/10 px-6 py-4 flex flex-col gap-4 text-[#5E4652]">
            {[
              ['#occasions', 'Occasions'],
              ['#this-week', 'This week'],
              ['#weddings', 'Weddings'],
              ['#visit', 'Visit'],
              ['#order', 'Order flowers'],
            ].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)}>
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-14 md:pt-20 pb-20 grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-12 md:gap-16 items-center">
        <div>
          <p className="text-[12px] uppercase tracking-[0.3em] text-[#A3303F] mb-6">
            Downtown Columbus, Georgia
          </p>
          <h1
            className="text-[44px] sm:text-6xl md:text-[68px] leading-[1.02] mb-7 !font-normal"
            style={H_DISPLAY}
          >
            Flowers for the days that matter,{' '}
            <em className="text-[#A3303F]">and the ones in between.</em>
          </h1>
          <p className="text-lg text-[#5E4652] max-w-md mb-9 leading-relaxed">
            A small flower studio working with what’s in season. Arranged by hand, wrapped with
            care, and delivered the same day.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#this-week"
              className="px-7 py-3.5 bg-[#A3303F] text-white font-medium rounded-full hover:bg-[#8A2735] transition-colors"
            >
              See this week’s bouquets
            </a>
            <a
              href="#weddings"
              className="px-7 py-3.5 border border-[#3A1D2E]/30 rounded-full hover:border-[#3A1D2E] transition-colors"
            >
              Plan a wedding
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] rounded-t-full overflow-hidden">
            <Image
              src="/images/demo/mayhaw/hero-shop.jpg"
              alt="Two florists arranging bouquets in a bright flower shop"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <p className="absolute -bottom-5 left-6 md:-left-8 bg-[#FBF6F3] px-5 py-3 rounded-full text-sm shadow-[0_12px_30px_-18px_rgba(58,29,46,0.5)]">
            <span className="italic" style={H_DISPLAY}>
              Fresh today:
            </span>{' '}
            ranunculus, tulips, stock
          </p>
        </div>
      </section>

      {/* ───────── OCCASIONS ───────── */}
      <section id="occasions" className="bg-[#FBF6F3] border-y border-[#3A1D2E]/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-14 max-w-xl">
            <h2 className="text-4xl md:text-5xl mb-4 !font-normal" style={H_DISPLAY}>
              Shop by <em>occasion.</em>
            </h2>
            <p className="text-[#5E4652] leading-relaxed">
              Tell us who it’s for and roughly what you’d like to spend. We’ll build something that
              fits the day.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {occasions.map((o, i) => (
              <Reveal key={o.name} delay={i * 0.06} className="group">
                <a href="#order" className="block">
                  <div className="relative aspect-[3/4] rounded-t-full overflow-hidden mb-5">
                    <Image
                      src={o.src}
                      alt={o.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl !font-medium" style={H_DISPLAY}>
                      {o.name}
                    </h3>
                    <span className="text-sm text-[#A3303F] whitespace-nowrap">
                      {o.from === 'Consult' ? 'By consult' : `from ${o.from}`}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] text-[#5E4652] leading-relaxed">{o.line}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── THIS WEEK ───────── */}
      <section id="this-week">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl mb-4 !font-normal" style={H_DISPLAY}>
                This week’s <em>bouquets.</em>
              </h2>
              <p className="text-[#5E4652] leading-relaxed">
                Three wrapped bouquets from whatever came in fresh on Tuesday. When they’re gone,
                they’re gone.
              </p>
            </div>
            <p className="text-sm text-[#5E4652]">Pickup or same-day delivery</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {weekly.map((w, i) => (
              <Reveal key={w.name} delay={i * 0.08} className="group">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-5">
                  <Image
                    src={w.src}
                    alt={w.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-2xl !font-medium" style={H_DISPLAY}>
                    {w.name}
                  </h3>
                  <span className="text-lg">{w.price}</span>
                </div>
                <p className="mt-2 text-[15px] text-[#5E4652] leading-relaxed">{w.stems}</p>
                <a
                  href="#order"
                  className="mt-4 inline-block text-sm font-medium text-[#A3303F] border-b border-[#A3303F]/40 hover:border-[#A3303F] transition-colors"
                >
                  Order this bouquet
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── THE STUDIO ───────── */}
      <section className="border-t border-[#3A1D2E]/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <Reveal className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/images/demo/mayhaw/studio-ribbon.jpg"
              alt="A florist tying a ribbon around a bouquet at a wooden work table"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-5xl mb-6 !font-normal" style={H_DISPLAY}>
              A studio, <em>not a catalog.</em>
            </h2>
            <div className="space-y-4 text-[#5E4652] leading-relaxed">
              <p>
                We don’t sell arrangement #104 from a wire service. Every order starts with the
                buckets in our cooler that morning, and most of them come from growers within a few
                hours of here.
              </p>
              <p>
                Call us once and we’ll remember that your mom loves ranunculus and your office can’t
                stand lilies.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── WEDDINGS ───────── */}
      <section id="weddings" className="bg-[#3A1D2E] text-[#F6ECE7]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-14 items-center">
          <Reveal>
            <p className="text-[12px] uppercase tracking-[0.3em] text-[#E7B7BE] mb-5">
              Weddings &amp; events
            </p>
            <h2
              className="text-4xl md:text-[56px] leading-[1.05] mb-6 !font-normal"
              style={H_DISPLAY}
            >
              Planned stem by stem, <em>with you.</em>
            </h2>
            <p className="text-[#E3D2D8] leading-relaxed mb-8 max-w-md">
              We take a handful of weddings each season so every one gets our full attention.
              Consults are Tuesdays and Thursdays, in the studio or by video.
            </p>
            <a
              href="#order"
              className="inline-block px-7 py-3.5 bg-[#F6ECE7] text-[#3A1D2E] font-medium rounded-full hover:bg-white transition-colors"
            >
              Book a consult
            </a>
          </Reveal>
          <Reveal
            delay={0.1}
            className="relative aspect-[4/5] md:aspect-[5/4] rounded-t-full md:rounded-t-[240px] overflow-hidden"
          >
            <Image
              src="/images/demo/mayhaw/occasion-wedding.jpg"
              alt="A bride holding white calla lilies"
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* ───────── ORDER + VISIT ───────── */}
      <section id="order" className="scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
          <Reveal>
            <h2 className="text-4xl md:text-5xl mb-6 !font-normal" style={H_DISPLAY}>
              Order <em>by phone.</em>
            </h2>
            <p className="text-[#5E4652] leading-relaxed mb-8 max-w-md">
              Tell us the occasion, the budget and where it’s going. Order by 1 PM and it arrives
              between 2 and 6 PM the same day.
            </p>
            <a
              href="tel:+17065550164"
              className="inline-block text-3xl md:text-4xl hover:text-[#A3303F] transition-colors"
              style={H_DISPLAY}
            >
              (706) 555-0164
            </a>
            <p className="mt-4">
              <a
                href="mailto:hello@mayhawflowers.example"
                className="text-[#5E4652] border-b border-[#3A1D2E]/30 hover:text-[#A3303F] hover:border-[#A3303F] transition-colors"
              >
                hello@mayhawflowers.example
              </a>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="scroll-mt-24">
            <h2
              id="visit"
              className="text-4xl md:text-5xl mb-6 !font-normal scroll-mt-28"
              style={H_DISPLAY}
            >
              Visit <em>the studio.</em>
            </h2>
            <p className="text-[#5E4652] mb-6">Front Avenue, downtown Columbus, GA</p>
            <dl className="border-t border-[#3A1D2E]/15">
              {hours.map(([day, time]) => (
                <div
                  key={day}
                  className="flex justify-between gap-6 py-3.5 border-b border-[#3A1D2E]/15 text-[15px]"
                >
                  <dt>{day}</dt>
                  <dd className="text-[#5E4652] text-right">{time}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-[#5E4652] mt-6">
              Same-day delivery to Columbus, Phenix City, Midland and Smiths Station.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="border-t border-[#3A1D2E]/10 bg-[#FBF6F3]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <span className="text-2xl italic" style={{ ...H_DISPLAY, fontWeight: 500 }}>
              Mayhaw Flower Studio
            </span>
            <Link
              href="/intake?type=Florist"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3A1D2E]/5 text-[#3A1D2E] text-sm font-medium rounded-full hover:bg-[#A3303F]/10 hover:text-[#A3303F] border border-[#3A1D2E]/10 hover:border-[#A3303F]/30 transition-all duration-300"
            >
              Want a site like this? Get a quote →
            </Link>
          </div>
          <p className="text-xs text-[#7A6570] leading-relaxed">
            Mayhaw Flower Studio is a fictional business. This page is a demo built by Soft Systems
            Studio to show what a florist’s website could look like — it is not a real shop, and the
            contact details above do not reach a real business.
          </p>
          <p className="text-[11px] text-[#8E7B84] mt-3">
            Photos via Pexels: Amina Filkins, Piotr Arnoldes, Khohelen, Natasha Fernandez, Aric
            Berger, Marta Dzedyshko, Nguyen Huy, Ayşe Sude and Şevval Çadır.
          </p>
        </div>
      </footer>
    </div>
  );
}
