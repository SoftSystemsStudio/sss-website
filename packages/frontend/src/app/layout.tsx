import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Syne, Source_Sans_3 } from 'next/font/google';
import '../styles/globals.css';
import { AppProviders } from './providers';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
  weight: ['500', '600', '700', '800'],
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://softsystemsstudiollc.com'),
  title: {
    default: 'Soft Systems Studio — Websites for Local Businesses',
    template: '%s | Soft Systems Studio',
  },
  description:
    'A flat $997 website build for service businesses in Phenix City & Smiths Station, AL, and Columbus, GA. Care Plans from $150/month.',
  keywords: [
    'website design Phenix City AL',
    'web designer Columbus GA',
    'local business website builder',
    'Smiths Station AL web design',
    'service business website',
    'affordable website build',
    'website retainer plan',
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
    title: 'Websites for Local Businesses | Soft Systems Studio',
    description:
      'A flat $997 website build for service businesses near Phenix City, AL and Columbus, GA. Care Plans from $150/month.',
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
    <html lang="en" className={`${syne.variable} ${sourceSans.variable}`}>
      <body className="antialiased min-h-screen sss-paper text-brand-ink selection:bg-brand-lime-wash selection:text-brand-ink">
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
