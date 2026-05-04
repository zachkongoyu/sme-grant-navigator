export const BILLING = {
  currency: 'HKD',
  freeChecks: 3,
  creditCost: {
    eligibilityCheck: 1,
    draft: 3,
  },
  packs: [
    { id: 'starter', label: 'Starter', credits: 10,  priceMinorUnits: 5800  },
    { id: 'value',   label: 'Value',   credits: 30,  priceMinorUnits: 13800 },
    { id: 'pro',     label: 'Pro',     credits: 100, priceMinorUnits: 38800 },
  ],
} as const;

export type PackId = (typeof BILLING.packs)[number]['id'];

export function getPackById(id: PackId) {
  return BILLING.packs.find((p) => p.id === id)!;
}

/** Format minor units to display string e.g. 5800 → "HKD 58" */
export function formatPrice(minorUnits: number, currency = BILLING.currency) {
  return `${currency} ${minorUnits / 100}`;
}
