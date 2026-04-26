import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: Variant;
  readonly size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-[var(--accent-foreground)] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none',
  secondary:
    'bg-transparent border border-border text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:pointer-events-none',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className = '', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    />
  );
});
