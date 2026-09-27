import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  /** When false, omit the inner max-width wrapper (full-bleed sections). */
  contained?: boolean;
}

export default function Section({ children, id, className = '', contained = true }: SectionProps) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      {contained ? <div className="max-w-6xl mx-auto px-6">{children}</div> : children}
    </section>
  );
}
