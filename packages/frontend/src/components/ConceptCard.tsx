import Image from 'next/image';
import Link from 'next/link';
import type { Concept } from '@/lib/concepts';

/**
 * One concept site as a self-contained project card: a browser window that
 * scrolls through the site on hover (see .concept-pan in globals.css), then
 * who the site is for and what's on it. The whole card links to the demo.
 *
 * `wide` sets the text beside the screenshot on large screens, for the
 * /for/* pages, which show a single concept. `children` goes under the name.
 *
 * The card clips with overflow-clip, not overflow-hidden: hidden would make
 * it a scroll container, and the touch pan's view timeline would follow that
 * (which never scrolls) instead of the page.
 */
export default function ConceptCard({
  concept,
  wide = false,
  heading: Heading = 'h3',
  className = '',
  children,
}: {
  concept: Concept;
  wide?: boolean;
  heading?: 'h2' | 'h3';
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={`group relative overflow-clip rounded-lg border border-line-soft bg-white shadow-[0_24px_48px_-36px_rgba(23,49,43,0.45)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_36px_64px_-36px_rgba(23,49,43,0.6)] has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ink ${wide ? 'flex flex-col lg:grid lg:grid-cols-[7fr_5fr]' : 'flex flex-col'} ${className}`}
    >
      <div
        className={`flex flex-col border-b border-line-soft ${wide ? 'lg:border-b-0 lg:border-r' : ''}`}
      >
        <div className="flex h-9 items-center gap-[7px] border-b border-line-soft px-3.5">
          <span className="h-[9px] w-[9px] rounded-full bg-[#CDD1C7]" aria-hidden="true" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#CDD1C7]" aria-hidden="true" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#CDD1C7]" aria-hidden="true" />
          <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Concept site
          </span>
        </div>
        <div
          className={`concept-frame relative aspect-[16/10] overflow-hidden bg-limestone ${wide ? 'lg:aspect-auto lg:min-h-[420px] lg:flex-1' : ''}`}
        >
          <Image
            src={concept.fullImage}
            alt={`The ${concept.name} concept site`}
            width={1440}
            height={2700}
            sizes={
              wide
                ? '(min-width: 1440px) 740px, (min-width: 1024px) 55vw, 100vw'
                : '(min-width: 1440px) 640px, (min-width: 768px) 50vw, 100vw'
            }
            className="concept-pan block h-auto w-full"
          />
        </div>
      </div>

      <div className={`flex flex-1 flex-col p-6 sm:p-8 ${wide ? 'lg:p-10' : ''}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]">
          {concept.type}
        </p>
        <Heading
          className={`mt-2 font-serif leading-[1.02] ${wide ? 'text-[40px] sm:text-[50px]' : 'text-[34px] sm:text-[40px]'}`}
        >
          {/* Stretched over the whole card */}
          <Link
            href={concept.href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {concept.name}
            <span className="sr-only">, concept site</span>
          </Link>
        </Heading>
        {children}

        <p className="mt-6 text-sm font-bold">Built for</p>
        <p className="mt-1 text-[17px] leading-[1.55] text-ink-soft">{concept.builtFor}</p>

        <p className="mt-5 text-sm font-bold">On the site</p>
        <ul
          className={`mt-2 grid gap-x-6 gap-y-1.5 text-[17px] text-ink-soft ${wide ? 'sm:grid-cols-2 lg:grid-cols-1' : 'xl:grid-cols-2'}`}
        >
          {concept.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 leading-[1.55]">
              <svg
                viewBox="0 0 16 16"
                className="mt-[6px] h-3.5 w-3.5 flex-none text-ink"
                aria-hidden="true"
              >
                <path
                  d="M2.5 8.5l3.5 3.5 7.5-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <p className="flex items-center justify-between border-t border-line-soft pt-5 font-semibold">
            View the concept site
            <span className="nudge" aria-hidden="true">
              →
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
