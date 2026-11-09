import { describe, expect, it, vi } from 'vitest';
import { getRunDetail } from './engine';
import { generateRun } from './fixtures';
import { RUNS } from './runs';
import { SOURCE_SNAPSHOT } from './source';

describe('synthetic data source', () => {
  it('contains exactly 20 stable IDs with ISO timestamps and one million-point run', () => {
    expect(RUNS).toHaveLength(20);
    expect(new Set(RUNS.map((run) => run.id)).size).toBe(20);
    expect(RUNS.filter((run) => run.pointCount === 1_000_000)).toHaveLength(1);
    for (const run of RUNS) {
      expect(new Date(run.startedAt).toISOString()).toBe(run.startedAt);
      expect(run.startedAt).toMatch(/Z$/);
    }
  });
  it('generates deterministic source values', () => {
    const first = generateRun('run-002');
    const second = generateRun('run-002');
    expect(first.loss).toEqual(second.loss);
  });
  it('reports invalid measurements, sorted data, duplicates and gaps explicitly', () => {
    expect(getRunDetail('run-003').issues.some((issue) => issue.kind === 'non-finite')).toBe(true);
    expect(getRunDetail('run-004').metrics.loss.y).toContain(null);
    expect(getRunDetail('run-005').issues.some((issue) => issue.kind === 'order')).toBe(true);
    expect(getRunDetail('run-006').metrics.loss.duplicateCount).toBeGreaterThan(0);
    expect(getRunDetail('run-007').metrics.loss.gapCount).toBe(1);
    expect(getRunDetail('run-008').metrics.loss.min).toBe(0);
  });
  it('keeps list summaries consistent with full-run detail observations and latest values', () => {
    for (const summary of RUNS) {
      const detail = getRunDetail(summary.id, { width: 1 });
      expect(detail.issues.length, summary.id).toBe(summary.issueCount);
      expect(detail.metrics.loss.latest, summary.id).toBe(summary.loss);
      expect(detail.metrics.loss.domain.max, summary.id).toBe(summary.steps);
      expect(summary.steps, summary.id).toBeLessThanOrEqual(summary.maxSteps);
      expect(summary.pointCount, summary.id).toBeGreaterThanOrEqual(detail.metrics.loss.rawCount);
      if (summary.status === 'completed') expect(summary.steps).toBe(summary.maxSteps);
    }
  });
  it('does not substitute another run for an unknown identifier', () => {
    expect(() => getRunDetail('unknown')).toThrow('does not exist');
  });
  it('binds each sampled response to its requested run and zoom', () => {
    const result = getRunDetail('run-002', { range: { min: 100, max: 200 }, width: 20 });
    expect(result.run.id).toBe('run-002');
    expect(result.metrics.loss.rawCount).toBe(101);
    expect(result.metrics.loss.domain.max).toBe(RUNS[1]!.steps);
    expect(result.metrics.loss.x.every((step) => step >= 100 && step <= 200)).toBe(true);
  });
  it('binds deterministic run chronology to the immutable recorded source snapshot', () => {
    expect(Object.isFrozen(SOURCE_SNAPSHOT)).toBe(true);
    for (const run of RUNS) {
      const recordedEnd = Date.parse(run.startedAt) + run.durationSeconds * 1_000;
      expect(recordedEnd, run.id).toBeLessThanOrEqual(Date.parse(SOURCE_SNAPSHOT.recordedAt));
      expect(getRunDetail(run.id, { width: 1 }).source).toEqual(SOURCE_SNAPSHOT);
    }
    vi.useFakeTimers();
    try {
      vi.setSystemTime('2026-11-10T00:00:00.000Z');
      const first = getRunDetail('run-002');
      vi.advanceTimersByTime(60_000);
      const second = getRunDetail('run-002');
      expect(first.source).toBe(SOURCE_SNAPSHOT);
      expect(second.source).toBe(SOURCE_SNAPSHOT);
      expect(Date.parse(second.fetchedAt) - Date.parse(first.fetchedAt)).toBe(60_000);
    } finally {
      vi.useRealTimers();
    }
  });
});
