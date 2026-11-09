/// <reference lib="webworker" />
import { getRunDetail } from '../data/engine';
import type { Range } from '../domain/types';

self.onmessage = (event: MessageEvent<{ requestId: number; id: string; range?: Range; width?: number }>) => {
  const { requestId, id, range, width } = event.data;
  try {
    const detail = getRunDetail(id, { range, width });
    self.postMessage({ requestId, detail });
  } catch (error) {
    self.postMessage({ requestId, error: error instanceof Error ? error.message : 'Unable to prepare run data.' });
  }
};
