'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Button from './Button';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  items?: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const SITE_NAV: NavItem[] = [
  { label: 'Work', href: '/#portfolio' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'How it goes', href: '/#process' },
  { label: 'About', href: '/about' },
];

export default function Navbar({
  items = SITE_NAV,
  ctaLabel = 'Get a quote',
  ctaHref = '/intake',
  className = '',
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header className={`sticky top-0 z-50 border-b border-line-soft bg-paper ${className}`}>
      <div className="mx-auto flex h-16 max-w-page items-center justify-between pl-5 pr-3 sm:px-8 lg:h-[88px] lg:px-20">
        <Link
          href="/"
          className="font-serif text-[25px] tracking-[-0.01em] text-ink lg:text-[30px]"
          onClick={closeMobile}
        >
          Soft Systems Studio
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-ink hover:text-ink-muted"
            >
              {item.label}
            </Link>
          ))}
          <Button as="link" href={ctaHref} variant="primary" size="sm">
            {ctaLabel}
          </Button>
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="flex h-11 w-11 items-center justify-center text-ink md:hidden"
          onClick={toggleMobile}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="border-t border-line-soft bg-paper px-5 pb-6 pt-2 md:hidden"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center border-b border-line-soft py-3 text-lg text-ink"
              onClick={closeMobile}
            >
              {item.label}
            </Link>
          ))}
          <Button as="link" href={ctaHref} variant="primary" size="md" className="mt-6 w-full">
            {ctaLabel}
          </Button>
        </nav>
      )}
    </header>
  );
}
