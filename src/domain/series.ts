import type { CanonicalRun, ColumnarRun, Metric, Range, RawPoint, SeriesResult } from './types';

/** Sort by numeric step, taking the last received value for duplicate steps.
 * Source training steps must be nonnegative safe integers. Fractional viewport
 * bounds are supported; unsafe/fractional source steps are rejected, never rounded.
 * An invalid last duplicate remains invalid: falling back to an older finite value
 * would silently conceal the newest measurement.
 */
export function canonicalize(points: readonly RawPoint[] | ColumnarRun): CanonicalRun {
  const columnar = !Array.isArray(points);
  const source = points as ColumnarRun;
  const records = points as readonly RawPoint[];
  const count = columnar ? source.step.length : records.length;
  if (
    columnar &&
    ['loss', 'lr', 'grad_norm'].some((metric) => source[metric as Metric].length !== count)
  ) {
    throw new Error('Metric columns must contain the same number of measurements as steps.');
  }
  const stepAt = (index: number) => (columnar ? source.step[index]! : records[index]!.step);
  let ordered = true;
  let rejectedStepCount = 0;
  for (let i = 0; i < count; i++) {
    if (!Number.isSafeInteger(stepAt(i)) || stepAt(i) < 0) rejectedStepCount++;
    if (i > 0 && stepAt(i) <= stepAt(i - 1)) ordered = false;
  }
  if (columnar && ordered && rejectedStepCount === 0) {
    return { ...source, duplicateCount: 0, rejectedStepCount: 0, reorderedCount: 0 };
  }
  const indices = Array.from({ length: count }, (_, i) => i)
    .filter((i) => Number.isSafeInteger(stepAt(i)) && stepAt(i) >= 0)
    .sort((a, b) => stepAt(a) - stepAt(b) || a - b);
  const unique: number[] = [];
  let duplicateCount = 0;
  let reorderedCount = 0;
  for (const index of indices) {
    const previous = unique.at(-1);
    if (previous !== undefined && stepAt(previous) === stepAt(index)) {
      unique[unique.length - 1] = index;
      duplicateCount++;
    } else unique.push(index);
  }
  // Compare surviving observations with their original arrival order. Removing
  // duplicates shifts array offsets but does not itself reorder observations.
  if (unique.some((index, position) => position > 0 && index < unique[position - 1]!)) {
    const sourceOrder = [...unique].sort((a, b) => a - b);
    reorderedCount = unique.reduce(
      (moved, index, position) => moved + (index !== sourceOrder[position] ? 1 : 0),
      0,
    );
  }
  const result: ColumnarRun = {
    step: new Float64Array(unique.length),
    loss: new Float64Array(unique.length),
    lr: new Float64Array(unique.length),
    grad_norm: new Float64Array(unique.length),
  };
  unique.forEach((index, outputIndex) => {
    result.step[outputIndex] = stepAt(index);
    for (const metric of ['loss', 'lr', 'grad_norm'] as const) {
      result[metric][outputIndex] = columnar ? source[metric][index]! : records[index]![metric];
    }
  });
  return { ...result, duplicateCount, rejectedStepCount, reorderedCount };
}

export function lowerBound(values: Float64Array, target: number): number {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (values[mid]! < target) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** First index whose value is strictly greater than target. Unlike adding an
 * epsilon before lowerBound, this makes the right viewport edge exactly inclusive
 * without admitting the next source step near a floating-point boundary.
 */
export function upperBound(values: Float64Array, target: number): number {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (values[mid]! <= target) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** Extrema sampling, never averaging. Each pixel bucket retains its first/last,
 * minimum and maximum in original order. Invalid measurements and missing-step
 * boundaries split segments before sampling, so no reduction bridges a gap.
 * Positive/nonpositive transitions also split the reduction state. Their original
 * numeric endpoints remain ordinary finite values on a linear plot, while a log
 * renderer can mask them without reconnecting across a discarded zero/negative
 * interval. One shared snapshot therefore preserves both render transforms.
 */
export function sampleMetric(
  run: CanonicalRun,
  metric: Metric,
  width = 900,
  range?: Range,
): SeriesResult {
  if (
    range &&
    (!Number.isFinite(range.min) || !Number.isFinite(range.max) || range.min > range.max)
  ) {
    throw new Error('The requested step range must have finite ordered bounds.');
  }
  const count = run.step.length;
  const fullDomain = { min: run.step[0] ?? 0, max: run.step[count - 1] ?? 1 };
  const minimum = Math.max(fullDomain.min, range?.min ?? fullDomain.min);
  const maximum = Math.min(fullDomain.max, range?.max ?? fullDomain.max);
  const start = lowerBound(run.step, minimum);
  const end = upperBound(run.step, maximum);
  const safeWidth = Number.isFinite(width) ? width : 900;
  const buckets = Math.max(1, Math.min(4_096, Math.floor(safeWidth)));
  const span = Math.max(Number.EPSILON, maximum - minimum);
  const x: number[] = [];
  const y: (number | null)[] = [];
  let invalidCount = 0;
  let gapCount = 0;
  let minimumValue = Infinity;
  let maximumValue = -Infinity;
  let latest: number | null = null;
  let first = -1;
  let last = -1;
  let minIndex = -1;
  let maxIndex = -1;
  let currentBucket = -1;
  const values = run[metric];
  const append = (index: number) => {
    const step = run.step[index]!;
    if (x.at(-1) === step) return;
    x.push(step);
    y.push(values[index]!);
  };
  const flush = () => {
    if (first < 0) return;
    const indices = [first, minIndex, maxIndex, last].sort((a, b) => a - b);
    let previous = -1;
    for (const index of indices) {
      if (index !== previous) append(index);
      previous = index;
    }
    first = last = minIndex = maxIndex = -1;
  };
  for (let i = start; i < end; i++) {
    const step = run.step[i]!;
    const value = values[i]!;
    if (i > start && step - run.step[i - 1]! > 1) {
      flush();
      x.push(run.step[i - 1]! + (step - run.step[i - 1]!) / 2);
      y.push(null);
      gapCount++;
    }
    if (!Number.isFinite(value)) {
      flush();
      // Collapse only a contiguous invalid interval; finite neighbours are retained.
      if (y.at(-1) !== null) {
        x.push(step);
        y.push(null);
      }
      invalidCount++;
      latest = null;
      continue;
    }
    if (first >= 0) {
      // A single bucket minimum is insufficient: a second zero or a less-negative
      // interval can otherwise disappear, joining positive observations across it
      // after log masking. Keep each sign component's boundaries and extrema.
      const segmentIsPositive = values[first]! > 0;
      const nextIsPositive = value > 0;
      if (segmentIsPositive !== nextIsPositive) flush();
    }
    minimumValue = Math.min(minimumValue, value);
    maximumValue = Math.max(maximumValue, value);
    latest = value;
    const bucket = Math.min(buckets - 1, Math.floor(((step - minimum) / span) * buckets));
    if (bucket !== currentBucket) {
      flush();
      currentBucket = bucket;
    }
    if (first < 0) first = minIndex = maxIndex = i;
    last = i;
    if (value < values[minIndex]!) minIndex = i;
    if (value > values[maxIndex]!) maxIndex = i;
  }
  flush();
  return {
    x,
    y,
    rawCount: Math.max(0, end - start),
    renderedCount: x.length,
    invalidCount,
    duplicateCount: run.duplicateCount,
    gapCount,
    min: minimumValue === Infinity ? null : minimumValue,
    max: maximumValue === -Infinity ? null : maximumValue,
    latest,
    domain: fullDomain,
  };
}

/** Export an unreduced view for the explicit benchmark only. */
export function baselineMetric(run: CanonicalRun, metric: Metric): SeriesResult {
  const y = Array.from(run[metric], (value) => (Number.isFinite(value) ? value : null));
  let min = Infinity;
  let max = -Infinity;
  let invalidCount = 0;
  for (const value of y) {
    if (value === null) invalidCount++;
    else {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  return {
    x: Array.from(run.step),
    y,
    rawCount: run.step.length,
    renderedCount: run.step.length,
    invalidCount,
    duplicateCount: run.duplicateCount,
    gapCount: 0,
    min: min === Infinity ? null : min,
    max: max === -Infinity ? null : max,
    latest: y.at(-1) ?? null,
    domain: { min: run.step[0] ?? 0, max: run.step[run.step.length - 1] ?? 1 },
  };
}
