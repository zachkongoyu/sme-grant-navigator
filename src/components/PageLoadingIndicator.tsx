interface PageLoadingIndicatorProps {
  readonly variant?: 'inline' | 'top-bar' | 'scrim';
  readonly label?: string;
}

export function PageLoadingIndicator({
  variant = 'top-bar',
  label = 'Loading...',
}: PageLoadingIndicatorProps) {
  if (variant === 'scrim') {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-background/38 backdrop-blur-[1.5px]"
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-border/70">
          <div className="h-full w-1/3 bg-accent/90 shadow-[0_0_12px_rgba(255,255,255,0.35)] animate-[route-loading-slide_1.2s_cubic-bezier(0.16,1,0.3,1)_infinite]" />
        </div>

        <div className="flex h-full items-center justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-border bg-surface/90 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">
              {label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'top-bar') {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50" role="status" aria-live="polite" aria-label={label}>
        <div className="h-px w-full bg-border/70">
          <div className="h-full w-1/3 bg-accent/90 shadow-[0_0_12px_rgba(255,255,255,0.35)] animate-[route-loading-slide_1.2s_cubic-bezier(0.16,1,0.3,1)_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite" aria-label={label}>
      <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">
          {label}
        </span>
      </div>
    </div>
  );
}