import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadRun } from '../../data/client';
import { SOURCE_SNAPSHOT } from '../../data/source';
import type { Range, RunDetail } from '../../domain/types';

interface ResolvedRunView {
  detail: RunDetail;
  viewport: Range;
}

/** A sampled response always travels with the viewport that produced it. */
export function useRunView(runId: string, range: Range | undefined, enabled: boolean) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  const [paintedView, setPaintedView] = useState<ResolvedRunView>();
  const query = useQuery({
    queryKey: ['run', runId, SOURCE_SNAPSHOT.revision, range?.min, range?.max, width],
    queryFn: async ({ signal }): Promise<ResolvedRunView> => {
      const detail = await loadRun(runId, { range, width, signal });
      return { detail, viewport: range ?? detail.metrics.loss.domain };
    },
    placeholderData: (previous) =>
      previous?.detail.run.id === runId &&
      previous.detail.source.revision === SOURCE_SNAPSHOT.revision
        ? previous
        : undefined,
    enabled,
    // This source computes locally; browser connectivity must not pause its work.
    networkMode: 'always',
    retry: 0,
  });

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const measuredWidth = entries[0]?.contentRect.width ?? 900;
      setWidth(Math.max(200, Math.round(measuredWidth / 100) * 100));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const view = query.data;
    if (!view || query.isFetching || query.isPlaceholderData || query.isError) return;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setPaintedView(view);
        performance.clearMarks('soup:run-rendered');
        performance.mark('soup:run-rendered');
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [query.data, query.isFetching, query.isPlaceholderData, query.isError]);

  return {
    query,
    container,
    data: query.data?.detail,
    displayedViewport: query.data?.viewport,
    updating: query.isFetching || query.isPlaceholderData,
    ready:
      !!query.data &&
      paintedView === query.data &&
      !query.isFetching &&
      !query.isPlaceholderData &&
      !query.isError,
  };
}
