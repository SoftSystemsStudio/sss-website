'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  logo?: string;
  brand?: string;
  items?: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  /** overMedia starts transparent on photo heroes, then switches to light after the hero */
  variant?: 'light' | 'overMedia';
}

export default function Navbar({
  logo = '/images/soft-systems-logo.png',
  brand = 'Soft Systems Studio',
  items = [],
  ctaLabel = 'Get Started',
  ctaHref = '/intake',
  className = '',
  variant = 'light',
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overHero, setOverHero] = useState(variant === 'overMedia');

  useEffect(() => {
    if (variant !== 'overMedia') {
      setOverHero(false);
      return;
    }

    const hero = document.getElementById('site-hero');
    if (!hero) {
      setOverHero(false);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        // Stay in overMedia style while any meaningful slice of the hero is visible
        setOverHero(entry.isIntersecting && entry.intersectionRatio > 0.15);
      },
      { threshold: [0, 0.15, 0.3, 0.6, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [variant]);

  const overMedia = variant === 'overMedia' && overHero;

  return (
    <header
      className={`sticky top-0 z-[100] border-b transition-colors duration-300 ${
        overMedia
          ? 'bg-brand-ink/40 backdrop-blur-md border-white/15 text-white'
          : 'bg-brand-paper-elevated/95 backdrop-blur-md border-brand-ink/10 text-brand-ink'
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {logo && (
            <Image
              src={logo}
              alt={brand}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0"
              priority
              unoptimized
            />
          )}
          <span
            className={`sss-display font-semibold text-lg tracking-tight truncate ${
              overMedia ? 'text-white' : 'text-brand-ink'
            }`}
          >
            {brand}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                overMedia
                  ? 'text-white/80 hover:text-white'
                  : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              {item.label}
            </a>
          ))}
          <Button
            as="link"
            href={ctaHref}
            variant="primary"
            size="sm"
            className={overMedia ? '!bg-white !text-brand-ink hover:!bg-brand-lime-wash' : ''}
          >
            {ctaLabel}
          </Button>
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className={`md:hidden p-2 rounded-md ${
            overMedia ? 'text-white/85 hover:text-white' : 'text-brand-muted hover:text-brand-ink'
          }`}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav
          className={`md:hidden border-t px-6 py-4 space-y-4 ${
            overMedia
              ? 'bg-brand-ink/90 border-white/10'
              : 'bg-brand-paper-elevated border-brand-ink/10'
          }`}
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`block text-sm font-medium ${
                overMedia ? 'text-white/85' : 'text-brand-muted hover:text-brand-ink'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Button as="link" href={ctaHref} variant="primary" size="md" className="w-full">
            {ctaLabel}
          </Button>
        </nav>
      )}
    </header>
  );
}
