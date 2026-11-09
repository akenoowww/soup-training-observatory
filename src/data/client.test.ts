import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { disposeDataClient, loadRun } from './client';
import { getRunDetail } from './engine';
import { SOURCE_SNAPSHOT } from './source';

class FakeWorker {
  static current: FakeWorker;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  requests: { requestId: number; id: string }[] = [];
  constructor() {
    FakeWorker.current = this;
  }
  postMessage(request: { requestId: number; id: string }) {
    this.requests.push(request);
  }
  terminate() {}
  reply(requestId: number, id: string) {
    this.onmessage?.({ data: { requestId, detail: getRunDetail(id, { width: 2 }) } });
  }
}

beforeEach(() => {
  vi.stubGlobal('Worker', FakeWorker);
});
afterEach(() => {
  disposeDataClient();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('worker request isolation and recovery', () => {
  it('keeps fast-switch responses attached to their original run even when replies arrive out of order', async () => {
    const first = loadRun('run-002');
    const second = loadRun('run-003');
    const worker = FakeWorker.current;
    worker.reply(worker.requests[1]!.requestId, 'run-003');
    worker.reply(worker.requests[0]!.requestId, 'run-002');
    await expect(first).resolves.toHaveProperty('run.id', 'run-002');
    await expect(second).resolves.toHaveProperty('run.id', 'run-003');
  });
  it('rejects an aborted selection and ignores its late worker response', async () => {
    const controller = new AbortController();
    const first = loadRun('run-002', { signal: controller.signal });
    const rejection = expect(first).rejects.toHaveProperty('name', 'AbortError');
    controller.abort();
    const second = loadRun('run-003');
    const worker = FakeWorker.current;
    worker.reply(worker.requests[0]!.requestId, 'run-002');
    worker.reply(worker.requests[1]!.requestId, 'run-003');
    await rejection;
    await expect(second).resolves.toHaveProperty('run.id', 'run-003');
  });
  it('does not start a worker for an already aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(loadRun('run-002', { signal: controller.signal })).rejects.toHaveProperty(
      'name',
      'AbortError',
    );
  });
  it('rejects worker failure and creates a fresh worker on retry', async () => {
    const first = loadRun('run-002');
    const failedWorker = FakeWorker.current;
    const rejection = expect(first).rejects.toThrow('stopped unexpectedly');
    failedWorker.onerror?.();
    await rejection;
    const retry = loadRun('run-002');
    expect(FakeWorker.current).not.toBe(failedWorker);
    FakeWorker.current.reply(FakeWorker.current.requests[0]!.requestId, 'run-002');
    await expect(retry).resolves.toHaveProperty('run.id', 'run-002');
  });
  it('exposes a bounded timeout instead of leaving loading permanent', async () => {
    vi.useFakeTimers();
    const promise = loadRun('run-002');
    const timedOutWorker = FakeWorker.current;
    const rejection = expect(promise).rejects.toThrow('took too long');
    await vi.advanceTimersByTimeAsync(30_000);
    await rejection;
    const retry = loadRun('run-002');
    expect(FakeWorker.current).not.toBe(timedOutWorker);
    FakeWorker.current.reply(FakeWorker.current.requests[0]!.requestId, 'run-002');
    await expect(retry).resolves.toHaveProperty('run.id', 'run-002');
  });
  it('fails closed on a response belonging to a different run and recovers with a new worker', async () => {
    const first = loadRun('run-002');
    const oldWorker = FakeWorker.current;
    const rejection = expect(first).rejects.toThrow('inconsistent measurements');
    oldWorker.reply(oldWorker.requests[0]!.requestId, 'run-003');
    await rejection;
    const retry = loadRun('run-002');
    expect(FakeWorker.current).not.toBe(oldWorker);
    FakeWorker.current.reply(FakeWorker.current.requests[0]!.requestId, 'run-002');
    await expect(retry).resolves.toHaveProperty('run.id', 'run-002');
  });
  it('rejects shifted metric columns and contradictory extrema instead of painting them', async () => {
    for (const corruption of ['shift', 'extrema']) {
      const response = loadRun('run-002');
      const worker = FakeWorker.current;
      const detail = getRunDetail('run-002', { width: 2 });
      if (corruption === 'shift') detail.metrics.loss.y.pop();
      else detail.metrics.loss.max = 123456;
      const rejection = expect(response).rejects.toThrow('inconsistent measurements');
      worker.onmessage?.({ data: { requestId: worker.requests[0]!.requestId, detail } });
      await rejection;
    }
  });
  it('ignores late errors and malformed messages from a replaced worker', async () => {
    const first = loadRun('run-002');
    const oldWorker = FakeWorker.current;
    const rejection = expect(first).rejects.toThrow('stopped unexpectedly');
    oldWorker.onerror?.();
    await rejection;
    const retry = loadRun('run-002');
    const replacement = FakeWorker.current;
    oldWorker.onerror?.();
    oldWorker.onmessage?.({ data: null });
    replacement.reply(replacement.requests[0]!.requestId, 'run-002');
    await expect(retry).resolves.toHaveProperty('run.id', 'run-002');
  });
  it('rejects invalid viewport bounds before starting a worker', async () => {
    await expect(loadRun('run-002', { range: { min: NaN, max: 1 } })).rejects.toThrow(
      'finite ordered bounds',
    );
    await expect(loadRun('run-002', { range: { min: 5, max: 1 } })).rejects.toThrow(
      'finite ordered bounds',
    );
  });

  it('surfaces malformed envelopes and unreadable messages immediately instead of waiting for timeout', async () => {
    for (const kind of ['envelope', 'decode']) {
      const promise = loadRun('run-002');
      const worker = FakeWorker.current;
      const rejection = expect(promise).rejects.toThrow(
        kind === 'envelope' ? 'invalid response' : 'unreadable measurements',
      );
      if (kind === 'envelope') worker.onmessage?.({ data: { detail: {} } });
      else worker.onmessageerror?.();
      await rejection;
    }
  });

  it('rejects an obsolete fixture revision even when the run and numeric measurements match', async () => {
    const promise = loadRun('run-002');
    const worker = FakeWorker.current;
    const detail = getRunDetail('run-002', { width: 2 });
    const rejection = expect(promise).rejects.toThrow('inconsistent measurements');
    worker.onmessage?.({
      data: {
        requestId: worker.requests[0]!.requestId,
        detail: { ...detail, source: { ...SOURCE_SNAPSHOT, revision: 'soup-fixtures-v1' } },
      },
    });
    await rejection;
    const retry = loadRun('run-002');
    expect(FakeWorker.current).not.toBe(worker);
    FakeWorker.current.reply(FakeWorker.current.requests[0]!.requestId, 'run-002');
    await expect(retry).resolves.toHaveProperty('source.revision', SOURCE_SNAPSHOT.revision);
  });
});
