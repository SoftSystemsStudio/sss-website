/* eslint-disable no-restricted-syntax -- env module needs direct process.env access */
import { z } from 'zod';

/**
 * Environment variable schema for frontend (Next.js)
 * All client-side env vars must be prefixed with NEXT_PUBLIC_
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // API URLs (accept with or without protocol prefix)
  NEXT_PUBLIC_API_URL: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return val;
      return val.startsWith('http') ? val : `https://${val}`;
    }),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return val;
      return val.startsWith('http') ? val : `https://${val}`;
    }),

  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Email (server-side only)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),

  // Cron
  CRON_SECRET: z.string().optional(),

  // LiveKit (server-side only — mints tokens for the in-browser voice demo)
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    // Every key read as its own literal `process.env.X` expression, NOT a
    // `{ ...process.env }`/dynamic-key spread. Next.js's client bundler only
    // inlines a NEXT_PUBLIC_* var when it finds that exact literal pattern
    // in the source it's compiling — a spread or computed access defeats
    // that static analysis, so every NEXT_PUBLIC_* value silently came back
    // `undefined` in the browser (server-side Node always has the real
    // process.env, so this only ever broke client code). Real, observed
    // impact before this fix: GA4 never received a measurement ID, the
    // homepage chat widget's apiUrl fell back to localhost in production,
    // and — the bug that surfaced this — providers.tsx's `if
    // (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)` check always took the
    // no-ClerkProvider branch client-side even with a real key configured,
    // crashing /sign-in and /sign-up with "useSession can only be used
    // within the <ClerkProvider /> component." (Clerk's own SDK reads the
    // var via its own correctly-written literal reference, which is why
    // the key itself really was reaching the browser — just not this
    // module's copy of it.) Keep every property here a plain
    // `process.env.LITERAL_NAME`, matching envSchema's keys, if either one
    // changes.
    const raw = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      CRON_SECRET: process.env.CRON_SECRET,
      LIVEKIT_URL: process.env.LIVEKIT_URL,
      LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    };

    // Strip empty-string env vars so .optional() treats them as undefined
    const cleaned: Record<string, string | undefined> = { ...raw };
    for (const [key, val] of Object.entries(cleaned)) {
      if (typeof val === 'string' && val.trim() === '') {
        // eslint-disable-next-line security/detect-object-injection -- key is from Object.entries of own properties
        delete cleaned[key];
      }
    }
    return envSchema.parse(cleaned);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:', error.format());
      // In browser, we can't exit, just log
      if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }
    throw error;
  }
}

// Lazy validation for compatibility with Next.js
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

// Default export for convenience
const env = getEnv();
export default env;
