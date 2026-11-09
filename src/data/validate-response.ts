import { METRICS, type Range, type RunDetail, type SeriesResult } from '../domain/types';
import { SOURCE_SNAPSHOT } from './source';

const statuses = new Set(['running', 'completed', 'failed', 'stopped']);
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const measurement = (value: unknown): value is number | null => value === null || finite(value);
const date = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function validSeries(value: unknown, range: Range | undefined): value is SeriesResult {
  if (
    !record(value) ||
    !Array.isArray(value.x) ||
    !Array.isArray(value.y) ||
    value.x.length !== value.y.length
  )
    return false;
  if (
    !record(value.domain) ||
    !finite(value.domain.min) ||
    !finite(value.domain.max) ||
    value.domain.min > value.domain.max
  )
    return false;
  if (
    !count(value.rawCount) ||
    !count(value.renderedCount) ||
    value.renderedCount !== value.x.length ||
    !count(value.invalidCount) ||
    value.invalidCount > value.rawCount ||
    !count(value.gapCount) ||
    !count(value.duplicateCount)
  )
    return false;
  if (!measurement(value.min) || !measurement(value.max) || !measurement(value.latest))
    return false;
  let minimum = Infinity;
  let maximum = -Infinity;
  for (let index = 0; index < value.x.length; index++) {
    const step: unknown = value.x[index];
    const y: unknown = value.y[index];
    if (
      !finite(step) ||
      !measurement(y) ||
      step < value.domain.min ||
      step > value.domain.max ||
      (range && (step < range.min || step > range.max)) ||
      (index > 0 && step <= value.x[index - 1])
    )
      return false;
    if (y !== null) {
      minimum = Math.min(minimum, y);
      maximum = Math.max(maximum, y);
    }
  }
  // Extrema are guaranteed retained: inconsistent summaries must not reach Canvas.
  if (
    value.min !== (minimum === Infinity ? null : minimum) ||
    value.max !== (maximum === -Infinity ? null : maximum)
  )
    return false;
  if (value.latest !== (value.y.at(-1) ?? null)) return false;
  return value.rawCount !== 0 || value.x.length === 0;
}

/** The module worker is an asynchronous data boundary. Validate values as well as
 * run identity: compile-time interfaces cannot protect against a stale/incompatible
 * worker or malformed transport payload.
 */
export function isRunDetail(
  value: unknown,
  expectedRunId: string,
  range?: Range,
): value is RunDetail {
  if (
    !record(value) ||
    !record(value.run) ||
    !record(value.metrics) ||
    !Array.isArray(value.issues) ||
    !date(value.fetchedAt)
  )
    return false;
  if (
    !record(value.source) ||
    value.source.kind !== SOURCE_SNAPSHOT.kind ||
    value.source.revision !== SOURCE_SNAPSHOT.revision ||
    value.source.recordedAt !== SOURCE_SNAPSHOT.recordedAt
  )
    return false;
  const recordedAt = Date.parse(SOURCE_SNAPSHOT.recordedAt);
  const preparedAt = Date.parse(value.fetchedAt);
  if (recordedAt > Date.now() || preparedAt < recordedAt || preparedAt > Date.now() + 1_000)
    return false;
  const run = value.run;
  if (
    run.id !== expectedRunId ||
    !text(run.name) ||
    !text(run.model) ||
    !text(run.dataset) ||
    typeof run.status !== 'string' ||
    !statuses.has(run.status) ||
    !count(run.steps) ||
    !count(run.maxSteps) ||
    run.steps > run.maxSteps ||
    !measurement(run.loss) ||
    !date(run.startedAt) ||
    !finite(run.durationSeconds) ||
    run.durationSeconds < 0 ||
    !Array.isArray(run.tags) ||
    !run.tags.every(text) ||
    !count(run.issueCount) ||
    !count(run.pointCount) ||
    run.issueCount !== value.issues.length
  )
    return false;
  if (Date.parse(run.startedAt) + run.durationSeconds * 1_000 > recordedAt) return false;
  if (
    !value.issues.every(
      (issue: unknown) =>
        record(issue) && text(issue.kind) && text(issue.message) && count(issue.count),
    )
  )
    return false;
  const metrics = value.metrics;
  if (!METRICS.every((metric) => validSeries(metrics[metric], range))) return false;
  const loss = metrics.loss as SeriesResult;
  return METRICS.every((metric) => {
    const series = metrics[metric] as SeriesResult;
    return (
      series.rawCount === loss.rawCount &&
      series.rawCount <= (run.pointCount as number) &&
      series.domain.min === loss.domain.min &&
      series.domain.max === loss.domain.max &&
      series.domain.max === run.steps
    );
  });
}
