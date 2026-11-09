import { canonicalize } from '../domain/series';
import type { CanonicalRun, ColumnarRun } from '../domain/types';
import { measurementAt, RUNS } from './runs';

/** A deterministic generator, including deliberately malformed measurements. */
export function generateRun(id: string): CanonicalRun {
  const index = RUNS.findIndex((run) => run.id === id);
  const summary = RUNS[index];
  if (!summary) throw new Error('This run does not exist. Choose a run from the list.');
  const count = summary.pointCount;
  const columns: ColumnarRun = {
    step: new Float64Array(count),
    loss: new Float64Array(count),
    lr: new Float64Array(count),
    grad_norm: new Float64Array(count),
  };
  for (let i = 0; i < count; i++) {
    const step = i + (index === 6 && i >= Math.floor(count / 2) ? 120 : 0);
    const point = measurementAt(index, step, count);
    columns.step[i] = step;
    columns.loss[i] = point.loss;
    columns.lr[i] = point.lr;
    columns.grad_norm[i] = point.grad_norm;
  }
  // Scramble source order without changing the measurements associated with steps.
  if (index === 4) {
    for (let i = 100; i < count - 1; i += 271) {
      for (const key of ['step', 'loss', 'lr', 'grad_norm'] as const) {
        const temp = columns[key][i]!;
        columns[key][i] = columns[key][i + 1]!;
        columns[key][i + 1] = temp;
      }
    }
  }
  // Duplicates explicitly use the newest received measurement, including invalids.
  if (index === 5) {
    for (let i = 1_000; i < count; i += 2_000) {
      columns.step[i] = columns.step[i - 1]!;
      columns.loss[i] = columns.loss[i - 1]! + 0.08;
    }
  }
  return canonicalize(columns);
}
