import type { Metadata } from 'next';
import GreenBenchDemo from './green-bench-demo';

export const metadata: Metadata = {
  title: 'Demo: Green Bench Lawn & Landscape',
  description:
    'A made-up lawn care company I designed to show off a site that puts finished yards first. The lawns look great, but the business isn’t real.',
  alternates: { canonical: '/demo/green-bench' },
};

export default function Page() {
  return <GreenBenchDemo />;
}
