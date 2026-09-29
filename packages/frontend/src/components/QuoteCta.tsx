import { Button, Section } from '@/components/ui';
import { CONTACT_EMAIL } from '@/lib/business';

/**
 * The closing call to action shared by the homepage, About and trade pages.
 * Sits directly above <Footer />. `href` lets trade pages prefill the form.
 */
export default function QuoteCta({ href = '/intake' }: { href?: string }) {
  return (
    <Section className="surface-ink bg-ink py-24 text-paper lg:pb-24 lg:pt-[120px]">
      <h2 className="reveal font-serif text-[56px] leading-[0.92] tracking-[-0.015em] sm:text-[88px] lg:text-[120px]">
        Tell me about
        <br />
        <em>your business.</em>
      </h2>
      <div className="reveal mt-14 flex flex-col gap-8 lg:mt-24 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-xl leading-normal text-on-ink">
          About five minutes. I reply within 24 hours.
        </p>
        <div className="flex flex-col gap-5 sm:flex-row-reverse sm:items-center sm:gap-8">
          <Button as="link" href={href} variant="accent" size="lg">
            Start your quote
            <span className="nudge ml-2" aria-hidden="true">
              →
            </span>
          </Button>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="link-underline self-start text-base text-on-ink hover:text-paper sm:self-auto"
          >
            or email {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </Section>
  );
}
