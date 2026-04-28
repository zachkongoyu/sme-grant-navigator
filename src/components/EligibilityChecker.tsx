'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';

import type { ResolvedScheme } from '@/lib/schemes/db';
import type {
  EligibilityCheckResult,
  EligibilityCriterion,
  EligibilityVerdict,
  EligibilityProgressEvent,
} from '@/lib/api/eligibility-client';
import { runEligibilityCheck } from '@/lib/api/eligibility-client';
import { BackNavigation } from '@/components/navigation';
import { StatusChip } from '@/components/StatusChip';

// ── Types ─────────────────────────────────────────────────────────────────

interface EligibilityCheckerProps {
  readonly scheme: ResolvedScheme;
  readonly backHref: string;
  readonly headerControls?: ReactNode;
}

type Stage = 'compose' | 'checking' | 'done' | 'error';
type FollowupAnswers = Record<string, string>;

interface ProgressEntry {
  key: string;
  kind: 'thinking' | 'compute' | 'output';
  label: string;
  startedAt: number;
  endedAt?: number;
  isReasoning?: boolean; // true = actual reasoning/thinking tokens from the model
  text?: string;   // streaming LLM reasoning text (thinking entries)
  output?: string; // full result (output entries)
}

function formatEventWindow(startedAt: number | undefined, endedAt?: number): string | null {
  if (!startedAt) return null;

  const elapsedMs = Math.max(0, (endedAt ?? Date.now()) - startedAt);
  if (elapsedMs < 1000) return `${elapsedMs} ms`;

  const elapsedSeconds = elapsedMs / 1000;
  if (elapsedSeconds < 10) return `${elapsedSeconds.toFixed(1)} s`;

  return `${Math.round(elapsedSeconds)} s`;
}

// ── Verdict config ────────────────────────────────────────────────────────

const VERDICT: Record<EligibilityVerdict, { label: string; color: string; dimColor: string }> = {
  eligible:        { label: 'Eligible',        color: '#22c55e', dimColor: 'color-mix(in srgb, #22c55e 14%, transparent)' },
  likely_eligible: { label: 'Likely Eligible', color: '#4ade80', dimColor: 'color-mix(in srgb, #4ade80 12%, transparent)' },
  incomplete:      { label: 'Incomplete',      color: '#f59e0b', dimColor: 'color-mix(in srgb, #f59e0b 12%, transparent)' },
  ineligible:      { label: 'Not Eligible',    color: '#ef4444', dimColor: 'color-mix(in srgb, #ef4444 12%, transparent)' },
};

// ── Status icons ──────────────────────────────────────────────────────────

function PassIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="#22c55e" strokeWidth="1.5" />
      <path d="m6.5 10.5 2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="#ef4444" strokeWidth="1.5" />
      <path d="m7 7 6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UnclearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="#f59e0b" strokeWidth="1.5" />
      <path d="M10 6.5c-1.1 0-2 .9-2 2 0 .8.4 1.4 1 1.8L10 11v.5" stroke="#f59e0b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="13.5" r=".75" fill="#f59e0b" />
    </svg>
  );
}

function MissingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="3 2.5" />
      <path d="M10 7v3M10 13h.01" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── Criterion row ─────────────────────────────────────────────────────────

interface CriterionRowProps {
  item: EligibilityCriterion;
  followupAnswer?: string;
  onFollowupChange?: (answer: string) => void;
}

function CriterionRow({ item, followupAnswer, onFollowupChange }: CriterionRowProps) {
  const isFail    = item.status === 'fail';
  const isUnclear = item.status === 'unclear';
  const isMissing = item.status === 'missing';
  const isPass    = item.status === 'pass';

  const accentColor = isFail ? '#ef4444' : isUnclear ? '#f59e0b' : isMissing ? '#9ca3af' : '#22c55e';

  return (
    <div
      className="flex gap-0 overflow-hidden rounded-xl border transition-colors"
      style={{ borderColor: 'color-mix(in srgb, ' + accentColor + ' 20%, var(--border) 80%)' }}
    >
      {/* Left accent bar */}
      <div className="w-1 shrink-0" style={{ backgroundColor: accentColor }} />

      <div className="flex min-w-0 flex-1 gap-3 px-4 py-3.5">
        <div className="mt-0.5">
          {isPass    && <PassIcon />}
          {isFail    && <FailIcon />}
          {isUnclear && <UnclearIcon />}
          {isMissing && <MissingIcon />}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium leading-5 text-text-primary">{item.description}</p>

          {item.user_input_used && (
            <p className="text-xs text-text-tertiary">↳ {item.user_input_used}</p>
          )}

          {!isPass && item.detail && (
            <p className="text-xs leading-[1.6]" style={{ color: accentColor }}>
              {item.detail}
            </p>
          )}

          {/* Inline followup — unclear */}
          {isUnclear && item.followup_question && onFollowupChange !== undefined && (
            <div className="mt-2.5 space-y-1.5">
              <p className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
                {item.followup_question}
              </p>
              <textarea
                rows={2}
                value={followupAnswer ?? ''}
                onChange={(e) => onFollowupChange(e.target.value)}
                placeholder="Your answer…"
                className="w-full resize-none rounded-lg border px-3 py-2 text-xs leading-5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1"
                style={{
                  borderColor: 'color-mix(in srgb, #f59e0b 30%, transparent)',
                  backgroundColor: 'color-mix(in srgb, #f59e0b 3%, transparent)',
                }}
              />
            </div>
          )}

          {/* Inline followup — missing */}
          {isMissing && item.followup_question && onFollowupChange !== undefined && (
            <div className="mt-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-text-tertiary">
                {item.followup_question}
              </p>
              <textarea
                rows={2}
                value={followupAnswer ?? ''}
                onChange={(e) => onFollowupChange(e.target.value)}
                placeholder="Your answer…"
                className="w-full resize-none rounded-lg border border-border px-3 py-2 text-xs leading-5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1"
                style={{ backgroundColor: 'color-mix(in srgb, #6b7280 2%, transparent)' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────

function SectionLabel({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-3">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.2em] shrink-0"
        style={{ color: color ?? 'var(--text-tertiary)' }}
      >
        {children}
      </span>
      <span className="h-px flex-1" style={{ backgroundColor: color ? 'color-mix(in srgb, ' + color + ' 20%, transparent)' : 'var(--border)' }} />
    </div>
  );
}

// ── Agent timeline ────────────────────────────────────────────────────────

function AgentTimeline({ entries, live }: { entries: ProgressEntry[]; live?: boolean }) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!live) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => window.clearInterval(timer);
  }, [live]);

  if (entries.length === 0) return null;

  // Group consecutive compute+output pairs together
  type Group =
    | { kind: 'thinking'; entry: ProgressEntry }
    | { kind: 'step'; call: ProgressEntry; result?: ProgressEntry };

  const groups: Group[] = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!;
    if (e.kind === 'thinking') {
      groups.push({ kind: 'thinking', entry: e });
    } else if (e.kind === 'compute') {
      const next = entries[i + 1];
      if (next?.kind === 'output') {
        groups.push({ kind: 'step', call: e, result: next });
        i++;
      } else {
        groups.push({ kind: 'step', call: e });
      }
    }
    // orphan output — skip, already consumed above
  }

  const lastGroup = groups[groups.length - 1];
  const isRunning = live && lastGroup?.kind === 'step' && !lastGroup.result;

  return (
    <div className="w-full">
      {groups.map((group, gi) => {
        const isLast = gi === groups.length - 1;

        if (group.kind === 'thinking') {
          const isActive = live && isLast;
          const hasText = !!group.entry.text;
          const wordCount = group.entry.text ? group.entry.text.trim().split(/\s+/).length : 0;
          const timeLabel = formatEventWindow(group.entry.startedAt, group.entry.endedAt);
          const isExpanded = expandedKeys.has(group.entry.key);
          const toggle = () =>
            setExpandedKeys((prev) => {
              const next = new Set(prev);
              if (next.has(group.entry.key)) next.delete(group.entry.key);
              else next.add(group.entry.key);
              return next;
            });

          return (
            <div key={group.entry.key} className="flex gap-3">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div
                  className={['mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 transition-colors', isActive ? 'border-accent bg-accent/20 animate-pulse' : 'border-border bg-background'].join(' ')}
                />
                {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
              </div>

              {/* Card */}
              <div className={['mb-3 min-w-0 flex-1 overflow-hidden rounded-xl border transition-colors', isActive ? 'border-accent/30' : 'border-border'].join(' ')}
                style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 95%, transparent)' }}
              >
                <button
                  type="button"
                  onClick={toggle}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left"
                  style={{ borderBottom: isExpanded ? '1px solid var(--border)' : 'none' }}
                >
                  {/* Icon */}
                  <svg viewBox="0 0 16 16" fill="none" className={['h-3.5 w-3.5 shrink-0', isActive ? 'text-accent' : 'text-text-tertiary'].join(' ')} aria-hidden="true">
                    <path d="M8 2.25a2.25 2.25 0 0 0-2.25 2.25v.35a2.9 2.9 0 0 1-.8 2l-.46.48a1.1 1.1 0 0 0 .79 1.87h5.44a1.1 1.1 0 0 0 .79-1.87l-.46-.48a2.9 2.9 0 0 1-.8-2v-.35A2.25 2.25 0 0 0 8 2.25ZM6.4 11.2a1.6 1.6 0 0 0 3.2 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                    {group.entry.label}
                  </span>
                  {/* Word count hint when collapsed */}
                  {!isExpanded && hasText && !isActive && (
                    <span className="font-mono text-[10px] text-text-tertiary">{wordCount} words</span>
                  )}
                  {/* Live cursor when active + collapsed */}
                  {isActive && !isExpanded && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-accent">
                      <span className="inline-block h-2 w-0.5 animate-pulse bg-accent" aria-hidden="true" />
                      streaming
                    </span>
                  )}
                  {timeLabel && !isActive && (
                    <span className="font-mono text-[10px] text-text-tertiary">{timeLabel}</span>
                  )}
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className={['ml-auto h-3 w-3 shrink-0 text-text-tertiary transition-transform duration-150', isExpanded ? 'rotate-180' : ''].join(' ')}
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-3 py-2.5">
                    <p className="mb-1.5 text-[10px] text-text-tertiary">{group.entry.label}</p>
                    {hasText && (
                      <p
                        className="text-[11px] leading-relaxed text-text-secondary"
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {group.entry.text}
                        {isActive && (
                          <span className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 animate-pulse bg-text-tertiary" aria-hidden="true" />
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // ── Tool call step ──
        const { call, result: res } = group;
        const isPending = !res;
        const timeLabel = formatEventWindow(call.startedAt, res?.startedAt ?? call.endedAt);
        const isExpanded = expandedKeys.has(call.key);
        const toggle = () =>
          setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(call.key)) next.delete(call.key);
            else next.add(call.key);
            return next;
          });

        return (
          <div key={call.key} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className={['mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 transition-colors', isPending ? 'border-accent bg-accent/20' : 'border-green-500 bg-green-500/15'].join(' ')}
              />
              {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
            </div>

            {/* Card */}
            <div
              className={['mb-3 min-w-0 flex-1 overflow-hidden rounded-xl border transition-colors', isPending ? 'border-accent/40' : 'border-border'].join(' ')}
              style={{ backgroundColor: isPending ? 'color-mix(in srgb, var(--accent) 3%, var(--surface))' : 'var(--surface)' }}
            >
              <button
                type="button"
                onClick={toggle}
                className="flex w-full items-center gap-2 px-3 py-2 text-left"
                style={{ borderBottom: isExpanded ? '1px solid var(--border)' : 'none' }}
              >
                <svg viewBox="0 0 16 16" fill="none" className={['h-3.5 w-3.5 shrink-0', isPending ? 'text-accent' : 'text-green-500'].join(' ')} aria-hidden="true">
                  <path d="M5 4 1 8l4 4M11 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                  {isPending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="animate-pulse text-accent">Tool call</span>
                      <span className="inline-flex gap-0.5">
                        <span className="h-1 w-1 animate-bounce rounded-full bg-accent" style={{ animationDelay: '0ms' }} />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-accent" style={{ animationDelay: '120ms' }} />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-accent" style={{ animationDelay: '240ms' }} />
                      </span>
                    </span>
                  ) : (
                    <span>{call.label}</span>
                  )}
                </span>
                {timeLabel && (
                  <span className="font-mono text-[10px] text-text-tertiary">{timeLabel}</span>
                )}
                {!isPending && (
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className={['ml-auto h-3 w-3 shrink-0 text-text-tertiary transition-transform duration-150', isExpanded ? 'rotate-180' : ''].join(' ')}
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {isExpanded && res?.output && (
                <div className="border-t px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-mono text-[11px] leading-5 text-text-secondary">{res.output}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {live && !isRunning && groups.length > 0 && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-2.5 h-2.5 w-2.5 animate-pulse rounded-full bg-accent/50" aria-hidden="true" />
          </div>
          <p className="py-2 text-sm font-medium text-text-primary">Assembling result…</p>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function EligibilityChecker({ scheme, backHref, headerControls }: EligibilityCheckerProps) {
  const [context, setContext]                   = useState('');
  const [result, setResult]                     = useState<EligibilityCheckResult | null>(null);
  const [stage, setStage]                       = useState<Stage>('compose');
  const [errorMsg, setErrorMsg]                 = useState('');
  const [followupAnswers, setFollowupAnswers]   = useState<FollowupAnswers>({});
  const [progress, setProgress]                 = useState<ProgressEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const addProgress = useCallback((entry: ProgressEntry) => {
    setProgress((prev) => [...prev, entry]);
  }, []);

  const onEvent = useCallback((event: EligibilityProgressEvent) => {
    const now = event.at;

    if (event.type === 'reasoning' || event.type === 'content') {
      const isReasoning = event.type === 'reasoning';
      setProgress((prev) => {
        const last = prev[prev.length - 1];

        // Append to the active card if it's the same kind
        if (last?.kind === 'thinking' && !!last.isReasoning === isReasoning) {
          const next = [...prev];
          next[next.length - 1] = { ...last, text: (last.text ?? '') + event.token, endedAt: now };
          return next;
        }

        // Close the active card when switching reasoning ↔ content
        const base = last?.kind === 'thinking'
          ? [...prev.slice(0, -1), { ...last, endedAt: now }]
          : prev;

        return [...base, {
          key: `${event.type}-${now}`,
          kind: 'thinking' as const,
          label: isReasoning ? 'Thinking' : 'Responding',
          startedAt: now,
          endedAt: now,
          isReasoning,
          text: event.token,
        }];
      });

    } else if (event.type === 'tool_call') {
      setProgress((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          const entry = next[i];
          if (!entry || entry.kind !== 'thinking') continue;
          next[i] = { ...entry, endedAt: now };
          break;
        }
        return [...next, {
          key: `call-${now}`,
          kind: 'compute' as const,
          label: event.name,
          startedAt: now,
          endedAt: now,
        }];
      });

    } else if (event.type === 'tool_result') {
      addProgress({
        key: `out-${now}`,
        kind: 'output',
        label: 'output',
        startedAt: now,
        endedAt: now,
        output: event.output,
      });
    }
  }, [addProgress]);

  const runCheck = useCallback(async (userContext: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setStage('checking');
    setErrorMsg('');
    setResult(null);
    setFollowupAnswers({});
    setProgress([]);

    try {
      const data = await runEligibilityCheck(scheme.id, userContext, onEvent, ctrl.signal);
      setResult(data);
      setStage('done');
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setErrorMsg((err as Error)?.message ?? 'Assessment failed');
      setStage('error');
    }
  }, [scheme.id, onEvent]);

  const check = useCallback(() => {
    if (!context.trim()) return;
    void runCheck(context);
  }, [context, runCheck]);

  const recheckWithFollowups = useCallback((currentResult: EligibilityCheckResult) => {
    const qaLines = currentResult.criteria
      .filter((c) => (c.status === 'unclear' || c.status === 'missing') && c.followup_question && followupAnswers[c.id]?.trim())
      .map((c) => `- ${c.followup_question}: ${(followupAnswers[c.id] ?? '').trim()}`);
    if (qaLines.length === 0) return;
    const augmented = `${context}\n\nFollow-up clarifications:\n${qaLines.join('\n')}`;
    void runCheck(augmented);
  }, [context, followupAnswers, runCheck]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setResult(null);
    setStage('compose');
    setErrorMsg('');
    setFollowupAnswers({});
    setProgress([]);
  }, []);

  const setFollowupAnswer = useCallback((criterionId: string, answer: string) => {
    setFollowupAnswers((prev) => ({ ...prev, [criterionId]: answer }));
  }, []);

  const capDisplay = scheme.fundingCap
    ? `HK$${(scheme.fundingCap / 1000).toFixed(0)}K`
    : 'Varies';

  // ── Page shell ────────────────────────────────────────────────────────

  const pageShell = (children: ReactNode) => (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-6 left-6 z-10">
        <BackNavigation fallbackHref={backHref} />
      </div>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        {headerControls && (
          <div className="mb-6 flex justify-center">{headerControls}</div>
        )}

        {/* Scheme pill */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <StatusChip variant="beta" compact />
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                {scheme.category} · Up to {capDisplay}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{scheme.name}</h1>
        </div>

        {children}
      </div>
    </div>
  );

  // ── Compose / Error ───────────────────────────────────────────────────

  if (stage === 'compose' || stage === 'error') {
    return pageShell(
      <>
        <p className="mx-auto mb-6 -mt-2 max-w-sm text-center text-sm leading-6 text-text-secondary">
          Describe your company and what you want to fund. Thunder checks every eligibility requirement against what you&apos;ve told it.
        </p>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={`Describe your company and project…\n\nE.g. Acme Ltd, 12-person HK-registered food manufacturer. We want to fund market research in the GBA and a Chinese e-catalogue. No prior BUD funding received.`}
            rows={9}
            className="w-full resize-none bg-transparent px-5 pt-5 pb-3 text-sm leading-7 text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />

          {stage === 'error' && errorMsg && (
            <div className="border-t border-border px-5 py-3">
              <p className="text-sm" style={{ color: '#ef4444' }}>{errorMsg}</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
              {context.length > 0 ? `${context.length} chars` : 'Any length works'}
            </span>
            <button
              type="button"
              disabled={!context.trim()}
              onClick={() => void check()}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              Check eligibility
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path d="M4 10h12M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </>,
    );
  }

  // ── Checking ──────────────────────────────────────────────────────────

  if (stage === 'checking') {
    return pageShell(
      <div className="flex flex-col items-center gap-4 py-4">
        {progress.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <span
              className="block h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              aria-hidden="true"
            />
            <p className="text-sm text-text-tertiary">Starting assessment…</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-4 flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
                aria-hidden="true"
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Agent · live</p>
            </div>
            <AgentTimeline entries={progress} live />
          </div>
        )}
      </div>,
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────

  if (!result) return null;

  const vcfg    = VERDICT[result.verdict] ?? VERDICT.incomplete;
  const passes  = result.criteria.filter((c) => c.status === 'pass');
  const fails   = result.criteria.filter((c) => c.status === 'fail');
  const unclear = result.criteria.filter((c) => c.status === 'unclear');
  const missing = result.criteria.filter((c) => c.status === 'missing');

  const answeredCount = Object.values(followupAnswers).filter((a) => a.trim()).length;
  const hasAnswers = answeredCount > 0;

  return pageShell(
    <>
      {/* ── Verdict banner ── */}
      <div
        className="mb-8 overflow-hidden rounded-2xl border"
        style={{
          backgroundColor: vcfg.dimColor,
          borderColor: 'color-mix(in srgb, ' + vcfg.color + ' 28%, transparent)',
        }}
      >
        <div className="px-6 pt-6 pb-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: vcfg.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              {vcfg.label}
            </span>
            {/* Mini scorecard */}
            <div className="flex items-center gap-3">
              {passes.length  > 0 && <span className="font-mono text-[11px] font-medium text-green-500">{passes.length}<span className="ml-1 font-normal opacity-70">pass</span></span>}
              {fails.length   > 0 && <span className="font-mono text-[11px] font-medium text-red-400">{fails.length}<span className="ml-1 font-normal opacity-70">fail</span></span>}
              {unclear.length > 0 && <span className="font-mono text-[11px] font-medium text-amber-400">{unclear.length}<span className="ml-1 font-normal opacity-70">unclear</span></span>}
              {missing.length > 0 && <span className="font-mono text-[11px] font-medium text-text-tertiary">{missing.length}<span className="ml-1 font-normal opacity-70">missing</span></span>}
            </div>
          </div>
          <p className="text-sm leading-6 text-text-primary">{result.summary}</p>
        </div>
      </div>

      {/* ── Blockers ── */}
      {result.blockers.length > 0 && (
        <div
          className="mb-4 rounded-xl border px-5 py-4"
          style={{
            borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
            backgroundColor: 'color-mix(in srgb, #ef4444 5%, transparent)',
          }}
        >
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: '#ef4444' }}>
            Hard blockers
          </p>
          <ul className="space-y-1.5">
            {result.blockers.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#ef4444' }}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                {b.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Failed criteria ── */}
      {fails.length > 0 && (
        <>
          <SectionLabel color="#ef4444">Failed</SectionLabel>
          <div className="space-y-2">
            {fails.map((item, i) => <CriterionRow key={i} item={item} />)}
          </div>
        </>
      )}

      {/* ── Passed criteria ── */}
      {passes.length > 0 && (
        <>
          <SectionLabel color="#22c55e">Passed</SectionLabel>
          <div className="space-y-2">
            {passes.map((item, i) => <CriterionRow key={i} item={item} />)}
          </div>
        </>
      )}

      {/* ── Unclear criteria ── */}
      {unclear.length > 0 && (
        <>
          <SectionLabel color="#f59e0b">Unclear — answer to resolve</SectionLabel>
          <div className="space-y-2">
            {unclear.map((item, i) => (
              <CriterionRow
                key={i}
                item={item}
                followupAnswer={followupAnswers[item.id] ?? ''}
                onFollowupChange={(ans) => setFollowupAnswer(item.id, ans)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Missing criteria ── */}
      {missing.length > 0 && (
        <>
          <SectionLabel>Missing info</SectionLabel>
          <div className="space-y-2">
            {missing.map((item, i) => (
              <CriterionRow
                key={i}
                item={item}
                followupAnswer={followupAnswers[item.id] ?? ''}
                onFollowupChange={(ans) => setFollowupAnswer(item.id, ans)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Tips ── */}
      {result.tips.length > 0 && (
        <>
          <SectionLabel>Tips</SectionLabel>
          <div className="space-y-2">
            {result.tips.map((t, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-border px-4 py-3.5">
                <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true">
                  <path d="M8 1.5a3.5 3.5 0 0 0-1.5 6.68V10a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V8.18A3.5 3.5 0 0 0 8 1.5ZM6.5 12h3v.5a1.5 1.5 0 0 1-3 0V12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.area}</p>
                  <p className="mt-0.5 text-xs leading-5 text-text-secondary">{t.advice}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Re-check with answers ── */}
      {hasAnswers && (
        <div
          className="mt-6 flex items-center justify-between gap-4 rounded-xl border px-5 py-4"
          style={{
            borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--accent) 5%, transparent)',
          }}
        >
          <p className="text-sm text-text-secondary">
            {answeredCount} clarifying {answeredCount === 1 ? 'answer' : 'answers'} provided — re-run for a more accurate result.
          </p>
          <button
            type="button"
            onClick={() => recheckWithFollowups(result)}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M4 10a6 6 0 1 0 1.5-3.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 5.5V10h4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Re-check
          </button>
        </div>
      )}

      {/* ── Agent timeline (collapsible, shown post-result) ── */}
      {progress.length > 0 && (
        <details className="mt-6 overflow-hidden rounded-xl border border-border">
          <summary className="cursor-pointer select-none px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary hover:text-text-secondary">
            Agent reasoning log
          </summary>
          <div className="px-4 pb-4 pt-2">
            <AgentTimeline entries={progress} />
          </div>
        </details>
      )}

      {/* ── CTA footer ── */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        {scheme.draftable && result.verdict !== 'ineligible' && (
          <Link
            href={`/draft?scheme=${scheme.id}`}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
            Draft application
          </Link>
        )}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-xl border border-border px-5 py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
        >
          Check again
        </button>
        <Link
          href={`/funds/${scheme.id}`}
          className="text-sm text-text-tertiary underline underline-offset-4 transition hover:text-text-secondary"
        >
          View scheme details
        </Link>
      </div>

      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        AI-generated assessment based on the information you provided. Verify against official scheme documentation before applying.
      </p>
    </>,
  );
}
