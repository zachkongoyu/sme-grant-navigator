'use client';

import { useRef, useState, useCallback } from 'react';

import type { ResolvedScheme } from '@/lib/schemes/db';
import type {
  EligibilityCheckResult,
  EligibilityProgressEvent,
} from '@/lib/api/eligibility-client';
import { runEligibilityCheck } from '@/lib/api/eligibility-client';

export type Stage = 'compose' | 'checking' | 'done' | 'error';
export type FollowupAnswers = Record<string, string>;

export interface ProgressEntry {
  key: string;
  kind: 'thinking' | 'compute' | 'output';
  label: string;
  startedAt: number;
  endedAt?: number;
  isReasoning?: boolean;
  text?: string;
  output?: string;
}

export interface UseEligibilityCheckReturn {
  context: string;
  setContext: (value: string) => void;
  stage: Stage;
  result: EligibilityCheckResult | null;
  errorMsg: string;
  followupAnswers: FollowupAnswers;
  progress: ProgressEntry[];
  check: () => void;
  recheckWithFollowups: () => void;
  reset: () => void;
  setFollowupAnswer: (criterionId: string, answer: string) => void;
}

export function useEligibilityCheck(scheme: ResolvedScheme): UseEligibilityCheckReturn {
  const [context, setContext]                 = useState('');
  const [result, setResult]                   = useState<EligibilityCheckResult | null>(null);
  const [stage, setStage]                     = useState<Stage>('compose');
  const [errorMsg, setErrorMsg]               = useState('');
  const [followupAnswers, setFollowupAnswers] = useState<FollowupAnswers>({});
  const [progress, setProgress]               = useState<ProgressEntry[]>([]);
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

        if (last?.kind === 'thinking' && !!last.isReasoning === isReasoning) {
          const next = [...prev];
          next[next.length - 1] = { ...last, text: (last.text ?? '') + event.token, endedAt: now };
          return next;
        }

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

  const recheckWithFollowups = useCallback(() => {
    if (!result) return;
    const qaLines = result.criteria
      .filter((c) => (c.status === 'unclear' || c.status === 'missing') && c.followup_question && followupAnswers[c.id]?.trim())
      .map((c) => `- ${c.followup_question}: ${(followupAnswers[c.id] ?? '').trim()}`);
    if (qaLines.length === 0) return;
    void runCheck(`${context}\n\nFollow-up clarifications:\n${qaLines.join('\n')}`);
  }, [context, result, followupAnswers, runCheck]);

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

  return {
    context,
    setContext,
    stage,
    result,
    errorMsg,
    followupAnswers,
    progress,
    check,
    recheckWithFollowups,
    reset,
    setFollowupAnswer,
  };
}
