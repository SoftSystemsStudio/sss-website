'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Replaces the root layout (and its fonts), so styles are inline and self-contained.
  return (
    <html lang="en">
      <body
        style={{ margin: 0, background: '#F7F7F3', color: '#17312B', fontFamily: 'Georgia, serif' }}
      >
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 56, fontWeight: 400, lineHeight: 1, margin: 0 }}>
            Something <em>went wrong.</em>
          </h1>
          <p
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 18,
              color: '#3F4B46',
              margin: '20px 0 40px',
            }}
          >
            Try loading the page again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 52,
              padding: '0 28px',
              border: 0,
              borderRadius: 4,
              background: '#17312B',
              color: '#F7F7F3',
              fontFamily: 'system-ui, sans-serif',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
