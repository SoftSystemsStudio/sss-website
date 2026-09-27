'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

interface InteractiveFAQProps {
  faqs: FAQ[];
}

export default function InteractiveFAQ({ faqs }: InteractiveFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search questions..."
          className="w-full px-4 py-3 bg-white/70 border border-brand-ink/15 text-brand-ink placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-lime rounded-md transition-colors"
        />
        {searchTerm && (
          <p className="text-xs text-brand-muted mt-2">
            Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className={`border rounded-md overflow-hidden transition-colors ${
                isOpen
                  ? 'border-brand-lime bg-white'
                  : 'border-brand-ink/10 bg-white/50 hover:border-brand-ink/25'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className={`text-xs font-semibold mt-1 tabular-nums ${
                      isOpen ? 'text-brand-lime' : 'text-brand-muted'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className={`sss-display font-semibold text-lg leading-snug ${
                      isOpen ? 'text-brand-ink' : 'text-brand-ink-soft'
                    }`}
                  >
                    {faq.question}
                  </h3>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-brand-muted shrink-0"
                  aria-hidden
                >
                  ▾
                </motion.span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pl-12">
                      <p className="text-brand-muted leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {filteredFaqs.length === 0 && (
        <p className="text-center py-12 text-brand-muted">No matching questions found</p>
      )}
    </div>
  );
}
