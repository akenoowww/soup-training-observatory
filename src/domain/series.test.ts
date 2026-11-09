import { describe, expect, it } from 'vitest';
import { baselineMetric, canonicalize, lowerBound, sampleMetric } from './series';
import type { RawPoint } from './types';
import { generateRun } from '../data/fixtures';

const point = (step: number, loss: number): RawPoint => ({ step, loss, lr: loss / 100, grad_norm: loss * 2 });

describe('canonical measurements', () => {
  it('sorts numeric steps and applies last received duplicate to every metric', () => {
    const run = canonicalize([point(10, 1), point(2, 4), point(1, 5), point(2, 7), point(3, 3)]);
    expect(Array.from(run.step)).toEqual([1, 2, 3, 10]);
    expect(Array.from(run.loss)).toEqual([5, 7, 3, 1]);
    expect(Array.from(run.lr)).toEqual([0.05, 0.07, 0.03, 0.01]);
    expect(Array.from(run.grad_norm)).toEqual([10, 14, 6, 2]);
    expect(run.duplicateCount).toBe(1);
  });
  it('rejects misaligned metric columns before measurements can shift against the x axis', () => {
    expect(() => canonicalize({ step: new Float64Array([0, 1]), loss: new Float64Array([5]),
      lr: new Float64Array([1, 2]), grad_norm: new Float64Array([3, 4]) })).toThrow('same number');
  });
  it('does not report sorted duplicate removal as out-of-order measurements', () => {
    const run = canonicalize([point(0, 1), point(1, 2), point(1, 3), point(2, 4)]);
    expect(run.duplicateCount).toBe(1);
    expect(run.reorderedCount).toBe(0);
  });
  it('does not replace an invalid newest duplicate with an older finite reading', () => {
    const run = canonicalize([point(0, 5), point(1, 4), point(1, NaN), point(2, 3)]);
    const sampled = sampleMetric(run, 'loss', 1);
    expect(sampled.y).toEqual([5, null, 3]);
    expect(sampled.invalidCount).toBe(1);
    expect(sampled.duplicateCount).toBe(1);
  });
  it('rejects non-finite steps rather than placing them at zero', () => {
    const run = canonicalize([point(NaN, 9), point(1, 2), point(Infinity, 8)]);
    expect(Array.from(run.step)).toEqual([1]);
    expect(run.rejectedStepCount).toBe(2);
  });
});

describe('truthful reduction', () => {
  it('preserves the 1M-point single spike at all tested pixel budgets and zoom windows containing it', () => {
    const run = generateRun('run-001');
    expect(run.step.length).toBe(1_000_000);
    const windows = [undefined, { min: 0, max: 750_000 }, { min: 250_000, max: 750_000 },
      { min: 499_000, max: 501_000 }, { min: 499_999, max: 500_001 }, { min: 500_000, max: 500_000 }];
    for (const width of [1, 2, 3, 16, 320, 1_024]) {
      for (const range of windows) {
        const result = sampleMetric(run, 'loss', width, range);
        expect(result.x[result.y.indexOf(9.4)], `width=${width}; range=${JSON.stringify(range)}`).toBe(500_000);
        expect(result.max).toBe(9.4);
        expect(result.domain).toEqual({ min: 0, max: 999_999 });
      }
    }
  }, 20_000);
  it('retains each bucket minimum/maximum and emits only original finite values', () => {
    const points = Array.from({ length: 2_001 }, (_, step) => point(step, Math.sin(step * 1.73) * (1 + step % 17)));
    const run = canonicalize(points);
    for (const width of [1, 7, 31, 320]) {
      const sampled = sampleMetric(run, 'loss', width);
      for (let bucket = 0; bucket < width; bucket++) {
        const members = points.filter((entry) => Math.min(width - 1, Math.floor(entry.step / 2_000 * width)) === bucket);
        const values = members.map((entry) => entry.loss);
        expect(sampled.y).toContain(Math.min(...values));
        expect(sampled.y).toContain(Math.max(...values));
      }
      sampled.x.forEach((step, index) => expect(sampled.y[index]).toBe(points[step]!.loss));
    }
  });
  it('does not invent a spike in a viewport that excludes it', () => {
    const result = sampleMetric(generateRun('run-001'), 'loss', 300, { min: 10, max: 1_000 });
    expect(result.y).not.toContain(9.4);
    expect(result.rawCount).toBe(991);
    expect(Math.max(...result.x)).toBeLessThanOrEqual(1_000);
  });
  it('keeps NaN and positive/negative Infinity as visible line breaks even within one bucket', () => {
    const run = canonicalize([point(0, 5), point(1, NaN), point(2, 4), point(3, Infinity), point(4, 3), point(5, -Infinity), point(6, 2)]);
    const result = sampleMetric(run, 'loss', 1);
    expect(result.x).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.y).toEqual([5, null, 4, null, 3, null, 2]);
    expect(result.y).not.toContain(0);
    expect(result.invalidCount).toBe(3);
    expect(result.min).toBe(2);
    expect(result.max).toBe(5);
  });
  it('breaks across missing steps instead of interpolating an apparently valid line', () => {
    const result = sampleMetric(canonicalize([point(0, 5), point(1, 4), point(100, 2), point(101, 1)]), 'loss', 1);
    expect(result.x).toEqual([0, 1, 50.5, 100, 101]);
    expect(result.y).toEqual([5, 4, null, 2, 1]);
    expect(result.gapCount).toBe(1);
  });
  it('retains real zero values and does not change their numeric meaning', () => {
    const result = sampleMetric(canonicalize([point(0, 2), point(1, 0), point(2, 1)]), 'loss', 1);
    expect(result.y).toEqual([2, 0, 1]);
    expect(result.min).toBe(0);
    expect(result.invalidCount).toBe(0);
  });
  it('reports exact extrema and the actual latest reading rather than a sampled average', () => {
    const result = sampleMetric(canonicalize([point(0, 0.0000123456789), point(1, 9.87654321), point(2, 1.23456789)]), 'loss', 1);
    expect(result.min).toBe(0.0000123456789);
    expect(result.max).toBe(9.87654321);
    expect(result.latest).toBe(1.23456789);
    expect(result.y).toContain(result.min);
    expect(result.y).toContain(result.max);
  });
  it('keeps an invalid final measurement unavailable instead of showing an older value as latest', () => {
    const result = sampleMetric(canonicalize([point(0, 4), point(1, NaN)]), 'loss');
    expect(result.latest).toBeNull();
    expect(result.max).toBe(4);
  });
  it('handles empty and entirely invalid intervals without fabricated statistics', () => {
    const empty = sampleMetric(canonicalize([]), 'loss');
    expect(empty.y).toEqual([]);
    expect(empty.min).toBeNull();
    expect(empty.max).toBeNull();
    const invalid = sampleMetric(canonicalize([point(0, NaN), point(1, Infinity)]), 'loss');
    expect(invalid.y).toEqual([null]);
    expect(invalid.invalidCount).toBe(2);
    expect(invalid.latest).toBeNull();
  });
  it('bounds the normal million-point render payload to four points per pixel bucket', () => {
    const result = sampleMetric(generateRun('run-001'), 'loss', 800);
    expect(result.renderedCount).toBeLessThanOrEqual(3_200);
    expect(result.rawCount).toBe(1_000_000);
  });
  it('keeps a non-finite pixel budget bounded rather than emitting every source point', () => {
    const result = sampleMetric(generateRun('run-001'), 'loss', NaN);
    expect(result.renderedCount).toBeLessThanOrEqual(3_600);
    expect(result.y).toContain(9.4);
  });
  it('provides an explicitly unreduced benchmark baseline', () => {
    const result = baselineMetric(canonicalize([point(0, 1), point(1, NaN), point(2, 3)]), 'loss');
    expect(result.x).toEqual([0, 1, 2]);
    expect(result.y).toEqual([1, null, 3]);
  });
});

describe('numeric range search', () => {
  it('uses numeric ordering and correct inclusive range endpoints', () => {
    const values = new Float64Array([2, 10, 100, 1_000]);
    expect(lowerBound(values, 10)).toBe(1);
    expect(lowerBound(values, 11)).toBe(2);
    expect(lowerBound(values, 1_001)).toBe(4);
    const range = sampleMetric(canonicalize([point(2, 1), point(10, 2), point(100, 3)]), 'loss', 1, { min: 10, max: 100 });
    expect(range.rawCount).toBe(2);
    expect(range.x.filter((_, i) => range.y[i] !== null)).toEqual([10, 100]);
  });
});
