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
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(92,182,255,0.12),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-2xl saturate-140 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(255,255,255,0.2),rgba(255,255,255,0)_34%),radial-gradient(circle_at_86%_14%,rgba(120,210,255,0.18),rgba(120,210,255,0)_36%),radial-gradient(circle_at_54%_90%,rgba(255,170,210,0.14),rgba(255,170,210,0)_44%)]" />
        <div className="absolute -left-12 top-0 h-full w-1/2 rotate-6 bg-[linear-gradient(100deg,rgba(255,255,255,0.34),rgba(255,255,255,0.08)_48%,rgba(255,255,255,0))] blur-md" />
        <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0))]" />
      </div>

      <p className="relative z-10 font-mono text-xs uppercase tracking-[0.28em] text-text-primary/80">
        Quick Stats
      </p>
      <div className="relative z-10 mt-5 space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between gap-4 border-b border-white/18 pb-3 last:border-b-0 last:pb-0"
          >
            <span className="text-sm text-text-primary/75">{stat.label}</span>
            <span className="font-mono text-sm text-text-primary">{stat.value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}