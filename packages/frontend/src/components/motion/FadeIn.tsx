'use client';

import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Kept for API compat; CSS animation always completes to visible. */
  once?: boolean;
  amount?: number;
}

/**
 * Entrance animation via CSS only. Framer Motion + useInView previously left
 * homepage sections stuck at opacity:0 when IntersectionObserver missed
 * (overflow-x-hidden parents). CSS keyframes always finish at opacity:1.
 */
export default function FadeIn({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  direction = 'up',
}: FadeInProps) {
  const from =
    direction === 'up'
      ? 'translate3d(0, 24px, 0)'
      : direction === 'down'
        ? 'translate3d(0, -24px, 0)'
        : direction === 'left'
          ? 'translate3d(24px, 0, 0)'
          : direction === 'right'
            ? 'translate3d(-24px, 0, 0)'
            : 'none';

  return (
    <div
      className={className}
      style={{
        animation: `sss-fade-in ${duration}s cubic-bezier(0.25, 0.4, 0.25, 1) ${delay}s both`,
        // Custom property consumed by the keyframes in globals.css
        ['--sss-fade-from' as string]: from,
      }}
    >
      {children}
    </div>
  );
}
