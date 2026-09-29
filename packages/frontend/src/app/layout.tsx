import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import '../styles/globals.css';
import { AppProviders } from './providers';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://softsystemsstudiollc.com'),
  title: {
    default: 'Soft Systems Studio — Websites for Local Businesses',
    template: '%s | Soft Systems Studio',
  },
  description:
    'Custom websites for local businesses, anywhere. A flat $997 build from a one-person studio based in Phenix City, AL. Care Plans from $150/month.',
  keywords: [
    'website design for local businesses',
    'small business website designer',
    'local business website',
    'service business website',
    'flat price website design',
    'website care plan',
    'web designer Phenix City AL',
    'web designer Columbus GA',
  ],
  authors: [{ name: 'Soft Systems Studio LLC' }],
  creator: 'Soft Systems Studio LLC',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://softsystemsstudiollc.com',
    siteName: 'Soft Systems Studio',
    title: 'Websites for Local Businesses | Soft Systems Studio',
    description:
      'Custom websites for local businesses, anywhere. A flat $997 build, designed and written by one person. Care Plans from $150/month.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Soft Systems Studio - Websites for Local Businesses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Websites for Local Businesses | Soft Systems Studio',
    description:
      'A flat $997 website build for local service businesses. Care Plans from $150/month.',
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink">
        <AppProviders>
          <Suspense>
            <GoogleAnalytics />
          </Suspense>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
