/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-misused-promises -- Form handlers are async and API responses need runtime validation */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

const fieldClass =
  'w-full px-4 py-3 bg-white border border-brand-ink/15 rounded-md focus:outline-none focus:border-brand-lime transition-colors text-brand-ink placeholder:text-brand-muted/60';

export default function IntakeForm() {
  const [form, setForm] = useState<FormState>(initialForm);
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
      <div className="min-h-screen sss-paper text-brand-ink flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="w-14 h-14 bg-brand-lime/15 text-brand-lime rounded-md flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
            ✓
          </div>
          <h1 className="sss-display text-3xl font-extrabold mb-4">Thank You!</h1>
          <p className="text-brand-muted mb-6">
            We&apos;ve received your request. You&apos;ll hear from us within 24 hours to schedule a
            quick call and discuss your project.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-brand-lime text-white font-semibold rounded-md hover:bg-brand-lime-bright transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sss-paper text-brand-ink">
      <header className="border-b border-brand-ink/10 bg-brand-paper-elevated/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="sss-display text-lg font-semibold">
            Soft Systems Studio
          </Link>
          <Link
            href="/"
            className="text-sm text-brand-muted hover:text-brand-ink transition-colors"
          >
            &larr; Back to site
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-12">
          <h1 className="sss-display text-4xl md:text-5xl font-extrabold mb-3">
            Get Your Free Quote
          </h1>
          <p className="text-lg text-brand-muted max-w-xl">
            Tell us about your business and we&apos;ll get back to you within 24 hours with a custom
            quote.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white/60 border border-brand-ink/10 rounded-md p-6 md:p-8">
            <h2 className="sss-display text-xl font-bold mb-6">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-brand-ink-soft mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className={fieldClass}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink-soft mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  className={fieldClass}
                  placeholder="Smith Plumbing LLC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink-soft mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={fieldClass}
                  placeholder="john@smithplumbing.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink-soft mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={fieldClass}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </section>

          <section className="bg-white/60 border border-brand-ink/10 rounded-md p-6 md:p-8">
            <h2 className="sss-display text-xl font-bold mb-6">About Your Business</h2>
            <label className="block text-sm font-medium text-brand-ink-soft mb-2">
              What type of business do you run?
            </label>
            <select
              value={form.businessType}
              onChange={(e) => update('businessType', e.target.value)}
              className={fieldClass}
            >
              <option value="">Select your industry...</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </section>

          <section className="bg-white/60 border border-brand-ink/10 rounded-md p-6 md:p-8">
            <h2 className="sss-display text-xl font-bold mb-6">What are you interested in? *</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {SERVICES.map((service) => {
                const isSelected = form.serviceInterest === service.key;
                return (
                  <button
                    key={service.key}
                    type="button"
                    onClick={() => update('serviceInterest', service.key)}
                    className={`p-5 rounded-md border-2 text-left transition-colors ${
                      isSelected
                        ? 'border-brand-lime bg-brand-lime-wash/40'
                        : 'border-brand-ink/10 hover:border-brand-ink/25 bg-white/40'
                    }`}
                  >
                    <div className="font-semibold mb-1">{service.name}</div>
                    <div className="text-brand-lime font-bold mb-1">{service.price}</div>
                    <div className="text-sm text-brand-muted">{service.description}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-white/60 border border-brand-ink/10 rounded-md p-6 md:p-8">
            <h2 className="sss-display text-xl font-bold mb-6">Tell Us More</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brand-ink-soft mb-2">
                  What&apos;s your biggest challenge right now?
                </label>
                <textarea
                  value={form.biggestChallenge}
                  onChange={(e) => update('biggestChallenge', e.target.value)}
                  rows={4}
                  className={`${fieldClass} resize-none`}
                  placeholder="e.g., No professional website, outdated site that doesn’t convert, need help keeping content current..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink-soft mb-2">
                  How did you hear about us?
                </label>
                <input
                  type="text"
                  value={form.howDidYouHear}
                  onChange={(e) => update('howDidYouHear', e.target.value)}
                  className={fieldClass}
                  placeholder="Google, referral, social media..."
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-brand-lime text-white font-semibold rounded-md hover:bg-brand-lime-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Get My Free Quote'}
            </button>
            <p className="mt-4 text-sm text-brand-muted">
              We&apos;ll respond within 24 hours. No spam, ever.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
