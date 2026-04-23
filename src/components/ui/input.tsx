import { type InputHTMLAttributes, forwardRef } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      {...props}
      className={`h-9 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none transition-colors ${className}`}
    />
  );
});
