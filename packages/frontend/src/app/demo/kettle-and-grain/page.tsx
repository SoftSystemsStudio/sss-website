import type { Metadata } from 'next';
import KettleAndGrainDemo from './kettle-and-grain-demo';

export const metadata: Metadata = {
  title: 'Demo: Kettle & Grain Coffee Co.',
  description:
    'A made-up coffee shop I designed to show a site that lets people see the room, the menu and the hours. Not a real business.',
  alternates: { canonical: '/demo/kettle-and-grain' },
};

export default function Page() {
  return <KettleAndGrainDemo />;
}
