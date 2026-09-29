interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Plain <details> disclosure list: server-rendered (so the answers are in the
 * HTML that FAQSchema describes), keyboard accessible, no JavaScript.
 */
export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="border-t border-ink">
      {faqs.map((faq) => (
        <details key={faq.question} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <svg
              className="mt-1 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </summary>
          <p className="-mt-2 max-w-2xl pb-6 text-[17px] leading-relaxed text-ink-soft">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
