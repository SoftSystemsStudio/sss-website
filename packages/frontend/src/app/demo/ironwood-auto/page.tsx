import type { Metadata } from 'next';
import IronwoodAutoDemo from './ironwood-auto-demo';

export const metadata: Metadata = {
  title: 'Demo: Ironwood Auto & Tire',
  description:
    'A made-up auto repair shop I designed to show a site built for people who need to call a mechanic today. Not a real business.',
  alternates: { canonical: '/demo/ironwood-auto' },
};

export default function Page() {
  return <IronwoodAutoDemo />;
}
