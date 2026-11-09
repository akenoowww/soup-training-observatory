export type RunStatus = 'running' | 'completed' | 'failed' | 'stopped';
export type Metric = 'loss' | 'lr' | 'grad_norm';
export const METRICS: readonly Metric[] = ['loss', 'lr', 'grad_norm'];
export interface Range {
  min: number;
  max: number;
}
export interface RunSummary {
  id: string;
  name: string;
  model: string;
  dataset: string;
  status: RunStatus;
  steps: number;
  maxSteps: number;
  loss: number | null;
  startedAt: string;
  durationSeconds: number;
  tags: string[];
  issueCount: number;
  pointCount: number;
}
export interface SeriesResult {
  x: number[];
  y: (number | null)[];
  rawCount: number;
  renderedCount: number;
  invalidCount: number;
  duplicateCount: number;
  gapCount: number;
  min: number | null;
  max: number | null;
  latest: number | null;
  domain: Range;
}
export interface DataIssue {
  kind: string;
  message: string;
  count: number;
}
export interface SourceSnapshot {
  readonly kind: 'synthetic';
  readonly revision: string;
  readonly recordedAt: string;
}
export interface RunDetail {
  readonly source: SourceSnapshot;
  run: RunSummary;
  metrics: Record<Metric, SeriesResult>;
  issues: DataIssue[];
  fetchedAt: string;
}
/** Source step is a nonnegative safe integer; invalid source rows are counted and rejected. */
export interface RawPoint {
  step: number;
  loss: number;
  lr: number;
  grad_norm: number;
}
export interface ColumnarRun {
  step: Float64Array;
  loss: Float64Array;
  lr: Float64Array;
  grad_norm: Float64Array;
}
export interface CanonicalRun extends ColumnarRun {
  duplicateCount: number;
  rejectedStepCount: number;
  reorderedCount: number;
}
