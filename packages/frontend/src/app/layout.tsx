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
    default: 'Soft Systems Studio | Web Design in Columbus, Phenix City & Auburn',
    template: '%s | Soft Systems Studio',
  },
  description:
    'Custom websites for local businesses in Columbus, Phenix City, Auburn and Opelika, from a web designer in Smiths Station, AL. Websites from $997, priced by the size of the site. Care Plans from $150/month.',
  keywords: [
    'web designer Columbus GA',
    'web design Phenix City AL',
    'website design Auburn AL',
    'web designer Opelika AL',
    'web design Smiths Station AL',
    'small business website design',
    'local business website',
    'small business website pricing',
    'website care plan',
  ],
  authors: [{ name: 'Soft Systems Studio LLC' }],
  creator: 'Soft Systems Studio LLC',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://softsystemsstudiollc.com',
    siteName: 'Soft Systems Studio',
    title: 'Web Design for Local Businesses | Soft Systems Studio',
    description:
      'Custom websites for local businesses around Columbus, Phenix City and Auburn, and anywhere else by video. From $997, designed and written by one person.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Soft Systems Studio: web design for local businesses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Design for Local Businesses | Soft Systems Studio',
    description:
      'Websites for local businesses from $997, from a web designer in Smiths Station, AL. Care Plans from $150/month.',
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
