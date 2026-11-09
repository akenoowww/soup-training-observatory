import type { Range } from '../../domain/types';

export type RunTab = 'metrics' | 'quality' | 'config';
export type ChartScale = 'linear' | 'log';

export interface RunViewOptions {
  range?: Range;
  invalidRange: boolean;
  tab: RunTab;
  scale: ChartScale;
}

/** URL values are untrusted input, not implicit numeric zero. */
export function parseRunView(params: URLSearchParams, lastStep: number): RunViewOptions {
  const from = params.get('min');
  const to = params.get('max');
  const hasRange = from !== null || to !== null;
  const min = from === null || from.trim() === '' ? NaN : Number(from);
  const max = to === null || to.trim() === '' ? NaN : Number(to);
  const valid =
    Number.isFinite(min) && Number.isFinite(max) && min >= 0 && min < max && max <= lastStep;
  const tabValue = params.get('tab');
  return {
    range: valid ? { min, max } : undefined,
    invalidRange: hasRange && !valid,
    tab: tabValue === 'quality' || tabValue === 'config' ? tabValue : 'metrics',
    scale: params.get('scale') === 'log' ? 'log' : 'linear',
  };
}

/** Keep requested intervals within the recorded domain, preserving fractional bounds. */
export function constrainRange(range: Range | undefined, lastStep: number): Range | undefined {
  if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max)) return undefined;
  const min = Math.max(0, Math.min(lastStep, range.min));
  const max = Math.max(0, Math.min(lastStep, range.max));
  if (min >= max || (min === 0 && max === lastStep)) return undefined;
  return { min, max };
}

export function zoomRange(current: Range, domain: Range, factor: number): Range {
  const span = Math.min(domain.max - domain.min, Math.max(1, (current.max - current.min) * factor));
  const center = current.min + (current.max - current.min) / 2;
  const min = Math.max(domain.min, Math.min(domain.max - span, center - span / 2));
  return { min, max: min + span };
}
