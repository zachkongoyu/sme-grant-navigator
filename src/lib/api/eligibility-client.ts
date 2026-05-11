export type EligibilityVerdict = 'eligible' | 'likely_eligible' | 'ineligible' | 'insufficient_info';
export type EligibilityStatus = 'pass' | 'fail' | 'unclear' | 'missing';

// ── Progress events streamed during assessment ────────────────────────────

export type EligibilityProgressEvent =
  | { type: 'reasoning'; token: string; at: number }
  | { type: 'content'; token: string; at: number }
  | { type: 'tool_call'; name: string; at: number }
  | { type: 'tool_result'; output: string; at: number };

export interface EligibilityCriterion {
  readonly id: string;
  readonly description: string;
  readonly status: EligibilityStatus;
  /** Why this status — cites scheme rule + user fact. */
  readonly detail: string;
  /** The exact piece of user input used, or null if not mentioned. */
  readonly user_input_used: string | null;
  /** The exact scheme rule text this maps to. */
  readonly source_rule: string;
  /**
   * A specific clarifying question that, if answered, would resolve the
   * criterion. Set for `unclear` and `missing` criteria; null for pass/fail.
   */
  readonly followup_question: string | null;
}

export interface EligibilityTip {
  readonly area: string;
  readonly advice: string;
}

export interface EligibilityCheckResult {
  readonly verdict: EligibilityVerdict;
  readonly summary: string;
  readonly criteria: ReadonlyArray<EligibilityCriterion>;
  readonly tips: ReadonlyArray<EligibilityTip>;
}

export async function runEligibilityCheck(
  schemeId: string,
  userContext: string,
  files: ReadonlyArray<File>,
  urls: ReadonlyArray<string>,
  onEvent: (event: EligibilityProgressEvent) => void,
  signal?: AbortSignal,
): Promise<{ result: EligibilityCheckResult; warnings: string[] }> {
  const form = new FormData();
  form.append('userContext', userContext);
  files.forEach((f) => form.append('files', f));
  urls.forEach((u) => form.append('urls', u));

  const response = await fetch(`/api/eligibility/${schemeId}`, {
    method: 'POST',
    body: form,
    signal: signal ?? null,
  });

  if (!response.ok || !response.body) {
    let message = 'Assessment failed. Please try again.';
    try {
      const err = (await response.json()) as { message?: string };
      if (err.message) message = err.message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  // Parse NDJSON stream line by line
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let event: { type: string } & Record<string, unknown>;
      try {
        event = JSON.parse(trimmed) as typeof event;
      } catch {
        continue;
      }

      if (event.type === 'result') {
        return {
          result: event.result as EligibilityCheckResult,
          warnings: (event.warnings as string[] | undefined) ?? [],
        };
      }
      if (event.type === 'error') {
        throw new Error((event.message as string | undefined) ?? 'Assessment failed');
      }
      if (
        event.type === 'reasoning' ||
        event.type === 'content' ||
        event.type === 'tool_call' ||
        event.type === 'tool_result'
      ) {
        onEvent(event as EligibilityProgressEvent);
      }
    }
  }

  throw new Error('Stream ended without a result');
}