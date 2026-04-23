import { type HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-lg border border-border bg-surface p-6 ${className}`}
    />
  );
}
