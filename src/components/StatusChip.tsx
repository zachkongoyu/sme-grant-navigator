type StatusChipVariant = 'beta' | 'live' | 'soon';

interface StatusChipProps {
  readonly variant: StatusChipVariant;
  readonly compact?: boolean;
}

const CHIP_STYLES: Record<StatusChipVariant, {
  readonly label: string;
  readonly borderColor: string;
  readonly backgroundColor: string;
  readonly textColor: string;
  readonly showDot: boolean;
  readonly dotColor?: string;
}> = {
  beta: {
    label: 'Beta',
    borderColor: 'color-mix(in srgb, #8b5cf6 34%, transparent)',
    backgroundColor: 'color-mix(in srgb, #8b5cf6 12%, transparent)',
    textColor: '#8b5cf6',
    showDot: false,
  },
  live: {
    label: 'Live',
    borderColor: 'color-mix(in srgb, var(--success) 30%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--success) 8%, transparent)',
    textColor: 'var(--success)',
    showDot: true,
    dotColor: 'var(--success)',
  },
  soon: {
    label: 'Soon',
    borderColor: 'color-mix(in srgb, var(--warning) 30%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--warning) 8%, transparent)',
    textColor: 'var(--warning)',
    showDot: false,
  },
};

export function StatusChip({ variant, compact = false }: StatusChipProps) {
  const chip = CHIP_STYLES[variant];

  return (
    <span
      className={compact
        ? 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em]'
        : 'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]'}
      style={{
        borderColor: chip.borderColor,
        backgroundColor: chip.backgroundColor,
        color: chip.textColor,
      }}
    >
      {chip.showDot && (
        <span
          className="h-1 w-1 animate-pulse rounded-full"
          style={{ backgroundColor: chip.dotColor }}
        />
      )}
      {chip.label}
    </span>
  );
}