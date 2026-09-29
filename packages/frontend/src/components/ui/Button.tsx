import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'outline';
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
  sm: 'h-[46px] px-[22px] text-[15px]',
  md: 'h-[52px] px-7 text-base',
  lg: 'h-[58px] px-8 text-[17px]',
};

const variantClasses: Record<ButtonVariant, string> = {
  // Ink (river green) is the default action colour on light backgrounds
  primary: 'bg-ink text-paper font-semibold hover:bg-[#23443C]',
  // Sun is reserved for the main action on ink sections
  accent: 'bg-sun text-ink font-bold hover:bg-[#F5CD55]',
  secondary: 'bg-limestone text-ink font-semibold hover:bg-[#DDDFD6]',
  ghost: 'text-ink font-semibold underline underline-offset-[6px] hover:text-ink-soft',
  outline: 'border-[1.5px] border-ink text-ink font-semibold hover:bg-ink hover:text-paper',
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
    'inline-flex items-center justify-center rounded transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
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
