import Image from 'next/image';

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
