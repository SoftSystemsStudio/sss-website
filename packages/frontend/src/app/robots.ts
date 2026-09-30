import type { MetadataRoute } from 'next';

/**
 * Search and AI crawlers named explicitly so it's clear they're welcome:
 * AI answers (ChatGPT, Claude, Perplexity, Google AI Overviews, Apple) can
 * only recommend the studio if they can read the site. Every agent gets the
 * same rules as `*`.
 */
const CRAWLERS = [
  '*',
  'Googlebot',
  'Bingbot',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Applebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: CRAWLERS,
        // The share image lives under /api/ but link previews need it
        allow: ['/', '/api/og'],
        disallow: ['/api/', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: 'https://softsystemsstudiollc.com/sitemap.xml',
  };
}
