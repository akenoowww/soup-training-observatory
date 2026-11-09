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

function labelsAreDistinct(ticks: readonly number[], labels: readonly string[]): boolean {
  return new Set(ticks).size === new Set(labels).size;
}

/** Compact overview labels must expand again when a zoom would make them collide. */
export function formatStepTicks(ticks: readonly number[]): string[] {
  const compact = ticks.map(formatStepTick);
  if (labelsAreDistinct(ticks, compact)) return compact;
  return ticks.map((value) => Number.isInteger(value) ? integerFormat.format(value) : String(value));
}

/** Increase precision when close values at deep zoom would otherwise share a label. */
export function formatMetricTicks(ticks: readonly number[], metric: Metric): string[] {
  const initial = ticks.map((value) => formatMetric(value, metric, true));
  if (labelsAreDistinct(ticks, initial)) return initial;
  for (let precision = 4; precision <= 15; precision += 1) {
    const labels = ticks.map((value) => {
      if (value === 0) return '0';
      if (metric === 'lr' || Math.abs(value) < 0.0001 || Math.abs(value) >= 1_000_000) {
        return value.toExponential(precision - 1);
      }
      return Number(value.toPrecision(precision)).toString();
    });
    if (labelsAreDistinct(ticks, labels)) return labels;
  }
  return ticks.map(String);
}
