import Image from 'next/image';
import type { Concept } from '@/lib/concepts';

// The concept captures are 1440×2700; the frame shows a 16:9 window onto the
// top. Panning by this much (of the image's own height) lands on its bottom.
const CONCEPT_PAN = `-${Math.round((1 - 9 / 16 / (2700 / 1440)) * 100)}%`;

/** A minimal browser window. Put inside a `.group` so it lifts on hover. */
export function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="concept-frame overflow-hidden rounded-md bg-white shadow-[0_30px_60px_-36px_rgba(23,49,43,0.5)] transition-[transform,box-shadow] duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_40px_70px_-36px_rgba(23,49,43,0.6)]">
      <div
        className="flex h-8 items-center gap-[7px] border-b border-[#E3E5DE] px-3.5"
        aria-hidden="true"
      >
        <span className="h-[9px] w-[9px] rounded-full bg-[#CDD1C7]" />
        <span className="h-[9px] w-[9px] rounded-full bg-[#CDD1C7]" />
        <span className="h-[9px] w-[9px] rounded-full bg-[#CDD1C7]" />
      </div>
      {children}
    </div>
  );
}

/** A concept's tall capture in a browser frame; scrolls through the site on hover (see globals.css). */
export function ConceptShot({
  concept,
  sizes = '(min-width: 1440px) 740px, (min-width: 1024px) 55vw, 100vw',
}: {
  concept: Concept;
  sizes?: string;
}) {
  return (
    <BrowserFrame>
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={concept.fullImage}
          alt={`The ${concept.name} concept site`}
          width={1440}
          height={2700}
          sizes={sizes}
          className="concept-pan block h-auto w-full"
          style={{ '--pan': CONCEPT_PAN } as React.CSSProperties}
        />
      </div>
    </BrowserFrame>
  );
}

/** A phone bezel. `depth` is how far it drifts inside a ShowcaseParallax. */
export function PhoneFrame({
  src,
  alt,
  eager = false,
  depth = 16,
  sizes = '220px',
}: {
  src: string;
  alt: string;
  eager?: boolean;
  depth?: number;
  sizes?: string;
}) {
  return (
    <div
      className="parallax relative aspect-[220/468] overflow-hidden rounded-[40px] border-8 border-ink bg-ink shadow-[0_40px_70px_-30px_rgba(23,49,43,0.5)]"
      style={{ '--depth': depth } as React.CSSProperties}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="rounded-[32px] object-cover object-top"
        loading={eager ? 'eager' : 'lazy'}
      />
    </div>
  );
}
