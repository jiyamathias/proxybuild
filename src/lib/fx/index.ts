/**
 * Approximate currency conversion for diaspora clients.
 *
 * Clients think in GBP/USD/CAD/EUR but are billed in NGN, so money screens show an
 * indicative second figure. Rates are refreshed daily and are never used for billing —
 * only for orientation, which is why every surface labels them as approximate.
 */

export const SUPPORTED_DISPLAY_CURRENCIES = [
  "GBP",
  "USD",
  "CAD",
  "EUR",
  "AUD",
] as const;

export type DisplayCurrency = (typeof SUPPORTED_DISPLAY_CURRENCIES)[number];

export const DISPLAY_CURRENCY_LABEL: Record<DisplayCurrency, string> = {
  GBP: "British Pound (£)",
  USD: "US Dollar ($)",
  CAD: "Canadian Dollar (C$)",
  EUR: "Euro (€)",
  AUD: "Australian Dollar (A$)",
};

type RateMap = Record<string, number>;

/**
 * Rates keyed from `base`. Returns null if the provider is unreachable or malformed,
 * so callers simply omit the conversion rather than showing a wrong number.
 */
export async function getRates(base: string): Promise<RateMap | null> {
  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`,
      // Refresh daily; the figure is indicative so staleness is acceptable
      { next: { revalidate: 86_400 } }
    );
    if (!res.ok) return null;

    const body = await res.json();
    if (body?.result !== "success" || !body.rates) return null;
    return body.rates as RateMap;
  } catch {
    return null;
  }
}

export function convert(
  amount: number,
  rates: RateMap | null,
  target: string
): number | null {
  if (!rates) return null;
  const rate = rates[target];
  if (typeof rate !== "number" || !Number.isFinite(rate)) return null;
  return amount * rate;
}

export function formatApprox(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convenience for server components: returns a ready "≈ £20,500" string, or null
 * when no preference is set, the currencies match, or rates are unavailable.
 */
export async function approxLabel(
  amount: number,
  baseCurrency: string,
  displayCurrency: string | null
): Promise<string | null> {
  if (!displayCurrency || displayCurrency === baseCurrency) return null;
  const rates = await getRates(baseCurrency);
  const converted = convert(amount, rates, displayCurrency);
  if (converted === null) return null;
  return `≈ ${formatApprox(converted, displayCurrency)}`;
}
