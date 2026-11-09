import { sampleMetric } from '../domain/series';
import type { CanonicalRun, DataIssue, Metric, Range, RunDetail, RunSummary } from '../domain/types';
import { generateRun } from './fixtures';
import { RUNS } from './runs';

const CACHE_LIMIT = 2;
interface StoredRun { run: CanonicalRun; issues: DataIssue[] }
const cache = new Map<string, StoredRun>();

function inspect(run: CanonicalRun, id: string): DataIssue[] {
  const issues: DataIssue[] = [];
  const loss = sampleMetric(run, 'loss', 1);
  const grad = sampleMetric(run, 'grad_norm', 1);
  if (loss.invalidCount) issues.push({ kind: 'non-finite', message: 'Non-finite loss measurements are shown as gaps, never as zero.', count: loss.invalidCount });
  if (grad.invalidCount) issues.push({ kind: 'non-finite', message: 'Non-finite gradient measurements are shown as gaps.', count: grad.invalidCount });
  if (run.duplicateCount) issues.push({ kind: 'duplicates', message: 'Duplicate steps use the last received measurement.', count: run.duplicateCount });
  if (run.reorderedCount) issues.push({ kind: 'order', message: 'Out-of-order measurements were sorted by numeric step.', count: run.reorderedCount });
  if (loss.gapCount) issues.push({ kind: 'missing-steps', message: 'Missing steps break the line; values are not interpolated.', count: loss.gapCount });
  if (run.rejectedStepCount) issues.push({ kind: 'invalid-step', message: 'Measurements without a finite numeric step were rejected.', count: run.rejectedStepCount });
  if (id === 'run-001') issues.push({ kind: 'spike', message: 'Loss spikes to 9.4 at step 500,000. Extrema are retained at every zoom level.', count: 1 });
  if (id === 'run-008') issues.push({ kind: 'zero', message: 'Zero values are present. They are excluded from log scale and remain visible on linear scale.', count: 6 });
  if (id === 'run-017') issues.push({ kind: 'divergence', message: 'Loss and gradient norm increase toward the end of this run.', count: 1 });
  return issues;
}

function getStoredRun(id: string): StoredRun {
  const cached = cache.get(id);
  if (cached) { cache.delete(id); cache.set(id, cached); return cached; }
  const run = generateRun(id);
  const stored = { run, issues: inspect(run, id) };
  cache.set(id, stored);
  while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  return stored;
}

export function getRunDetail(id: string, options: { range?: Range; width?: number } = {}): RunDetail {
  const metadata = RUNS.find((run) => run.id === id);
  if (!metadata) throw new Error('This run does not exist. Choose a run from the list.');
  const stored = getStoredRun(id);
  const metrics = Object.fromEntries((['loss', 'lr', 'grad_norm'] as Metric[]).map((metric) => [
    metric, sampleMetric(stored.run, metric, options.width, options.range),
  ])) as RunDetail['metrics'];
  const actualSummary: RunSummary = { ...metadata, issueCount: stored.issues.length };
  return { run: actualSummary, metrics, issues: stored.issues, fetchedAt: new Date().toISOString() };
}
export function clearRunCache(): void { cache.clear(); }
