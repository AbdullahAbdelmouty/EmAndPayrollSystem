export function formatDate(date: string, locale = "en-US"): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "—";

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
