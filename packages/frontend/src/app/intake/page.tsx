import type { Metadata } from 'next';
import IntakeForm from './intake-form';

export const metadata: Metadata = {
  title: 'Get a Free Quote',
  description:
    'Get a quote for a $997 flat website build or a Care Plan. For local businesses anywhere, from a studio based in Phenix City, AL.',
  alternates: { canonical: '/intake' },
};

export default function IntakePage() {
  return <IntakeForm />;
}
