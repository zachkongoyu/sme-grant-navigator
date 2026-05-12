interface GenerateButtonProps {
  label?: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function GenerateButton({ label = 'Generate', loading, disabled, onClick }: GenerateButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--accent-foreground)', borderTopColor: 'transparent' }}
            aria-hidden="true"
          />
          Generating…
        </>
      ) : (
        <>
          {label}
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path d="M4 10h12M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </>
      )}
    </button>
  );
}
