import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { disposeDataClient, loadRun } from './client';
import type { RunDetail } from '../domain/types';

class FakeWorker {
  static current: FakeWorker;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  requests: { requestId: number; id: string }[] = [];
  constructor() { FakeWorker.current = this; }
  postMessage(request: { requestId: number; id: string }) { this.requests.push(request); }
  terminate() {}
  reply(requestId: number, id: string) { this.onmessage?.({ data: { requestId, detail: { run: { id } } as RunDetail } }); }
}

beforeEach(() => { vi.stubGlobal('Worker', FakeWorker); });
afterEach(() => { disposeDataClient(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('worker request isolation and recovery', () => {
  it('keeps fast-switch responses attached to their original run even when replies arrive out of order', async () => {
    const first = loadRun('run-001');
    const second = loadRun('run-002');
    const worker = FakeWorker.current;
    worker.reply(worker.requests[1]!.requestId, 'run-002');
    worker.reply(worker.requests[0]!.requestId, 'run-001');
    await expect(first).resolves.toHaveProperty('run.id', 'run-001');
    await expect(second).resolves.toHaveProperty('run.id', 'run-002');
  });
  it('rejects an aborted selection and ignores its late worker response', async () => {
    const controller = new AbortController();
    const first = loadRun('run-001', { signal: controller.signal });
    const rejection = expect(first).rejects.toHaveProperty('name', 'AbortError');
    controller.abort();
    const second = loadRun('run-002');
    const worker = FakeWorker.current;
    worker.reply(worker.requests[0]!.requestId, 'run-001');
    worker.reply(worker.requests[1]!.requestId, 'run-002');
    await rejection;
    await expect(second).resolves.toHaveProperty('run.id', 'run-002');
  });
  it('does not start a worker for an already aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(loadRun('run-001', { signal: controller.signal })).rejects.toHaveProperty('name', 'AbortError');
  });
  it('rejects worker failure and creates a fresh worker on retry', async () => {
    const first = loadRun('run-001');
    const failedWorker = FakeWorker.current;
    const rejection = expect(first).rejects.toThrow('stopped unexpectedly');
    failedWorker.onerror?.();
    await rejection;
    const retry = loadRun('run-001');
    expect(FakeWorker.current).not.toBe(failedWorker);
    FakeWorker.current.reply(FakeWorker.current.requests[0]!.requestId, 'run-001');
    await expect(retry).resolves.toHaveProperty('run.id', 'run-001');
  });
  it('exposes a bounded timeout instead of leaving loading permanent', async () => {
    vi.useFakeTimers();
    const promise = loadRun('run-001');
    const timedOutWorker = FakeWorker.current;
    const rejection = expect(promise).rejects.toThrow('took too long');
    await vi.advanceTimersByTimeAsync(30_000);
    await rejection;
    const retry = loadRun('run-001');
    expect(FakeWorker.current).not.toBe(timedOutWorker);
    FakeWorker.current.reply(FakeWorker.current.requests[0]!.requestId, 'run-001');
    await expect(retry).resolves.toHaveProperty('run.id', 'run-001');
  });
});
