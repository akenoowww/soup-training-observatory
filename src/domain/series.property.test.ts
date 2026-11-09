import { describe, expect, it } from 'vitest';
import { canonicalize, sampleMetric } from './series';
import { METRICS, type Metric, type Range, type RawPoint, type SeriesResult } from './types';

const point = (step: number, value: number): RawPoint => ({
  step,
  loss: value,
  lr: value / 1e6,
  grad_norm: value * -3,
});

/** Test-only reference deliberately uses a Map + full collections, rather than
 * production's typed-column sort, binary bounds and streaming extrema state. */
function referenceCanonical(points: readonly RawPoint[]): RawPoint[] {
  const lastReceived = new Map<number, RawPoint>();
  for (const row of points)
    if (Number.isSafeInteger(row.step) && row.step >= 0) lastReceived.set(row.step, row);
  return [...lastReceived.values()].sort((left, right) => left.step - right.step);
}
function seedRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) | 0;
    return (state >>> 0) / 4_294_967_296;
  };
}
function assertViewport(
  reference: readonly RawPoint[],
  metric: Metric,
  width: number,
  range: Range,
  sampled: SeriesResult,
  context: string,
) {
  const rows = reference.filter((row) => row.step >= range.min && row.step <= range.max);
  const finite = rows.filter((row) => Number.isFinite(row[metric]));
  const finiteValues = finite.map((row) => row[metric]);
  expect(sampled.rawCount, context).toBe(rows.length);
  expect(sampled.invalidCount, context).toBe(rows.length - finite.length);
  expect(sampled.min, context).toBe(finite.length ? Math.min(...finiteValues) : null);
  expect(sampled.max, context).toBe(finite.length ? Math.max(...finiteValues) : null);
  expect(sampled.latest, context).toBe(
    rows.length && Number.isFinite(rows.at(-1)![metric]) ? rows.at(-1)![metric] : null,
  );
  expect(sampled.x.length, context).toBe(sampled.y.length);
  const expectedGapCount = rows
    .slice(1)
    .filter((row, index) => row.step - rows[index]!.step > 1).length;
  expect(sampled.gapCount, context).toBe(expectedGapCount);

  const originalByStep = new Map(rows.map((row) => [row.step, row]));
  for (let index = 0; index < sampled.x.length; index++) {
    const step = sampled.x[index]!;
    expect(Number.isFinite(step), context).toBe(true);
    expect(step, context).toBeGreaterThanOrEqual(range.min);
    expect(step, context).toBeLessThanOrEqual(range.max);
    if (index) expect(step, context).toBeGreaterThan(sampled.x[index - 1]!);
    const value = sampled.y[index];
    if (value !== null) {
      expect(originalByStep.get(step)?.[metric], `${context}; source point ${step}`).toBe(value);
      expect(Number.isFinite(value), context).toBe(true);
    }
    if (index && value !== null && sampled.y[index - 1] !== null) {
      const between = rows.filter((row) => row.step >= sampled.x[index - 1]! && row.step <= step);
      expect(
        between.every((row) => Number.isFinite(row[metric])),
        `${context}; finite segment crossed invalid data`,
      ).toBe(true);
      expect(
        between.slice(1).every((row, at) => row.step - between[at]!.step <= 1),
        `${context}; finite segment crossed absent steps`,
      ).toBe(true);
    }
  }

  // Full groups provide an independent oracle for the extrema that each numeric
  // bucket must preserve. Invalid measurements and absent steps end a group.
  const buckets = Math.max(1, Math.min(4_096, Math.floor(width)));
  const low = Math.max(reference[0]?.step ?? 0, range.min);
  const high = Math.min(reference.at(-1)?.step ?? 1, range.max);
  const groups: RawPoint[][] = [];
  let active: RawPoint[] | undefined;
  let activeBucket: number | undefined;
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]!;
    if (!Number.isFinite(row[metric])) {
      active = undefined;
      activeBucket = undefined;
      continue;
    }
    const bucket = Math.min(
      buckets - 1,
      Math.floor(((row.step - low) / Math.max(Number.EPSILON, high - low)) * buckets),
    );
    const afterGap = index > 0 && row.step - rows[index - 1]!.step > 1;
    if (!active || activeBucket !== bucket || afterGap) {
      active = [];
      activeBucket = bucket;
      groups.push(active);
    }
    active.push(row);
  }
  const selected = new Map(sampled.x.map((step, index) => [step, sampled.y[index]]));
  for (const group of groups) {
    const minimum = group.reduce((best, row) => (row[metric] < best[metric] ? row : best));
    const maximum = group.reduce((best, row) => (row[metric] > best[metric] ? row : best));
    for (const required of [group[0]!, group.at(-1)!, minimum, maximum]) {
      expect(
        selected.get(required.step),
        `${context}; required boundary/extreme at ${required.step}`,
      ).toBe(required[metric]);
    }
  }
}

describe('adversarial deterministic sampling oracle', () => {
  it('agrees with independent last-arrival normalization over 128 shuffled malformed inputs', () => {
    for (let seed = 1; seed <= 128; seed++) {
      const random = seedRandom(seed);
      const rows: RawPoint[] = Array.from({ length: 75 }, (_, index) => {
        const step =
          index % 19 === 0
            ? NaN
            : index % 13 === 0
              ? 1.25
              : index % 17 === 0
                ? Number.MAX_SAFE_INTEGER + 1
                : Math.floor(random() * 40) - 10;
        const value =
          index % 11 === 0 ? NaN : index % 17 === 0 ? Infinity : (random() - 0.5) * 1_000;
        return point(step, value);
      });
      const expected = referenceCanonical(rows);
      const actual = canonicalize(rows);
      expect(Array.from(actual.step), `seed ${seed}`).toEqual(expected.map((row) => row.step));
      for (const metric of METRICS)
        expect(Array.from(actual[metric]), `${metric}; seed ${seed}`).toEqual(
          expected.map((row) => row[metric]),
        );
      expect(actual.duplicateCount, `seed ${seed}`).toBe(
        rows.filter((row) => Number.isSafeInteger(row.step) && row.step >= 0).length -
          expected.length,
      );
    }
  });

  it('preserves source identity, exact statistics, each segment extrema and breaks for all three metrics over 192 seeded datasets', () => {
    for (let seed = 1; seed <= 192; seed++) {
      const random = seedRandom(seed ^ 0xa55a51);
      const rows: RawPoint[] = [];
      const offset =
        seed % 3 === 0 ? 0 : seed % 3 === 1 ? 1_000_000 : Number.MAX_SAFE_INTEGER - 200;
      const interval = 1;
      for (let index = 0; index < 64; index++) {
        if (index > 0 && random() < 0.1) continue;
        const step = offset + index * interval;
        const value =
          index % 23 === 0
            ? NaN
            : index % 29 === 0
              ? Infinity
              : Math.sin(index * 0.8 + seed) * 15 + (random() - 0.5);
        rows.push(point(step, value));
        if (random() < 0.12)
          rows.push(point(step, index % 5 === 0 ? -Infinity : (random() - 0.5) * 100));
      }
      rows.push(point(-1, 1), point(0.125, 2), point(Number.MAX_SAFE_INTEGER + 1, 3));
      // Fisher-Yates changes which duplicate is last received; reference observes
      // the exact same arrival stream rather than assuming generator order.
      for (let index = rows.length - 1; index > 0; index--) {
        const other = Math.floor(random() * (index + 1));
        [rows[index], rows[other]] = [rows[other]!, rows[index]!];
      }
      const expected = referenceCanonical(rows);
      const actual = canonicalize(rows);
      const low = expected[0]!.step,
        high = expected.at(-1)!.step;
      const a = low + (high - low) * random(),
        b = low + (high - low) * random();
      const ranges = [
        { min: low, max: high },
        { min: Math.min(a, b), max: Math.max(a, b) },
      ];
      for (const range of ranges)
        for (const metric of METRICS) {
          const width = [1, 2, 3, 7, 17, 31][seed % 6]!;
          assertViewport(
            expected,
            metric,
            width,
            range,
            sampleMetric(actual, metric, width, range),
            `seed ${seed}; ${metric}; ${JSON.stringify(range)}`,
          );
        }
    }
  });

  it('retains each required extrema when multiple positive and negative outliers sit on bucket and viewport edges', () => {
    const rows = Array.from({ length: 257 }, (_, step) =>
      point(step, step % 32 === 0 ? (step % 64 === 0 ? 1_000 + step : -1_000 - step) : step / 257),
    );
    const actual = canonicalize(rows);
    const ranges = [
      { min: 0, max: 256 },
      { min: 32, max: 224 },
      { min: 63.999, max: 192.001 },
      { min: 64, max: 64 },
      { min: 65, max: 191 },
    ];
    for (const range of ranges)
      for (const width of [1, 2, 4, 8, 16, 255, 256])
        for (const metric of METRICS) {
          assertViewport(
            rows,
            metric,
            width,
            range,
            sampleMetric(actual, metric, width, range),
            `${metric}; width ${width}; ${JSON.stringify(range)}`,
          );
        }
  });

  it('uses exact inclusive integer bounds and excludes the next step beyond a fractional viewport endpoint', () => {
    const cases = [
      {
        rows: [point(0, 2), point(1, 99)],
        range: { min: 0, max: 0.9999999999999999 },
        expected: [0],
      },
      {
        rows: [point(1, 2), point(2, 99)],
        range: { min: 1, max: 1.9999999999999998 },
        expected: [1],
      },
      {
        rows: [point(Number.MAX_SAFE_INTEGER - 1, 2), point(Number.MAX_SAFE_INTEGER, 99)],
        range: { min: Number.MAX_SAFE_INTEGER - 1, max: Number.MAX_SAFE_INTEGER - 1 },
        expected: [Number.MAX_SAFE_INTEGER - 1],
      },
      { rows: [point(0, 2), point(1, 99)], range: { min: 0, max: 1 }, expected: [0, 1] },
    ];
    for (const { rows, range, expected } of cases) {
      const sampled = sampleMetric(canonicalize(rows), 'loss', 10, range);
      expect(sampled.x, JSON.stringify(range)).toEqual(expected);
      expect(sampled.rawCount).toBe(expected.length);
    }
  });

  it('rejects unsupported source step coordinates instead of silently rounding or inventing chart positions', () => {
    const invalidSteps = [-1, -0.1, 0.1, 1.25, Number.MAX_SAFE_INTEGER + 1, 1e308, Infinity, NaN];
    const run = canonicalize([
      point(0, 4),
      ...invalidSteps.map((step) => point(step, 99)),
      point(1, 3),
    ]);
    expect(Array.from(run.step)).toEqual([0, 1]);
    expect(run.rejectedStepCount).toBe(invalidSteps.length);
    expect(sampleMetric(run, 'loss', 1).y).toEqual([4, 3]);
  });

  it('retains both finite extremes and a distinct gap marker near the largest supported source step', () => {
    const left = Number.MAX_SAFE_INTEGER - 10,
      right = Number.MAX_SAFE_INTEGER;
    const run = canonicalize([point(left, 2), point(right, 3)]);
    const sampled = sampleMetric(run, 'loss', 1);
    expect(sampled.x.every(Number.isFinite)).toBe(true);
    expect(sampled.y).toEqual([2, null, 3]);
    expect(sampled.x[1]).toBeGreaterThan(left);
    expect(sampled.x[1]).toBeLessThan(right);
  });
});
