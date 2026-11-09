import { describe, expect, it } from 'vitest';
import { getRunDetail } from './engine';
import { RUNS } from './runs';
import { isRunDetail } from './validate-response';
import { SOURCE_SNAPSHOT } from './source';
import type { RunDetail } from '../domain/types';

const fixture = () => getRunDetail('run-002', { width: 4 });
describe('worker response boundary', () => {
  it('accepts real full, finite/invalid-only, empty, and fractional-boundary viewports', () => {
    for (const run of RUNS) {
      for (const range of [
        undefined,
        { min: 50.1, max: 54.99999999999999 },
        { min: 0, max: 0 },
        { min: run.steps + 1, max: run.steps + 2 },
      ]) {
        expect(
          isRunDetail(getRunDetail(run.id, { range, width: 3 }), run.id, range),
          `${run.id} ${JSON.stringify(range)}`,
        ).toBe(true);
      }
    }
    const range = { min: 4_200, max: 4_210 };
    expect(isRunDetail(getRunDetail('run-003', { range }), 'run-003', range)).toBe(true);
  });
  it('rejects malformed and mismatched identities, metadata, statistics, and coordinates', () => {
    const mutations: ((detail: RunDetail) => void)[] = [
      (detail) => {
        detail.run.id = 'run-003';
      },
      (detail) => {
        detail.run.steps = NaN;
      },
      (detail) => {
        detail.run.issueCount += 1;
      },
      (detail) => {
        detail.fetchedAt = 'unknown';
      },
      (detail) => {
        detail.metrics.loss.x[0] = NaN;
      },
      (detail) => {
        detail.metrics.loss.x[1] = detail.metrics.loss.x[0]!;
      },
      (detail) => {
        detail.metrics.loss.y[0] = Infinity;
      },
      (detail) => {
        detail.metrics.loss.latest = 1234;
      },
      (detail) => {
        detail.metrics.loss.rawCount = -1;
      },
      (detail) => {
        detail.metrics.loss.max = 1234;
      },
      (detail) => {
        detail.metrics.loss.x.pop();
      },
      (detail) => {
        detail.metrics.lr.domain.max -= 1;
      },
      (detail) => {
        detail.metrics.grad_norm.rawCount -= 1;
      },
    ];
    for (const [index, mutate] of mutations.entries()) {
      const detail = fixture();
      mutate(detail);
      expect(isRunDetail(detail, 'run-002'), `corruption ${index}`).toBe(false);
    }
    for (const malformed of [
      null,
      undefined,
      0,
      {},
      { run: {} },
      { run: {}, metrics: {}, issues: [], fetchedAt: '2026-11-10' },
    ]) {
      expect(isRunDetail(malformed, 'run-002')).toBe(false);
    }
  });
  it('rejects samples outside the requested viewport even if the full run identity matches', () => {
    expect(isRunDetail(fixture(), 'run-002', { min: 50, max: 60 })).toBe(false);
  });
  it('rejects stale revisions, missing source identity and impossible source times', () => {
    const original = fixture();
    expect(isRunDetail(original, 'run-002')).toBe(true);
    for (const source of [
      undefined,
      { ...SOURCE_SNAPSHOT, kind: 'live' },
      { ...SOURCE_SNAPSHOT, revision: 'soup-fixtures-v1' },
      { ...SOURCE_SNAPSHOT, recordedAt: '2026-11-09T17:00:00.000Z' },
      { ...SOURCE_SNAPSHOT, recordedAt: '2099-01-01T00:00:00.000Z' },
      { ...SOURCE_SNAPSHOT, recordedAt: 'not-a-date' },
    ])
      expect(isRunDetail({ ...original, source }, 'run-002')).toBe(false);
    expect(isRunDetail({ ...original, fetchedAt: '2026-11-09T17:59:59.000Z' }, 'run-002')).toBe(
      false,
    );
  });
});
