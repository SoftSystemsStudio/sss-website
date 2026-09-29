/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-misused-promises -- Form handlers are async and API responses need runtime validation */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { BUILD_FEE, RETAINER_MIN, RETAINER_RANGE } from '@/lib/business';

type ServiceInterest = 'website' | 'care_plan' | 'website_and_care';

type FormState = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  serviceInterest: ServiceInterest | '';
  biggestChallenge: string;
  howDidYouHear: string;
};

const initialForm: FormState = {
  name: '',
  businessName: '',
  email: '',
  phone: '',
  businessType: '',
  serviceInterest: '',
  biggestChallenge: '',
  howDidYouHear: '',
};

const BUSINESS_TYPES = [
  'Plumbing',
  'HVAC',
  'Electrical',
  'Roofing',
  'Landscaping',
  'Auto Repair',
  'Coffee / Food Service',
  'Florist',
  'Dental Practice',
  'Medical/Med Spa',
  'Legal Services',
  'Real Estate',
  'Other',
];

const SERVICES = [
  {
    key: 'website' as ServiceInterest,
    name: 'Website Build',
    price: BUILD_FEE,
    description: 'Flat one-time build fee',
  },
  {
    key: 'care_plan' as ServiceInterest,
    name: 'Care Plan',
    price: RETAINER_RANGE,
    description: 'Hosting and monthly edits after launch',
  },
  {
    key: 'website_and_care' as ServiceInterest,
    name: 'Website + Care Plan',
    price: `${BUILD_FEE} + from ${RETAINER_MIN}/mo`,
    description: 'Build plus ongoing support',
  },
];

const EYEBROW =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:text-[13px]';
// The legend floats so it sits below the rule instead of on it; the next element clears it.
const FIELDSET = 'mt-12 min-w-0 border-t border-line pt-8 first:mt-0 [&>legend+*]:clear-both';
const LEGEND = 'float-left mb-6 w-full font-serif text-[30px] leading-tight';
const LABEL = 'mb-2 block text-[15px] font-medium text-ink';
const INPUT =
  'w-full rounded border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink';

export default function IntakeForm() {
  const [form, setForm] = useState<FormState>(initialForm);

  // Trade pages link here as /intake?type=<business type> to prefill the dropdown.
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get('type');
    if (type && BUSINESS_TYPES.includes(type)) {
      setForm((prev) => (prev.businessType ? prev : { ...prev, businessType: type }));
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function validate(): string | null {
    if (!form.name.trim()) return 'Please enter your name';
    if (!form.businessName.trim()) return 'Please enter your business name';
    if (!form.email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email';
    if (!form.phone.trim()) return 'Please enter your phone number';
    if (!form.serviceInterest) return 'Please select which service you are interested in';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-md text-center" role="status">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-ink">
            <svg
              className="h-8 w-8 text-sun"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-serif text-[48px] leading-none tracking-[-0.015em] sm:text-[56px]">
            Thanks, <em>I’ve got it.</em>
          </h1>
          <p className="mb-10 mt-5 text-lg leading-relaxed text-ink-soft">
            I’ll reply within 24 hours to set up a quick call about your project.
          </p>
          <Button as="link" href="/" variant="primary" size="md">
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line-soft">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-serif text-[25px] tracking-[-0.01em]">
            Soft Systems Studio
          </Link>
          <Link href="/" className="text-[15px] font-medium text-ink-soft hover:text-ink">
            &larr; Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <p className={`rise ${EYEBROW}`}>Get a quote</p>
        <h1 className="rise mt-5 font-serif text-[52px] [--rise-delay:0.1s] leading-[0.92] tracking-[-0.015em] sm:text-[72px]">
          Tell me about <em>your business.</em>
        </h1>
        <p className="rise mt-6 text-lg leading-relaxed text-ink-soft [--rise-delay:0.2s] sm:text-xl">
          About five minutes. I reply within 24 hours, then we set up a short call.
        </p>

        <form onSubmit={handleSubmit} className="mt-12" noValidate>
          <fieldset className={FIELDSET}>
            <legend className={LEGEND}>Contact details</legend>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className={LABEL}>
                  Your name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className={INPUT}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label htmlFor="businessName" className={LABEL}>
                  Business name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  autoComplete="organization"
                  required
                  value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  className={INPUT}
                  placeholder="Smith Plumbing LLC"
                />
              </div>
              <div>
                <label htmlFor="email" className={LABEL}>
                  Email <span aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={INPUT}
                  placeholder="john@smithplumbing.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className={LABEL}>
                  Phone <span aria-hidden="true">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={INPUT}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className={FIELDSET}>
            <legend className={LEGEND}>Your business</legend>
            <label htmlFor="businessType" className={LABEL}>
              What type of business do you run?
            </label>
            <select
              id="businessType"
              value={form.businessType}
              onChange={(e) => update('businessType', e.target.value)}
              className={INPUT}
            >
              <option value="">Select your industry…</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className={FIELDSET}>
            <legend className={LEGEND}>
              What are you interested in? <span aria-hidden="true">*</span>
            </legend>
            <div className="grid gap-3 md:grid-cols-3">
              {SERVICES.map((service) => (
                <label key={service.key} className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="serviceInterest"
                    value={service.key}
                    checked={form.serviceInterest === service.key}
                    onChange={() => update('serviceInterest', service.key)}
                    className="peer sr-only"
                  />
                  <span className="block h-full rounded-md border-[1.5px] border-line bg-white p-5 transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-ink">
                    <span className="block font-semibold">{service.name}</span>
                    <span className="mt-1 block font-serif text-[26px] leading-tight">
                      {service.price}
                    </span>
                    <span className="mt-2 block text-[15px] opacity-80">{service.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={FIELDSET}>
            <legend className={LEGEND}>Anything else</legend>
            <div className="space-y-6">
              <div>
                <label htmlFor="biggestChallenge" className={LABEL}>
                  What’s your biggest challenge right now?
                </label>
                <textarea
                  id="biggestChallenge"
                  value={form.biggestChallenge}
                  onChange={(e) => update('biggestChallenge', e.target.value)}
                  rows={4}
                  className={`${INPUT} resize-none`}
                  placeholder="e.g., No professional website, outdated site that doesn’t convert, need help keeping content current..."
                />
              </div>
              <div>
                <label htmlFor="howDidYouHear" className={LABEL}>
                  How did you hear about me?
                </label>
                <input
                  id="howDidYouHear"
                  type="text"
                  value={form.howDidYouHear}
                  onChange={(e) => update('howDidYouHear', e.target.value)}
                  className={INPUT}
                  placeholder="Google, referral, social media..."
                />
              </div>
            </div>
          </fieldset>

          {error && (
            <div
              role="alert"
              className="mt-10 rounded-md border border-[#B3261E]/40 bg-[#B3261E]/5 p-4 text-[#8C1D18]"
            >
              {error}
            </div>
          )}

          <div className="mt-10 flex flex-col gap-4 border-t border-ink pt-10 sm:flex-row sm:items-center sm:gap-8">
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? 'Sending…' : 'Get my quote'}
            </Button>
            <p className="text-[15px] text-ink-muted">I’ll reply within 24 hours. No spam, ever.</p>
          </div>
        </form>
      </main>
    </div>
  );
}
