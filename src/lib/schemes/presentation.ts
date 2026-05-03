import type { CSSProperties } from 'react';

import type { SchemeStatus } from '@/types';

export function formatFundingAmount(
  amount: number | null,
  currency: string | null = 'HKD',
): string {
  if (amount === null) return 'Varies';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'HKD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSchemeStatusText(status: SchemeStatus): string {
  return status === 'coming-soon' ? 'Soon' : status.replace('-', ' ');
}

export function getSchemeStatusBadgeStyle(status: SchemeStatus): CSSProperties {
  if (status === 'open') {
    return {
      borderColor: 'color-mix(in srgb, var(--success) 40%, transparent)',
      backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)',
      color: 'var(--success)',
    };
  }

  if (status === 'coming-soon') {
    return {
      borderColor: 'color-mix(in srgb, var(--warning) 40%, transparent)',
      color: 'var(--warning)',
    };
  }

  return {
    borderColor: 'var(--border)',
    color: 'var(--text-tertiary)',
  };
}

export function getSchemeStatusDotColor(status: SchemeStatus): string {
  if (status === 'open') return 'var(--success)';
  if (status === 'coming-soon') return 'var(--warning)';
  return 'var(--border-strong)';
}