import { type ReactNode, type TextareaHTMLAttributes } from 'react';

interface LabeledTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Label text displayed above the textarea. */
  label: ReactNode;
  /** Optional node appended after the label text, e.g. a required asterisk or "(optional)" note. */
  labelSuffix?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** When provided, shows a character counter below the textarea. */
  counterMax?: number;
  /** Extra className applied to the outer wrapper div. */
  wrapperClassName?: string;
}

export function LabeledTextarea({
  label,
  labelSuffix,
  value,
  onChange,
  counterMax,
  wrapperClassName,
  className,
  ...props
}: LabeledTextareaProps) {
  return (
    <div className={wrapperClassName}>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
        {label}
        {labelSuffix ? <>{' '}{labelSuffix}</> : null}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none${className ? ` ${className}` : ''}`}
        {...props}
      />
      {counterMax !== undefined && (
        <p className="mt-1 text-right font-mono text-[10px] text-text-tertiary">
          {value.length.toLocaleString()} / {counterMax.toLocaleString()}
        </p>
      )}
    </div>
  );
}
