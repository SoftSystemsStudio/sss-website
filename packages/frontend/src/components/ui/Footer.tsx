import React from 'react';
import Link from 'next/link';
import { SERVICE_AREA_LABEL, BUSINESS_PHONE, CONTACT_EMAIL } from '@/lib/business';

const FOOTER_NAV = [
  { label: 'Work', href: '/#portfolio' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/about' },
  { label: 'Get a quote', href: '/intake' },
];

export default function Footer() {
  return (
    <footer className="surface-ink bg-ink text-on-ink">
      <div className="mx-auto max-w-page px-5 pb-10 sm:px-8 lg:px-20">
        <div className="flex flex-col gap-10 border-t border-paper/20 pt-12 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-md flex-col gap-3">
            <Link href="/" className="font-serif text-[28px] text-paper">
              Soft Systems Studio
            </Link>
            <p className="text-[15px] leading-relaxed">
              Websites for local businesses in {SERVICE_AREA_LABEL}.
              {BUSINESS_PHONE && (
                <>
                  {' '}
                  Call{' '}
                  <a href={`tel:${BUSINESS_PHONE}`} className="text-paper underline">
                    {BUSINESS_PHONE}
                  </a>
                  .
                </>
              )}
              {/* TODO(Austin): once a business phone number exists, set BUSINESS_PHONE
                  in src/lib/business.ts (E.164 format) — this line and the
                  LocalBusiness schema pick it up automatically. Do not hardcode a
                  number here. */}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[15px] text-paper underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-8 gap-y-3 text-[15px] font-medium"
          >
            {FOOTER_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-paper hover:text-on-ink">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-3 text-sm sm:flex-row sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Soft Systems Studio LLC</span>
          <span className="flex gap-6">
            <Link href="/privacy" className="hover:text-paper">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-paper">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
