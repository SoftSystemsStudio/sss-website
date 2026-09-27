import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface ButtonAsButton extends ButtonBaseProps {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: never;
}

interface ButtonAsLink extends ButtonBaseProps {
  as: 'link';
  href: string;
  type?: never;
  onClick?: never;
}

interface ButtonAsAnchor extends ButtonBaseProps {
  as: 'anchor';
  href: string;
  type?: never;
  onClick?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-10 text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-lime text-white font-semibold hover:bg-brand-lime-bright focus:ring-2 focus:ring-brand-lime focus:ring-offset-2 focus:ring-offset-brand-paper',
  secondary:
    'bg-brand-ink text-brand-paper-elevated font-medium hover:bg-brand-ink-soft focus:ring-2 focus:ring-brand-ink focus:ring-offset-2 focus:ring-offset-brand-paper',
  ghost:
    'border border-brand-ink/20 text-brand-ink font-medium hover:border-brand-ink hover:bg-brand-ink/5 focus:ring-2 focus:ring-brand-ink/30',
  outline:
    'border border-brand-ink/25 text-brand-ink font-medium bg-transparent hover:border-brand-lime hover:text-brand-lime focus:ring-2 focus:ring-brand-lime',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  // eslint-disable-next-line security/detect-object-injection -- size and variant are typed unions, not user input
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (props.as === 'link') {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  if (props.as === 'anchor') {
    return (
      <a href={props.href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
