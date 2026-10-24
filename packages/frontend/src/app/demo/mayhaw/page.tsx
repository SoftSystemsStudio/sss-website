import type { Metadata } from 'next';
import MayhawDemo from './mayhaw-demo';

export const metadata: Metadata = {
  title: 'Demo: Mayhaw Flower Studio',
  description:
    'A made-up flower shop I designed to show a site where people shop by occasion, from birthdays to sympathy. Not a real business.',
  alternates: { canonical: '/demo/mayhaw' },
};

export default function Page() {
  return <MayhawDemo />;
}
