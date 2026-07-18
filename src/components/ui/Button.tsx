import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-[#152238] border-transparent',
  secondary: 'bg-surface text-ink border-hairline hover:bg-[#F4F3F0]',
  ghost: 'bg-transparent text-body border-transparent hover:bg-[#F4F3F0]',
  danger: 'bg-danger text-white border-transparent hover:opacity-90',
  success: 'bg-success text-white border-transparent hover:opacity-90',
};

export function Button({ variant = 'primary', children, className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-control border text-[12.5px] font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
