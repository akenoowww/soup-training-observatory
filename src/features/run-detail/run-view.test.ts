import { describe, expect, it } from 'vitest';
import { constrainRange, parseRunView, zoomRange } from './run-view';
import { parseSavedRuns } from '../../shared/useSavedRun';

describe('requested viewport contract', () => {
  it('does not interpret empty, partial, nonfinite or reversed URL ranges as a valid selection', () => {
    for (const query of [
      'min=&max=10',
      'min=0&max=',
      'min=0',
      'max=10',
      'min=NaN&max=10',
      'min=0&max=Infinity',
      'min=10&max=10',
      'min=-1&max=5',
      'min=0&max=101',
    ]) {
      expect(parseRunView(new URLSearchParams(query), 100), query).toMatchObject({
        range: undefined,
        invalidRange: true,
      });
    }
    expect(parseRunView(new URLSearchParams(), 100).invalidRange).toBe(false);
  });
  it('preserves a valid fractional viewport without changing which source steps are requested', () => {
    expect(
      parseRunView(new URLSearchParams('min=1.25&max=8.75&tab=quality&scale=log'), 100),
    ).toEqual({
      range: { min: 1.25, max: 8.75 },
      invalidRange: false,
      tab: 'quality',
      scale: 'log',
    });
    expect(constrainRange({ min: 1.25, max: 8.75 }, 100)).toEqual({ min: 1.25, max: 8.75 });
  });
  it('treats a full-domain range as reset and bounds zoom without shortening it near an edge', () => {
    expect(constrainRange({ min: -5, max: 500 }, 100)).toBeUndefined();
    expect(zoomRange({ min: 0, max: 10 }, { min: 0, max: 100 }, 2)).toEqual({ min: 0, max: 20 });
    expect(zoomRange({ min: 90, max: 100 }, { min: 0, max: 100 }, 2)).toEqual({
      min: 80,
      max: 100,
    });
  });
});

describe('optional saved-run storage', () => {
  it('rejects malformed JSON and the wrong JSON shape instead of calling arbitrary .includes', () => {
    for (const value of ['broken', '"run-001"', '{}', '["run-001",null]'])
      expect(() => parseSavedRuns(value)).toThrow();
    expect(parseSavedRuns(null)).toEqual([]);
    expect(parseSavedRuns('["run-001","run-001","run-002"]')).toEqual(['run-001', 'run-002']);
  });
});
