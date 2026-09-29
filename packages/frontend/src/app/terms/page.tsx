import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/ui';
import {
  BUILD_FEE,
  BUILD_ONLY_HOSTING_DAYS,
  BUILD_REVISION_ROUNDS,
  CARE_PLANS,
  CONTACT_EMAIL,
} from '@/lib/business';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Soft Systems Studio LLC.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h1 className="mb-10 font-serif text-[48px] leading-none tracking-[-0.015em] sm:text-[64px]">
          Terms of Service
        </h1>
        <div className="space-y-6 text-[17px] leading-relaxed text-ink-soft">
          <p>
            <strong className="text-ink">Last updated:</strong> September 2026
          </p>
          <p>
            By using Soft Systems Studio LLC services, you agree to these terms. Please read them
            carefully.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Services</h2>
          <p>
            We provide website builds and monthly website Care Plans. Both have fixed prices, set
            out below.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Website Build</h2>
          <p>
            A flat {BUILD_FEE} one-time fee. It includes a custom one-page website, the site copy,{' '}
            {BUILD_REVISION_ROUNDS} rounds of revisions before launch, and launch on your domain.
            You register the domain in your own name and pay its registration fee. Extra revision
            rounds, additional pages, online booking or payments, e-commerce, logo design, and email
            inboxes are not included, and are quoted before any work starts.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Care Plans</h2>
          <p>
            Optional monthly plans covering hosting, uptime monitoring, email support, and edits to
            your site:{' '}
            {CARE_PLANS.map((p) => `${p.name} ${p.price}/month (${p.editHours} hours)`).join(', ')}.
            Unused hours do not roll over to the next month. Work beyond your plan&apos;s hours is
            quoted before it starts.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Hosting Without a Care Plan
          </h2>
          <p>
            If you don&apos;t have a Care Plan, or cancel one, we hand over your site files and help
            point your domain to the host of your choice. Your site stays on our hosting for{' '}
            {BUILD_ONLY_HOSTING_DAYS} days after launch (or after cancellation) while you move it.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>The website build fee is due upfront before work begins</li>
            <li>Care Plan fees are billed monthly in advance</li>
            <li>All payments are processed via Stripe</li>
          </ul>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Cancellation</h2>
          <p>
            You may cancel a Care Plan at any time. No refunds for partial months. The website build
            fee is non-refundable once work has begun.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Intellectual Property
          </h2>
          <p>
            Upon full payment, you own the final deliverables. We retain rights to reusable code,
            frameworks, and tools used in development.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Warranties and Disclaimers
          </h2>
          <p>
            We provide services &quot;as-is&quot; without warranty. We are not liable for indirect
            damages, lost profits, or consequential damages.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of our services after changes
            constitutes acceptance.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Contact</h2>
          <p>
            Questions? Email us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
