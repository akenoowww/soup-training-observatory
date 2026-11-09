export const number = (value: number, maximumFractionDigits = 0) => new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
export function compact(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
export function metricNumber(value: number | null | undefined, digits = 4) {
  if (value == null || !Number.isFinite(value)) return 'Unavailable';
  if (value !== 0 && Math.abs(value) < 0.0001) return value.toExponential(2);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}
export function duration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m ${Math.floor(seconds % 60)}s`;
}
export function utcDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(new Date(value)) + ' UTC';
}
