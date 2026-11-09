import type { SourceSnapshot } from '../domain/types';

/** Source identity is immutable and separate from the time this browser prepared
 * a view. Reloading this fixture does not advance its revision or recorded time.
 */
export const SOURCE_SNAPSHOT = Object.freeze({
  kind: 'synthetic',
  revision: 'soup-fixtures-v2',
  recordedAt: '2026-11-09T18:00:00.000Z',
} as const satisfies SourceSnapshot);
