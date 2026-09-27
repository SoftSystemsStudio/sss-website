import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SERVICE_AREA_LABEL, BUSINESS_PHONE, CONTACT_EMAIL } from '@/lib/business';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  logo?: string;
  brand?: string;
  links?: FooterLink[];
  className?: string;
}

export default function Footer({
  logo = '/images/soft-systems-logo.png',
  brand = 'Soft Systems Studio',
  links = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
  className = '',
}: FooterProps) {
  return (
    <footer className={`border-t border-brand-ink/10 bg-brand-ink text-brand-paper ${className}`}>
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          {logo && (
            <Image src={logo} alt={brand} width={28} height={28} className="h-7 w-7" unoptimized />
          )}
          <div>
            <p className="sss-display font-semibold text-lg tracking-tight">{brand}</p>
            <p className="text-sm text-white/55 mt-1">
              &copy; {new Date().getFullYear()} Soft Systems Studio
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/65 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-sm text-white/65 hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-10 text-sm text-white/45">
        Serving {SERVICE_AREA_LABEL}.
        {BUSINESS_PHONE && (
          <>
            {' '}
            Call{' '}
            <a href={`tel:${BUSINESS_PHONE}`} className="text-white/70 hover:text-white">
              {BUSINESS_PHONE}
            </a>
            .
          </>
        )}
      </div>
    </footer>
  );
}
