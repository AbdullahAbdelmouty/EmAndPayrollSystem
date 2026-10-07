const DEFAULT_CURRENCY = "USD";

interface FormatMoneyOptions {
  currency?: string;
  locale?: string;
}

/** Formats an integer amount stored in minor currency units (for example, cents). */
export function formatMoney(
  amountMinor: number,
  { currency = DEFAULT_CURRENCY, locale = "en-US" }: FormatMoneyOptions = {},
): string {
  if (!Number.isFinite(amountMinor)) return "—";

  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amountMinor / 100,
  );
}
