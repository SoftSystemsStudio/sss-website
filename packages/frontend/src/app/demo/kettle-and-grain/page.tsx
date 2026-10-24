import type { Metadata } from 'next';
import KettleAndGrainDemo from './kettle-and-grain-demo';

export const metadata: Metadata = {
  title: 'Demo: Kettle & Grain Coffee Co.',
  description:
    'A made-up coffee shop I designed to put the room, the menu and the hours up front. Not a real business, so sadly, no actual coffee.',
  alternates: { canonical: '/demo/kettle-and-grain' },
};

export default function Page() {
  return <KettleAndGrainDemo />;
}
