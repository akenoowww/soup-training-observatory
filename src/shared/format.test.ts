import { describe, expect, it } from 'vitest';
import { compact, duration, metricNumber, number, utcDate } from './format';

describe('display values retain their data meaning', () => {
  it('keeps unavailable measurements distinct from numeric zero', () => {
    for (const value of [null, undefined, NaN, Infinity, -Infinity]) expect(metricNumber(value)).toBe('Unavailable');
    expect(metricNumber(0)).toBe('0.0000');
  });
  it('uses readable scientific notation for learning rates without rounding them to zero', () => {
    expect(metricNumber(0.000012345)).toBe('1.23e-5');
    expect(metricNumber(-0.000012345)).toBe('-1.23e-5');
    expect(metricNumber(0.123456)).toBe('0.1235');
  });
  it('formats full steps numerically and reserves compact notation for explicit summaries', () => {
    expect(number(999_999)).toBe('999,999');
    expect(compact(1_000_000)).toBe('1M');
    expect(number(1234.5678, 2)).toBe('1,234.57');
  });
  it('displays equivalent instants in UTC even when input offsets cross calendar dates', () => {
    const expected = 'Nov 10, 09:30 UTC';
    expect(utcDate('2026-11-09T23:30:00-10:00')).toBe(expected);
    expect(utcDate('2026-11-10T14:30:00+05:00')).toBe(expected);
    expect(utcDate('2026-11-10T09:30:00Z')).toBe(expected);
  });
  it('distinguishes UTC midnight and run duration without local timezone arithmetic', () => {
    expect(utcDate('2026-11-10T00:30:00Z')).toBe('Nov 10, 00:30 UTC');
    expect(duration(18_742)).toBe('5h 12m');
    expect(duration(125)).toBe('2m 5s');
  });
});
