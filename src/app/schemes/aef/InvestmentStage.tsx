'use client';

import React, { useState, useRef, useEffect } from 'react';

function InfoPopover({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <span ref={ref} className="relative inline-flex items-center gap-1">
      <span className="font-mono text-xl font-semibold text-text-primary">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center justify-center rounded-full p-1 transition hover:bg-surface"
        aria-label={`${label} 說明`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 text-text-tertiary opacity-40 transition group-hover:opacity-70"
        >
          <path d="M10.8,6h2.4V8.4H10.8Zm0,4.8h2.4V18H10.8ZM12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm0,21.6A9.6,9.6,0,1,1,21.6,12,9.62,9.62,0,0,1,12,21.6Z" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-border bg-background p-4 shadow-lg">
          <p className="text-xs leading-5 text-text-secondary">{description}</p>
        </div>
      )}
    </span>
  );
}

export default function InvestmentStage() {
  return (
    <div className="flex items-center gap-2">
      <InfoPopover
        label="開發階段"
        description="種子輪／天使輪。企業通常處於概念驗證或產品開發初期，需要資金將想法轉化為實際業務。"
      />
      <span className="text-text-tertiary text-xl">|</span>
      <InfoPopover
        label="成長階段"
        description="A輪、B輪、C輪。企業已驗證商業模式並具備穩定收入，需要資金擴大市場規模及加速發展。"
      />
      <span className="text-text-tertiary text-xl">|</span>
      <InfoPopover
        label="成熟階段"
        description="D輪、E輪及IPO前期。企業已達相當規模，正進行上市準備或進行策略性擴張。"
      />
    </div>
  );
}
