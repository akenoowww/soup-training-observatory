import { QueryClient } from '@tanstack/react-query';

export const INACTIVE_VIEW_TTL_MS = 10_000;

/** Use TanStack's lifecycle-aware GC. Removing queries synchronously from cache
 * notifications can evict a query while an observer is moving onto it. */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: INACTIVE_VIEW_TTL_MS,
        retry: 0,
        refetchOnWindowFocus: true,
      },
    },
  });
}
