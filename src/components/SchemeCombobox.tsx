'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useRouter } from 'next/navigation';

import { PageLoadingIndicator } from '@/components/PageLoadingIndicator';

interface SchemeOption {
  id: string;
  name: string;
}

interface SchemeComboboxProps {
  readonly schemes: ReadonlyArray<SchemeOption>;
  readonly selectedId: string;
  /** Route base used when navigating to a different scheme. Defaults to '/draft'. */
  readonly basePath?: string;
  /** Label shown above the selected scheme name. Defaults to 'Drafting for'. */
  readonly label?: string;
}

export function SchemeCombobox({ schemes, selectedId, basePath = '/draft', label = 'Drafting for' }: SchemeComboboxProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pendingSchemeId, setPendingSchemeId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = schemes.find((s) => s.id === selectedId);

  const filtered = query.trim()
    ? schemes.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()),
      )
    : schemes;

  const isNavigating = pendingSchemeId !== null && pendingSchemeId !== selectedId;

  // Scroll active item into view
  useEffect(() => {
    if (!open) return;
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  function pickScheme(id: string) {
    if (id === selectedId) {
      setOpen(false);
      setQuery('');
      return;
    }

    flushSync(() => {
      setOpen(false);
      setQuery('');
      setPendingSchemeId(id);
    });

    router.replace(`${basePath}?scheme=${id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) pickScheme(target.id);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm" aria-busy={isNavigating}>
      {isNavigating && <PageLoadingIndicator variant="scrim" label="Switching scheme..." />}

      {/* Trigger / search input */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setActiveIndex(0);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left transition hover:border-accent disabled:cursor-wait disabled:opacity-70"
        disabled={isNavigating}
        hidden={open}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-text-primary">
              {selected?.name ?? 'Select a scheme'}
            </p>
          </div>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5 shrink-0 text-text-tertiary">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>

      {/* Search + dropdown */}
      {open && (
        <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5 shrink-0 text-text-tertiary" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" />
              <path d="m11 11 2.5 2.5" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search schemes…"
              disabled={isNavigating}
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => { setOpen(false); setQuery(''); }}
              disabled={isNavigating}
              className="shrink-0 font-mono text-[10px] text-text-tertiary transition hover:text-text-primary"
            >
              Esc
            </button>
          </div>

          <ul
            ref={listRef}
            role="listbox"
            className="max-h-72 overflow-y-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-text-tertiary">No schemes match.</li>
            )}
            {filtered.map((scheme, i) => {
              const isActive = i === activeIndex;
              const isCurrent = scheme.id === selectedId;

              return (
                <li
                  key={scheme.id}
                  role="option"
                  aria-selected={isCurrent}
                  onPointerDown={() => pickScheme(scheme.id)}
                  onPointerEnter={() => setActiveIndex(i)}
                  className="flex cursor-pointer items-center px-4 py-3 transition"
                  style={isActive ? { backgroundColor: 'color-mix(in srgb, var(--accent) 6%, transparent)' } : undefined}
                >
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${isCurrent ? 'text-accent' : 'text-text-primary'}`}>
                      {scheme.name}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
