export async function createStripeCheckout(
  sessionId: string,
): Promise<{ readonly url?: string; readonly status: number }> {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  const data = (await response.json().catch(() => ({}))) as { readonly url?: string };
  return {
    status: response.status,
    ...(data.url ? { url: data.url } : {}),
  };
}