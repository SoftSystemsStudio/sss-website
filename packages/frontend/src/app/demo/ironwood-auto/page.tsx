import type { Metadata } from 'next';
import IronwoodAutoDemo from './ironwood-auto-demo';

export const metadata: Metadata = {
  title: 'Demo: Ironwood Auto & Tire',
  description:
    'A made-up auto shop I designed for people who need a mechanic today, not next week. Nice-looking garage, but not a real business.',
  alternates: { canonical: '/demo/ironwood-auto' },
};

export default function Page() {
  return <IronwoodAutoDemo />;
}
