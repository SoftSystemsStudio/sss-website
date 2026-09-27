'use client';

import React, { Children, isValidElement, cloneElement, ReactElement } from 'react';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  amount?: number;
}

/**
 * Staggered entrance via CSS only — see FadeIn for why we left Framer Motion.
 */
export default function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        return (
          <div
            style={{
              animation: `sss-fade-in 0.5s cubic-bezier(0.25, 0.4, 0.25, 1) ${index * staggerDelay}s both`,
              ['--sss-fade-from' as string]: 'translate3d(0, 20px, 0)',
            }}
          >
            {cloneElement(child as ReactElement)}
          </div>
        );
      })}
    </div>
  );
}
