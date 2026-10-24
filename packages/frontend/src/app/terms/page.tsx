import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/ui';
import Link from 'next/link';
import {
  BUILD_ONLY_HOSTING_DAYS,
  BUILD_PACKAGES,
  BUILD_REVISION_ROUNDS,
  CARE_PLANS,
  CONTACT_EMAIL,
  HOME_BASE,
  SECURE_CARE_PLAN_RANGE,
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
            <strong className="text-ink">Last updated:</strong> October 2026
          </p>
          <p>
            These terms are between you and Soft Systems Studio LLC (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;), based in {HOME_BASE}. You agree to them when you accept a quote, pay
            an invoice or payment link, or start a Care Plan. If your written quote says something
            different from these terms, the quote wins for that project. Please read them carefully.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Services</h2>
          <p>
            We provide website builds and monthly website Care Plans. Their prices are set out below
            and on our{' '}
            <Link
              href="/pricing"
              className="text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              pricing page
            </Link>
            .
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Website Build</h2>
          <p>
            Builds are sold as packages, priced by the size of the site:{' '}
            {BUILD_PACKAGES.map(
              (p) =>
                `${p.name} (${p.summary.toLowerCase()}) ${p.quoted ? `from ${p.price}` : p.price}`,
            ).join(', ')}
            . Custom builds are quoted. Before you pay, we send a written quote listing your
            package, any add-ons, the total and the launch date; that quote is the scope of your
            build.
          </p>
          <p>
            Every package includes the site copy, {BUILD_REVISION_ROUNDS} rounds of revisions before
            launch, and launch on your domain. You register the domain in your own name and pay its
            registration fee. Anything not in your package or quote, including extra pages, forms or
            revision rounds, online booking or payments, a store, logo design and email inboxes, is
            quoted before any work starts.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Care Plans</h2>
          <p>
            Optional monthly plans covering hosting, uptime monitoring, email support, and edits to
            your site:{' '}
            {CARE_PLANS.map((p) => `${p.name} ${p.price}/month (${p.editHours} hours)`).join(', ')}.
            Unused hours do not roll over to the next month. Work beyond your plan&apos;s hours is
            quoted before it starts.
          </p>
          <p>
            A site with logins, a store, or forms that collect sensitive information requires a Care
            Plan for as long as it runs on our hosting. That plan also covers security, backups and
            user support, and is quoted with the build (usually {SECURE_CARE_PLAN_RANGE}).
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Hosting Without a Care Plan
          </h2>
          <p>
            If you don&apos;t have a Care Plan, or cancel one, we hand over your site files and help
            point your domain to the host of your choice. Your site stays on our hosting for{' '}
            {BUILD_ONLY_HOSTING_DAYS} days after launch (or after cancellation) while you move it.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Your Part</h2>
          <p>
            You&apos;re responsible for the text, photos, logos and other material you give us, and
            you confirm you own them or have permission to use them on your site. You&apos;re also
            responsible for what your business says and sells on the site, and for keeping your
            domain registration paid. We may decline to publish, or remove, anything that is
            unlawful or infringes someone else&apos;s rights. If someone makes a claim against us
            because of material you provided, you agree to cover our reasonable costs of dealing
            with it.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Timelines and Paused Projects
          </h2>
          <p>
            The launch date in your quote assumes we get your answers, content and feedback when we
            ask for them. If we&apos;re waiting on you, the launch date moves by the same amount. If
            we hear nothing from you for 30 days, we pause the project; after 90 days we may close
            it. Payments already made are kept for the work done, and restarting a closed project
            may need a new quote.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Third-Party Services
          </h2>
          <p>
            Your site relies on services we don&apos;t control, such as hosting, your domain
            registrar, email providers and Stripe. We choose reliable ones, but we aren&apos;t
            responsible for their outages, price changes or policies. Any accounts you hold with
            them are covered by their own terms.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Any build can be paid in full before work begins, or 50% before work begins and 50% at
              launch
            </li>
            <li>
              Your site launches on your domain, and its files are handed over, only once the build
              is paid in full
            </li>
            <li>Care Plan fees are billed monthly in advance</li>
            <li>All payments are processed via Stripe</li>
            <li>
              If a Care Plan payment is more than 14 days late, we may pause edits and support until
              it&apos;s paid. If it&apos;s more than 30 days late, we may end the plan and, after
              giving you 7 days&apos; written notice, take the site off our hosting
            </li>
          </ul>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Cancellation</h2>
          <p>
            You may cancel a Care Plan at any time. No refunds for partial months. Build payments
            (including a 50% deposit) are non-refundable once work has begun. We may also end a
            project or Care Plan with written notice; if we end a build before launch for a reason
            that isn&apos;t yours, we refund what you&apos;ve paid for work not yet done.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Intellectual Property
          </h2>
          <p>
            Upon full payment, you own the final deliverables. We retain rights to reusable code,
            frameworks, and tools used in development, and you get a permanent license to use them
            as part of your site. Material you gave us stays yours. We may show your finished site
            in our portfolio and marketing; tell us if you&apos;d rather we didn&apos;t, and we
            won&apos;t.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Warranties and Disclaimers
          </h2>
          <p>
            We do the work with reasonable care and skill, and fix anything that doesn&apos;t match
            your quote when we deliver it. Beyond that, services are provided &quot;as-is&quot;: we
            don&apos;t promise that a site will be uninterrupted or error-free, or that it will
            bring in a particular amount of traffic, search ranking or sales.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Limitation of Liability
          </h2>
          <p>
            We are not liable for indirect damages, lost profits, lost data or consequential
            damages. Our total liability for any claim connected with our services is limited to the
            amount you paid us in the 12 months before the claim arose. Nothing in these terms
            limits liability that the law doesn&apos;t allow to be limited.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Governing Law and Disputes
          </h2>
          <p>
            These terms are governed by the laws of the State of Alabama. If something goes wrong,
            email us first and we&apos;ll try to sort it out directly. If we can&apos;t, any dispute
            will be handled in the state or federal courts located in Alabama.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Changes to Terms</h2>
          <p>
            We may update these terms, and we&apos;ll change the date at the top when we do. A build
            stays under the terms in place when you accepted its quote. For an ongoing Care Plan, we
            email you about any significant change at least 30 days before it applies; you can
            cancel before then if you don&apos;t agree.
          </p>
          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Privacy</h2>
          <p>
            How we handle your information is set out in our{' '}
            <Link
              href="/privacy"
              className="text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              privacy policy
            </Link>
            .
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
