import type { Metadata } from 'next';

// The demo businesses are fictional, so search engines are told to leave
// every /demo/* page out of their index (compliance audit 2026-10-31, item 11).
// They're also left out of app/sitemap.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The demo sites are self-contained designs with their own fonts. They depend
 * on the heading rules scoped to `.sss-demo` in styles/globals.css, so every
 * demo renders inside this wrapper.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <div className="sss-demo">{children}</div>;
}
