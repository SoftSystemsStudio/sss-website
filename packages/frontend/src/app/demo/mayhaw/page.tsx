import type { Metadata } from 'next';
import MayhawDemo from './mayhaw-demo';

export const metadata: Metadata = {
  title: 'Demo: Mayhaw Flower Studio',
  description:
    'A fictional florist website, shown as a design example of what Soft Systems Studio can build for an occasion-driven, visual local business. Not a real business.',
  alternates: { canonical: '/demo/mayhaw' },
};

export default function Page() {
  return <MayhawDemo />;
}
