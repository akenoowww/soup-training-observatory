import type { Range, RunDetail } from '../domain/types';

interface RequestEntry {
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
  worker = new Worker(new URL('../workers/data.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (event: MessageEvent<{ requestId: number; detail?: RunDetail; error?: string }>) => {
    const { requestId, detail, error } = event.data;
    const request = pending.get(requestId);
    // An aborted or superseded request cannot update the UI.
    if (!request) return;
    request.cleanup();
    pending.delete(requestId);
    if (error) request.reject(new Error(error));
    else if (detail) request.resolve(detail);
    else request.reject(new Error('The data worker returned an invalid response.'));
  };
  worker.onerror = () => resetWorker('The data worker stopped unexpectedly. Retry to reconnect.');
  return worker;
}

export function loadRun(id: string, options: { range?: Range; width?: number; signal?: AbortSignal } = {}): Promise<RunDetail> {
  if (options.signal?.aborted) return Promise.reject(new DOMException('The request was aborted.', 'AbortError'));
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
    const cleanup = () => { clearTimeout(timeout); options.signal?.removeEventListener('abort', abort); };
    pending.set(requestId, { resolve, reject, cleanup });
    options.signal?.addEventListener('abort', abort, { once: true });
    try { getWorker().postMessage({ requestId, id, range: options.range, width: options.width }); }
    catch (error) {
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
    request.cleanup(); request.reject(new DOMException('The data client was disposed.', 'AbortError'));
  }
  pending.clear();
}
