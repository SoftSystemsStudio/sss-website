import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '../fonts/fallbacks.css';
import '../styles/globals.css';

// Fonts are self-hosted (src/fonts, latin subset, OFL) so the build never
// downloads from Google Fonts. scripts/fetch-fonts.mjs refreshes the files.
// fallbacks.css holds every family's metric-matched fallback face, demos too.
const sans = localFont({
  src: [
    {
      path: '../fonts/instrument-sans/instrument-sans-latin-normal.woff2',
      weight: '400 700',
      style: 'normal',
    },
  ],
  display: 'swap',
  // Metric-matched fallback from src/fonts/fallbacks.css.
  adjustFontFallback: false,
  fallback: ['Instrument Sans Fallback'],
  variable: '--font-sans',
});

const serif = localFont({
  src: [
    {
      path: '../fonts/cormorant-garamond/cormorant-garamond-latin-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/cormorant-garamond/cormorant-garamond-latin-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/cormorant-garamond/cormorant-garamond-latin-italic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/cormorant-garamond/cormorant-garamond-latin-italic.woff2',
      weight: '600',
      style: 'italic',
    },
  ],
  display: 'swap',
  // Metric-matched fallback from src/fonts/fallbacks.css.
  adjustFontFallback: false,
  fallback: ['Cormorant Garamond Fallback'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://softsystemsstudiollc.com'),
  title: {
    default: 'Soft Systems Studio | Web Design in Columbus, Phenix City & Auburn',
    template: '%s | Soft Systems Studio',
  },
  description:
    'Hey, I’m Austin. From right here in Smiths Station, AL, I design and write websites for local businesses around Columbus, Phenix City, Auburn and Opelika.',
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
      'A web designer in Smiths Station, AL. Happy to meet in person around Columbus, Phenix City and Auburn, or over video if you’d rather skip the drive.',
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
      <body className="min-h-screen bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
