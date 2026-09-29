import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  /** Classes for the full-bleed <section> (background, vertical padding). */
  className?: string;
  /** Classes for the inner, page-width container. */
  innerClassName?: string;
}

/** A full-bleed section with the site's page-width container and side gutters. */
export default function Section({
  children,
  id,
  className = '',
  innerClassName = '',
}: SectionProps) {
  return (
    <section id={id} className={className}>
      <div className={`mx-auto max-w-page px-5 sm:px-8 lg:px-20 ${innerClassName}`}>{children}</div>
    </section>
  );
}
