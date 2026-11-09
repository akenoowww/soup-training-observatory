import { describe, expect, it } from 'vitest';
import {
  constantMetricRange,
  formatMetric,
  formatMetricTicks,
  formatStep,
  formatStepTick,
  formatStepTicks,
  isolatedPointIndices,
  prepareValues,
} from './chart-format';

describe('chart value preparation', () => {
  it('breaks the line at NaN, Infinity, and absent values without coercing to zero', () => {
    const original = [0, 0.25, NaN, 0.5, Infinity, null, -Infinity, -1];
    const result = prepareValues(original, 'linear');
    expect(result.values).toEqual([0, 0.25, null, 0.5, null, null, null, -1]);
    expect(result.finiteCount).toBe(4);
    expect(original[2]).toBeNaN();
    expect(original[4]).toBe(Infinity);
  });

  it('masks nonpositive log values explicitly and counts only finite excluded samples', () => {
    const result = prepareValues([1, 0, -0.1, 0.01, NaN, null], 'log');
    expect(result.values).toEqual([1, null, null, 0.01, null, null]);
    expect(result.nonpositiveCount).toBe(2);
    expect(result.finiteCount).toBe(2);
  });

  it('does not smooth or clip a single outlier', () => {
    expect(prepareValues([0.2, 0.19, 82.1542, 0.18], 'linear').values).toEqual([
      0.2, 0.19, 82.1542, 0.18,
    ]);
  });
});

describe('chart numeric formatting', () => {
  it('retains small learning rates instead of displaying a false zero', () => {
    expect(formatMetric(0.00000003, 'lr')).toBe('3.0000e-8');
    expect(formatMetric(0.00000003, 'lr', true)).toBe('3.0e-8');
  });

  it('formats numeric steps independently of locale and time zone', () => {
    expect(formatStep(1_000_000)).toBe('1,000,000');
    expect(formatStep(14.5)).toBe('14.5');
    expect(formatStepTick(1_000_000)).toBe('1m');
    expect(formatStepTick(250_000)).toBe('250k');
    expect(formatStepTick(0)).toBe('0');
  });

  it('expands labels at deep zoom rather than labeling distinct steps or values identically', () => {
    const stepTicks = [999998, 999999];
    expect(new Set(formatStepTicks(stepTicks)).size).toBe(stepTicks.length);
    const lrTicks = [0.00030001, 0.00030002, 0.00030003];
    const labels = formatMetricTicks(lrTicks, 'lr');
    expect(new Set(labels).size).toBe(lrTicks.length);
    labels.forEach((label, index) => expect(Number(label)).toBeCloseTo(lrTicks[index]!, 12));
  });

  it('preserves suppressed log-axis tick slots instead of drawing false zero or dash labels', () => {
    expect(formatMetricTicks([0.0001, null, 0.001, null, 0.01], 'lr')).toEqual([
      '1.0e-4',
      null,
      '1.0e-3',
      null,
      '1.0e-2',
    ]);
    expect(formatStepTicks([0, null, 100])).toEqual(['0', null, '100']);
    expect(formatMetricTicks([0.00030001, null, 0.00030002], 'lr')).toEqual([
      '3.0001e-4',
      null,
      '3.0002e-4',
    ]);
  });

  it('labels nonfinite summaries as unavailable and a real zero as zero', () => {
    expect(formatMetric(null, 'loss')).toBe('—');
    expect(formatMetric(NaN, 'loss')).toBe('—');
    expect(formatMetric(Infinity, 'loss')).toBe('—');
    expect(formatMetric(0, 'loss')).toBe('0');
  });
});

describe('finite measurements inside gaps', () => {
  it('selects singleton finite segments for markers without joining across gaps', () => {
    expect(isolatedPointIndices([null, 9.4, null])).toEqual([1]);
    expect(isolatedPointIndices([2, null, 3, 4, null, 5])).toEqual([0, 5]);
    expect(isolatedPointIndices([0])).toEqual([0]);
    expect(isolatedPointIndices([null, NaN, Infinity])).toEqual([]);
    expect(isolatedPointIndices([1, 2, 3])).toEqual([]);
  });
  it('keeps a positive singleton visible after nonpositive log values become gaps', () => {
    const prepared = prepareValues([0, 9.4, 0], 'log');
    expect(prepared.values).toEqual([null, 9.4, null]);
    expect(isolatedPointIndices(prepared.values)).toEqual([1]);
  });
});

describe('constant linear measurements', () => {
  it('places real zero inside a finite symmetric plotting range for every metric', () => {
    for (const metric of ['loss', 'lr', 'grad_norm'] as const) {
      const [min, max] = constantMetricRange(0, metric);
      expect(Number.isFinite(min) && Number.isFinite(max)).toBe(true);
      expect(min).toBeLessThan(0);
      expect(max).toBeGreaterThan(0);
      expect(min).toBe(-max);
    }
  });
  it('keeps positive, negative and tiny constant values inside the axis without changing them', () => {
    for (const value of [9.4, -2, 0.00000003, -0.00000003, 1e-300]) {
      const [min, max] = constantMetricRange(value, 'loss');
      expect(min).toBeLessThan(value);
      expect(max).toBeGreaterThan(value);
      expect(Number.isFinite(min) && Number.isFinite(max)).toBe(true);
    }
    expect(constantMetricRange(0, 'lr')).toEqual([-0.000001, 0.000001]);
  });
});
