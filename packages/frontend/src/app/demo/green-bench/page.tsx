import type { Metadata } from 'next';
import GreenBenchDemo from './green-bench-demo';

export const metadata: Metadata = {
  title: 'Demo: Green Bench Lawn & Landscape',
  description:
    'A made-up lawn care company I designed to show what a site that puts finished yards first could look like. Not a real business.',
  alternates: { canonical: '/demo/green-bench' },
};

export default function Page() {
  return <GreenBenchDemo />;
}
