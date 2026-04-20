interface QuickStat {
  readonly label: string;
  readonly value: string;
}

interface QuickStatsProps {
  readonly stats: ReadonlyArray<QuickStat>;
  readonly className?: string;
}

export function QuickStats({ stats, className = '' }: QuickStatsProps) {
  return (
    <aside
      className={`rounded-lg border border-border bg-surface/80 p-5 shadow-ambient backdrop-blur-sm ${className}`}
    >
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-text-tertiary">
        Quick Stats
      </p>
      <div className="mt-5 space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0"
          >
            <span className="text-sm text-text-secondary">{stat.label}</span>
            <span className="font-mono text-sm text-accent">{stat.value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}