'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <h1 className="font-serif text-[56px] leading-none tracking-[-0.015em] sm:text-[72px]">
        Something <em>went wrong.</em>
      </h1>
      <p className="mb-10 mt-5 text-lg text-ink-soft">
        Try loading the page again. If it keeps happening, head back to the homepage.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-[52px] items-center justify-center rounded bg-ink px-7 font-semibold text-paper hover:bg-[#23443C]"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex h-[52px] items-center justify-center rounded border-[1.5px] border-ink px-7 font-semibold text-ink hover:bg-ink hover:text-paper"
        >
          Go to the homepage
        </a>
      </div>
    </div>
  );
}
