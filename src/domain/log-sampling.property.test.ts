import { describe, expect, it } from 'vitest';
import { canonicalize, sampleMetric } from './series';
import { METRICS, type Metric, type Range, type RawPoint, type SeriesResult } from './types';

const row = (step: number, value: number): RawPoint => ({
  step,
  loss: value,
  lr: value / 1_000_000,
  grad_norm: value * -3,
});
const positive = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value) && value > 0;

/** Last-arrival Map and materialized source groups are deliberately separate
 * from the production typed-array ordering and streaming extrema selection. */
function referenceRows(arrivals: readonly RawPoint[]): RawPoint[] {
  const last = new Map<number, RawPoint>();
  for (const item of arrivals)
    if (Number.isSafeInteger(item.step) && item.step >= 0) last.set(item.step, item);
  return [...last.values()].sort((a, b) => a.step - b.step);
}
function randomFrom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1_103_515_245) + 12_345) >>> 0;
    return value / 4_294_967_296;
  };
}
function assertLogViewport(
  reference: readonly RawPoint[],
  metric: Metric,
  width: number,
  range: Range,
  sampled: SeriesResult,
  context: string,
) {
  const source = reference.filter((item) => item.step >= range.min && item.step <= range.max);
  const finite = source.map((item) => item[metric]).filter(Number.isFinite);
  const byStep = new Map(source.map((item) => [item.step, item[metric]]));
  const selected = new Map(sampled.x.map((step, index) => [step, sampled.y[index]]));
  const plotted = sampled.y.map((value) => (positive(value) ? value : null));
  expect(sampled.rawCount, context).toBe(source.length);
  expect(sampled.invalidCount, context).toBe(source.length - finite.length);
  expect(sampled.min, context).toBe(finite.length ? Math.min(...finite) : null);
  expect(sampled.max, context).toBe(finite.length ? Math.max(...finite) : null);
  expect(sampled.latest, context).toBe(
    source.length && Number.isFinite(source.at(-1)![metric]) ? source.at(-1)![metric] : null,
  );
  for (let index = 0; index < sampled.x.length; index++) {
    const step = sampled.x[index]!;
    if (index) expect(step, context).toBeGreaterThan(sampled.x[index - 1]!);
    if (sampled.y[index] !== null) expect(byStep.get(step), context).toBe(sampled.y[index]);
    if (index && plotted[index] !== null && plotted[index - 1] !== null) {
      const connected = source.filter(
        (item) => item.step >= sampled.x[index - 1]! && item.step <= step,
      );
      expect(
        connected.every((item) => positive(item[metric])),
        `${context}; line bridges a nonpositive/nonfinite source measurement`,
      ).toBe(true);
      expect(
        connected.slice(1).every((item, at) => item.step - connected[at]!.step === 1),
        `${context}; line bridges an absent training step`,
      ).toBe(true);
    }
  }

  // Form full positive source components before assigning bucket groups. A
  // zero/negative/invalid value or absent step ends a component, even when it is
  // not the global minimum of its bucket and would otherwise be discarded.
  const components: RawPoint[][] = [];
  let active: RawPoint[] | undefined;
  for (const item of source) {
    if (!positive(item[metric])) {
      active = undefined;
      continue;
    }
    if (!active || item.step - active.at(-1)!.step !== 1) {
      active = [];
      components.push(active);
    }
    active.push(item);
  }
  const low = Math.max(reference[0]?.step ?? 0, range.min);
  const high = Math.min(reference.at(-1)?.step ?? 1, range.max);
  const buckets = Math.max(1, Math.min(4_096, Math.floor(width)));
  for (const component of components) {
    const groups = new Map<number, RawPoint[]>();
    for (const item of component) {
      const bucket = Math.min(
        buckets - 1,
        Math.floor(((item.step - low) / Math.max(Number.EPSILON, high - low)) * buckets),
      );
      groups.set(bucket, [...(groups.get(bucket) ?? []), item]);
    }
    for (const members of groups.values()) {
      const ordered = [...members].sort((a, b) => a[metric] - b[metric]);
      for (const required of [members[0]!, members.at(-1)!]) {
        expect(
          selected.get(required.step),
          `${context}; positive segment boundary missing at ${required.step}`,
        ).toBe(required[metric]);
      }
      // Equal extrema need not select one particular tied source index. Assert
      // the extreme values survive, while source identity is checked above.
      const retained = members
        .filter((item) => selected.has(item.step))
        .map((item) => item[metric]);
      expect(retained, `${context}; positive segment minimum missing`).toContain(
        ordered[0]![metric],
      );
      expect(retained, `${context}; positive segment maximum missing`).toContain(
        ordered.at(-1)![metric],
      );
    }
  }
}

describe('independent logarithmic reduction invariants', () => {
  it('preserves every positive component around several excluded intervals over seeded arrivals', () => {
    for (let seed = 1; seed <= 48; seed++) {
      const random = randomFrom(seed ^ 0x5c01f00d);
      const arrivals: RawPoint[] = [];
      for (let step = 0; step < 96; step++) {
        if (step > 0 && step < 95 && random() < 0.08) continue;
        const value =
          step % 19 === 0
            ? NaN
            : step % 23 === 0
              ? Infinity
              : step % 11 === 0
                ? -20 - random()
                : step % 7 === 0
                  ? -random()
                  : step % 5 === 0
                    ? 0
                    : 1 + random() * 30;
        arrivals.push(row(step, value));
        if (random() < 0.15) arrivals.push(row(step, step % 3 === 0 ? 0 : 3 + random()));
      }
      // Sorting this stream must apply its real last-received values, not an
      // assumed numeric-step order. The reference observes the same arrivals.
      for (let index = arrivals.length - 1; index > 0; index--) {
        const other = Math.floor(random() * (index + 1));
        [arrivals[index], arrivals[other]] = [arrivals[other]!, arrivals[index]!];
      }
      const reference = referenceRows(arrivals);
      const actual = canonicalize(arrivals);
      const ranges = [
        { min: 0, max: 95 },
        { min: 15.25, max: 80.75 },
        { min: 29, max: 61 },
      ];
      for (const width of [1, 2, 7, 31, 320])
        for (const range of ranges)
          for (const metric of METRICS)
            assertLogViewport(
              reference,
              metric,
              width,
              range,
              sampleMetric(actual, metric, width, range),
              `seed=${seed}; metric=${metric}; width=${width}; range=${range.min}:${range.max}`,
            );
    }
  }, 20_000);

  it('reduces a long zero plateau while retaining its break and honest source statistics', () => {
    const count = 50_000;
    const steps = Float64Array.from({ length: count }, (_, index) => index);
    const loss = new Float64Array(count);
    loss.fill(0);
    loss[0] = 2;
    loss[count - 1] = 3;
    const actual = canonicalize({
      step: steps,
      loss,
      lr: new Float64Array(loss),
      grad_norm: new Float64Array(loss),
    });
    for (const width of [1, 2, 16, 320]) {
      const sampled = sampleMetric(actual, 'loss', width);
      expect(sampled.renderedCount).toBeLessThanOrEqual(width * 4 + 8);
      expect(sampled.min).toBe(0);
      expect(sampled.max).toBe(3);
      expect(sampled.latest).toBe(3);
      expect(sampled.invalidCount).toBe(0);
      expect(sampled.y[0]).toBe(2);
      expect(sampled.y.at(-1)).toBe(3);
      expect(sampled.y.slice(1, -1).some((value) => value === 0)).toBe(true);
    }
  });
});
