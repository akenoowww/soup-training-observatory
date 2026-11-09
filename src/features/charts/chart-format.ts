import type { Metric } from '../../domain/types';

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const axisFormat = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });
const displayFormat = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 6 });

export function formatStep(value: number): string {
  return Number.isInteger(value) ? integerFormat.format(value) : String(value);
}

export function formatStepTick(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${Number((value / 1_000_000).toPrecision(4))}m`;
  if (Math.abs(value) >= 10_000) return `${Number((value / 1_000).toPrecision(4))}k`;
  return axisFormat.format(value);
}

export function formatMetric(value: number | null, metric: Metric, axis = false): string {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  if (metric === 'lr' || Math.abs(value) < 0.0001 || Math.abs(value) >= 1_000_000) {
    return value.toExponential(axis ? 1 : 4).replace(/e([+-])0+/u, 'e$1');
  }
  return (axis ? axisFormat : displayFormat).format(value);
}

/** Never coerce missing/non-finite samples to zero, including log-scale inputs. */
export function prepareValues(
  values: readonly (number | null)[],
  scale: 'linear' | 'log',
): { values: (number | null)[]; nonpositiveCount: number; finiteCount: number } {
  let nonpositiveCount = 0;
  let finiteCount = 0;
  const prepared = values.map((value) => {
    if (value === null || !Number.isFinite(value)) return null;
    if (scale === 'log' && value <= 0) {
      nonpositiveCount += 1;
      return null;
    }
    finiteCount += 1;
    return value;
  });
  return { values: prepared, nonpositiveCount, finiteCount };
}

function labelsAreDistinct(
  ticks: readonly (number | null)[],
  labels: readonly (string | null)[],
): boolean {
  return (
    new Set(ticks.filter((tick) => tick !== null && Number.isFinite(tick))).size ===
    new Set(labels.filter((label) => label !== null)).size
  );
}

/** Preserve null filter slots: uPlot uses them to suppress log-axis minor labels.
 * Compact overview labels expand again when a zoom would make them collide.
 */
export function formatStepTicks(ticks: readonly (number | null)[]): (string | null)[] {
  const compact = ticks.map((value) =>
    value === null || !Number.isFinite(value) ? null : formatStepTick(value),
  );
  if (labelsAreDistinct(ticks, compact)) return compact;
  return ticks.map((value) =>
    value === null || !Number.isFinite(value)
      ? null
      : Number.isInteger(value)
        ? integerFormat.format(value)
        : String(value),
  );
}

/** Increase precision when close values at deep zoom would otherwise share a label. */
export function formatMetricTicks(
  ticks: readonly (number | null)[],
  metric: Metric,
): (string | null)[] {
  const initial = ticks.map((value) =>
    value === null || !Number.isFinite(value) ? null : formatMetric(value, metric, true),
  );
  if (labelsAreDistinct(ticks, initial)) return initial;
  for (let precision = 4; precision <= 15; precision += 1) {
    const labels = ticks.map((value) => {
      if (value === null || !Number.isFinite(value)) return null;
      if (value === 0) return '0';
      if (metric === 'lr' || Math.abs(value) < 0.0001 || Math.abs(value) >= 1_000_000)
        return value.toExponential(precision - 1);
      return Number(value.toPrecision(precision)).toString();
    });
    if (labelsAreDistinct(ticks, labels)) return labels;
  }
  return ticks.map((value) => (value === null || !Number.isFinite(value) ? null : String(value)));
}

/** A singleton finite segment has no connecting line, so it needs its own marker.
 * Returning only isolated indices keeps ordinary dense plots marker-free.
 */
export function isolatedPointIndices(values: readonly (number | null)[]): number[] {
  const result: number[] = [];
  const finite = (value: number | null | undefined) =>
    value !== null && value !== undefined && Number.isFinite(value);
  values.forEach((value, index) => {
    if (finite(value) && !finite(values[index - 1]) && !finite(values[index + 1]))
      result.push(index);
  });
  return result;
}

/** Keep a constant finite measurement inside the linear plot rather than on a
 * clipping boundary. Empty series use their own fallback and never call this.
 * Zero has no inherent scale, so choose explicit symmetric metric-sized padding.
 */
export function constantMetricRange(value: number, metric: Metric): [number, number] {
  const padding =
    value === 0
      ? metric === 'lr'
        ? 0.000001
        : 1
      : Math.max(Math.abs(value) * 0.12, Number.MIN_VALUE);
  return [
    Math.max(-Number.MAX_VALUE, value - padding),
    Math.min(Number.MAX_VALUE, value + padding),
  ];
}
