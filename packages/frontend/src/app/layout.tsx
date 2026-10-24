import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google';
import '../styles/globals.css';
import { AppProviders } from './providers';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
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
    'I’m Austin, a web designer in Smiths Station, AL. I design and write websites for local businesses around Columbus, Phenix City, Auburn and Opelika.',
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
    title: 'Hi, I’m Austin. I build websites for local businesses.',
    description:
      'Web design from Smiths Station, AL. Glad to meet in person around Columbus, Phenix City and Auburn, or by video if you’re farther out.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Soft Systems Studio: You built the business. I’ll build the website.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hi, I’m Austin. I build websites for local businesses.',
    description:
      'Websites designed and written for local businesses around Columbus, Phenix City and Auburn, by a neighbor in Smiths Station, AL.',
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
