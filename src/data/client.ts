import type { Range, RunDetail } from '../domain/types';
import { isRunDetail } from './validate-response';

interface RequestEntry {
  runId: string;
  range?: Range;
  resolve: (detail: RunDetail) => void;
  reject: (reason: Error | DOMException) => void;
  cleanup: () => void;
}
let worker: Worker | undefined;
let sequence = 0;
const pending = new Map<number, RequestEntry>();
function resetWorker(message: string): void {
  worker?.terminate();
  worker = undefined;
  for (const request of pending.values()) {
    request.cleanup();
    request.reject(new Error(message));
  }
  pending.clear();
}
function getWorker(): Worker {
  if (worker) return worker;
  const current = new Worker(new URL('../workers/data.worker.ts', import.meta.url), {
    type: 'module',
  });
  worker = current;
  current.onmessage = (event: MessageEvent<unknown>) => {
    if (worker !== current) return;
    const payload = event.data;
    if (
      !payload ||
      typeof payload !== 'object' ||
      !('requestId' in payload) ||
      typeof payload.requestId !== 'number' ||
      !Number.isSafeInteger(payload.requestId)
    ) {
      resetWorker('The data worker returned an invalid response. Retry to reconnect.');
      return;
    }
    const request = pending.get(payload.requestId);
    // An aborted or superseded request cannot update the UI.
    if (!request) return;
    request.cleanup();
    pending.delete(payload.requestId);
    if ('error' in payload && typeof payload.error === 'string')
      request.reject(new Error(payload.error));
    else if ('detail' in payload && isRunDetail(payload.detail, request.runId, request.range))
      request.resolve(payload.detail);
    else {
      request.reject(
        new Error('The data worker returned inconsistent measurements. Retry to reconnect.'),
      );
      resetWorker('The data worker returned inconsistent measurements. Retry to reconnect.');
    }
  };
  current.onmessageerror = () => {
    if (worker === current)
      resetWorker('The data worker returned unreadable measurements. Retry to reconnect.');
  };
  current.onerror = () => {
    if (worker === current)
      resetWorker('The data worker stopped unexpectedly. Retry to reconnect.');
  };
  return worker;
}

export function loadRun(
  id: string,
  options: { range?: Range; width?: number; signal?: AbortSignal } = {},
): Promise<RunDetail> {
  if (
    options.range &&
    (!Number.isFinite(options.range.min) ||
      !Number.isFinite(options.range.max) ||
      options.range.min > options.range.max)
  ) {
    return Promise.reject(new Error('The requested step range must have finite ordered bounds.'));
  }
  if (options.signal?.aborted)
    return Promise.reject(new DOMException('The request was aborted.', 'AbortError'));
  const range = options.range ? { ...options.range } : undefined;
  return new Promise((resolve, reject) => {
    const requestId = ++sequence;
    const abort = () => {
      const request = pending.get(requestId);
      if (!request) return;
      request.cleanup();
      pending.delete(requestId);
      reject(new DOMException('The request was aborted.', 'AbortError'));
    };
    const timeout = setTimeout(() => {
      const request = pending.get(requestId);
      if (!request) return;
      // A stalled worker must be replaced; retrying the same blocked queue is not recovery.
      resetWorker('Preparing this run took too long. Retry to reconnect.');
    }, 30_000);
    const cleanup = () => {
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abort);
    };
    pending.set(requestId, { runId: id, range, resolve, reject, cleanup });
    options.signal?.addEventListener('abort', abort, { once: true });
    try {
      getWorker().postMessage({ requestId, id, range, width: options.width });
    } catch (error) {
      cleanup();
      pending.delete(requestId);
      reject(error instanceof Error ? error : new Error('Unable to start the data worker.'));
    }
  });
}

/** Release worker memory when the application is unmounted or reset. */
export function disposeDataClient(): void {
  worker?.terminate();
  worker = undefined;
  for (const request of pending.values()) {
    request.cleanup();
    request.reject(new DOMException('The data client was disposed.', 'AbortError'));
  }
  pending.clear();
}
