# Bounded retained-allocation diagnostic

This is a 10-iteration diagnostic on the same failed interim `app-CdawIVe3.js` candidate. Its JSON status `completed` means the bounded collection finished; it is not a passing memory verdict.

After a main/worker GC checkpoint, combined V8 heap plus backing stores rose from 38.95 MB to 422.42 MB at the first active checkpoint. The worker backing allocation remained 32.32 MB. The main document stayed at 397 live DOM elements, around 648 total DOM nodes, 240 JS event listeners and three chart canvases.

The allocation sampler attributed about 213.30 MB of 216.90 MB sampled retained allocations to the worker response handler `e.onmessage` in `client-C5dJojYl.js:3:16120`. Smaller stacks include TanStack Query observer `getOptimisticResult`, `build` and `createResult`. This is allocation-stack evidence, not a heap dominator or retainer-chain proof. The root agent separately reproduced an orphan-query/refetch problem at the custom pruner's 12-query threshold using actual QueryObserver transitions, then removed the custom pruner.

The original profile, summary, result checkpoints and screenshot remain unchanged. The follow-up fixed-build probe and full soak must be assessed separately.
