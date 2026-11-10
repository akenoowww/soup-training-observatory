import { describe, expect, it } from 'vitest';
import { canonicalize, sampleMetric } from './series';
import type { Metric, RawPoint, SeriesResult } from './types';

const point = (step: number, value: number): RawPoint => ({
  step,
  loss: value,
  lr: value,
  grad_norm: value,
});
const logValues = (series: SeriesResult) =>
  series.y.map((value) => (value !== null && value > 0 ? value : null));

function assertNoPositiveBridge(rows: readonly RawPoint[], metric: Metric, series: SeriesResult) {
  const plotted = logValues(series);
  for (let index = 1; index < plotted.length; index++) {
    if (plotted[index] === null || plotted[index - 1] === null) continue;
    const from = series.x[index - 1]!,
      to = series.x[index]!;
    const source = rows.filter((row) => row.step >= from && row.step <= to);
    expect(
      source.every((row) => Number.isFinite(row[metric]) && row[metric] > 0),
      `positive line ${from}..${to} crosses an excluded measurement`,
    ).toBe(true);
    expect(
      source.slice(1).every((row, offset) => row.step - source[offset]!.step === 1),
      `positive line ${from}..${to} crosses a missing step`,
    ).toBe(true);
  }
}

describe('log-aware source reduction', () => {
  it('retains the second zero in one bucket instead of reconnecting the positive line through it', () => {
    const rows = [5, 0, 4, 10, 3, 0, 2].map((value, step) => point(step, value));
    const sampled = sampleMetric(canonicalize(rows), 'loss', 1);
    expect(sampled.x).toContain(5);
    expect(sampled.y[sampled.x.indexOf(5)]).toBe(0);
    assertNoPositiveBridge(rows, 'loss', sampled);
    expect(sampled.min).toBe(0);
    expect(sampled.max).toBe(10);
    expect(sampled.latest).toBe(2);
    expect(sampled.invalidCount).toBe(0);
  });

  it('does not let a more-negative bucket minimum erase later zero or lesser-negative boundaries', () => {
    const rows = [5, -10, 4, 12, 3, 0, 2, -1, 6].map((value, step) => point(step, value));
    for (const metric of ['loss', 'lr', 'grad_norm'] as const) {
      const sampled = sampleMetric(canonicalize(rows), metric, 1);
      assertNoPositiveBridge(rows, metric, sampled);
      expect(sampled.x).toEqual(rows.map((row) => row.step));
      expect(sampled.min).toBe(-10);
      expect(sampled.max).toBe(12);
      expect(sampled.latest).toBe(6);
      expect(sampled.invalidCount).toBe(0);
    }
  });

  it('keeps raw nonpositive latest values and extrema, including an all-zero or all-negative range', () => {
    for (const values of [
      [3, 0, -1],
      [0, 0, 0],
      [-2, -9, -1],
    ]) {
      const rows = values.map((value, step) => point(step, value));
      const sampled = sampleMetric(canonicalize(rows), 'loss', 1);
      expect(sampled.min).toBe(Math.min(...values));
      expect(sampled.max).toBe(Math.max(...values));
      expect(sampled.latest).toBe(values.at(-1));
      expect(sampled.invalidCount).toBe(0);
      assertNoPositiveBridge(rows, 'loss', sampled);
    }
  });

  it('retains non-finite and absent-step breaks alongside log exclusions', () => {
    const rows = [
      point(0, 5),
      point(1, 0),
      point(2, 4),
      point(3, NaN),
      point(4, 3),
      point(9, -1),
      point(10, 2),
      point(11, Infinity),
      point(12, 1),
    ];
    const sampled = sampleMetric(canonicalize(rows), 'loss', 1);
    assertNoPositiveBridge(rows, 'loss', sampled);
    expect(sampled.invalidCount).toBe(2);
    expect(sampled.gapCount).toBe(1);
    expect(sampled.min).toBe(-1);
    expect(sampled.max).toBe(5);
  });

  it('uses the last duplicate observation before choosing log boundaries', () => {
    const arrivals = [
      point(6, 2),
      point(1, 5),
      point(0, 4),
      point(3, -2),
      point(2, 8),
      point(4, 3),
      point(5, 0),
      point(1, 0),
      point(3, 1),
    ];
    const run = canonicalize(arrivals);
    const rows = Array.from(run.step, (step, index) => point(step, run.loss[index]!));
    const sampled = sampleMetric(run, 'loss', 1);
    assertNoPositiveBridge(rows, 'loss', sampled);
    expect(sampled.duplicateCount).toBe(2);
    expect(sampled.y[sampled.x.indexOf(1)]).toBe(0);
    expect(sampled.min).toBe(0);
    expect(sampled.max).toBe(8);
  });

  it('buckets long nonpositive plateaus rather than emitting every excluded measurement', () => {
    const run = canonicalize(Array.from({ length: 100_000 }, (_, step) => point(step, 0)));
    const sampled = sampleMetric(run, 'loss', 100);
    expect(sampled.renderedCount).toBeLessThanOrEqual(400);
    expect(sampled.rawCount).toBe(100_000);
    expect(sampled.min).toBe(0);
    expect(sampled.latest).toBe(0);
  });

  it('keeps the shared snapshot continuous on linear scale instead of inventing gaps at zero or negative values', () => {
    const rows = [5, -10, 4, 12, 3, 0, 2, -1, 6].map((value, step) => point(step, value));
    const run = canonicalize(rows);
    const sampled = sampleMetric(run, 'loss', 1);
    expect(sampled.y.every((value) => value !== null && Number.isFinite(value))).toBe(true);
    expect(sampled.y).toContain(0);
    expect(sampled.min).toBe(-10);
    expect(sampled.max).toBe(12);
    expect(sampled.latest).toBe(6);
    expect(sampled.invalidCount).toBe(0);
    expect(sampled.gapCount).toBe(0);
  });
});
