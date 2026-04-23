import { type HTMLAttributes } from 'react';

type ChipProps = HTMLAttributes<HTMLSpanElement>;

export function Chip({ className = '', ...props }: ChipProps) {
  return (
    <span
      {...props}
      className={`inline-flex h-6 items-center rounded-md border border-border bg-surface-hover px-2 font-mono text-xs text-text-secondary ${className}`}
    />
  );
}
