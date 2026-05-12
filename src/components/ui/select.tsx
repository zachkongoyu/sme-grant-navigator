'use client';

import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef, useEffect, useRef, useState } from 'react';

import { fieldInputClass } from '@/components/ui/FormField';

// ── Select ────────────────────────────────────────────────────────────────────
// Bare styled native select — inherits fieldInputClass. Use inside a FormField.

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      {...props}
      className={`${fieldInputClass} ${className}`.trim()}
    >
      {children}
    </select>
  );
});

// ── SelectField ───────────────────────────────────────────────────────────────
// Card-style picker matching SchemeCombobox trigger: rounded-2xl, mono label,
// value row, chevron. Controlled: pass value + onChange + options.

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function SelectField({ label, placeholder = 'Select…', value, onChange, options, className = '' }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left transition hover:border-accent"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{label}</p>
            <p className={`mt-1 truncate text-sm font-semibold ${selected ? 'text-text-primary' : 'text-text-tertiary'}`}>
              {selected?.label ?? placeholder}
            </p>
          </div>
          <svg
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
            className={`h-3.5 w-3.5 shrink-0 text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
        >
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onPointerDown={() => { onChange(o.value); setOpen(false); }}
              className="cursor-pointer px-4 py-3 text-sm transition hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]"
              style={o.value === value ? { color: 'var(--accent)' } : undefined}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── NumberField ───────────────────────────────────────────────────────────────
// Card-style number input matching SelectField: rounded-2xl, mono label, value inline.

type NumberFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function NumberField({ label, value, onChange, className = '', ...props }: NumberFieldProps) {
  return (
    <div className={`rounded-2xl border border-border bg-surface px-4 py-3 focus-within:border-accent transition ${className}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
        className="mt-1 w-full bg-transparent text-sm font-semibold text-text-primary placeholder:font-normal placeholder:text-text-tertiary focus:outline-none"
      />
    </div>
  );
}
