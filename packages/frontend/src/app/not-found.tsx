import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">404</p>
      <h1 className="mt-4 font-serif text-[56px] leading-none tracking-[-0.015em] sm:text-[72px]">
        This page <em>doesn’t exist.</em>
      </h1>
      <p className="mb-10 mt-5 text-lg text-ink-soft">
        The link may be old, or the address may have a typo.
      </p>
      <Button as="link" href="/" variant="primary" size="md">
        Go to the homepage
      </Button>
    </div>
  );
}
