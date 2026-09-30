import type { Metadata } from 'next';
import IntakeForm from './intake-form';

export const metadata: Metadata = {
  title: 'Get a Free Quote',
  description:
    'Get a quote for a $997 flat website build or a Care Plan, from a web designer in Smiths Station, AL. In person around Columbus, Phenix City and Auburn, or anywhere by video.',
  alternates: { canonical: '/intake' },
};

export default function IntakePage() {
  return <IntakeForm />;
}
