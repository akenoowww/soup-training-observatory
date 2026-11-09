import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryObserver } from '@tanstack/react-query';
import { createAppQueryClient, INACTIVE_VIEW_TTL_MS } from './queryClient';

afterEach(() => vi.useRealTimers());

describe('viewport retention', () => {
  it('keeps observer navigation attached to the cached query after many unseen ranges', async () => {
    const client = createAppQueryClient();
    const observer = new QueryObserver(client, {
      queryKey: ['run', 'run-001', 0],
      queryFn: async () => ({ value: 0 }),
    });
    const unsubscribe = observer.subscribe(() => {});
    try {
      await observer.refetch();
      for (let i = 1; i < 40; i++) {
        observer.setOptions({
          queryKey: ['run', 'run-001', i],
          queryFn: async () => ({ value: i }),
        });
        const active = observer.getCurrentQuery();
        expect(
          client.getQueryCache().get(active.queryHash),
          `range ${i}: active query must remain registered`,
        ).toBe(active);
        await observer.refetch();
        expect(observer.getCurrentResult().data).toEqual({ value: i });
      }
    } finally {
      unsubscribe();
      client.clear();
    }
  });
  it('releases a burst of inactive viewport samples after idle recovery', async () => {
    vi.useFakeTimers();
    const client = createAppQueryClient();
    for (let i = 0; i < 80; i++)
      client.setQueryData(['run', 'run-001', i, i + 500], { sampled: new Array(200).fill(i) });
    expect(client.getQueryData(['run', 'run-001', 79, 579])).toBeDefined();
    await vi.advanceTimersByTimeAsync(INACTIVE_VIEW_TTL_MS + 1);
    expect(client.getQueryCache().findAll({ queryKey: ['run'] })).toHaveLength(0);
    client.clear();
  });
  it('keeps an observed view through GC and releases it only after unsubscribing', async () => {
    vi.useFakeTimers();
    const client = createAppQueryClient();
    const activeKey = ['run', 'run-001', 0, 999_999];
    client.setQueryData(activeKey, { id: 'visible' });
    const observer = new QueryObserver(client, { queryKey: activeKey, enabled: false });
    const unsubscribe = observer.subscribe(() => {});
    for (let i = 1; i < 50; i++) client.setQueryData(['run', 'run-001', i, i + 100], { id: i });
    await vi.advanceTimersByTimeAsync(INACTIVE_VIEW_TTL_MS + 1);
    expect(client.getQueryData(activeKey)).toEqual({ id: 'visible' });
    expect(client.getQueryCache().findAll({ queryKey: ['run'] })).toHaveLength(1);
    unsubscribe();
    await vi.advanceTimersByTimeAsync(INACTIVE_VIEW_TTL_MS + 1);
    expect(client.getQueryData(activeKey)).toBeUndefined();
    client.clear();
  });
  it('releases inactive data after the retention period', async () => {
    vi.useFakeTimers();
    const client = createAppQueryClient();
    client.setQueryData(['run', 'run-001'], { id: 'expired' });
    await vi.advanceTimersByTimeAsync(INACTIVE_VIEW_TTL_MS + 1);
    expect(client.getQueryData(['run', 'run-001'])).toBeUndefined();
    client.clear();
  });
});
