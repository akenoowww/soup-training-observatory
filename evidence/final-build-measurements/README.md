# Current final-build measurements

The measured production runtime is `app-pYEMV88W.js` (SHA256 `67a08b9a7f8e221727ee09a74231dd8b010e3bfd1ff824badbabbbc75f0051d7`) and `data.worker-pg0qDgzo.js` (`bf1595d98be8e7f31da13faf50b2d043165c7cfdfb11a809dee69934a803f69c`). They are unchanged from the tested/deployed log fix. No application source or runtime assets changed during this measurement repeat.

## Build identity and method

`fingerprint-preflight-check.json` records actual HTTP bytes compared with the frozen local build, plus three deliberately corrupted HTML/app/worker responses rejected before timing. `published-build-check.json` repeats the byte comparison against the public HTTPS site after the measurements. The report generator binds performance, soak, delivery and all three existing hosted browser reports by exact app/worker filenames and SHA256; `report-gate-checks.json` records a successful complete input and eight rejected stale/incomplete/wrong-count cases.

`cpu-scope-calibration.json` repeats identical page/worker workloads of 100 million iterations under page×1/×4/×1 on Chromium 157.0.8103.50. Page medians 135.9/534.9/113.7 ms; worker 135.2/116.4/112.2 ms. All hashes agree; the worker-target throttle command reports pages-only. Warmup/order variation and three samples prevent a precise CPU/device equivalence claim.

## Completed timing and memory run

`performance/results.json` contains five fresh-browser runs per raw/main-sampled/worker fixture and five full-application runs. Fixture sample counts per mode: 5 renders / 5 zooms / 15 hovers; application: 5/15/15. Input observations are clustered three per browser, not fifteen independent cold runs. The first repetition per mode is traced and the others are explicitly untraced. Four private-memory dumps are separate from the timed runs. Chrome traces retain actual paint/input events and frame/worker PID attribution.

| Mode | First render median | Zoom median | Hover median | Private renderer overview |
| --- | ---: | ---: | ---: | ---: |
| Raw 1M loss fixture |603.6 ms|12.8 ms|15.8 ms|78.957 MB|
| Main-thread sampling |434.0 ms|28.1 ms|16.1 ms|54.675 MB|
| Worker sampling |235.0 ms|33.6 ms|16.2 ms|58.509 MB|
| Complete three-chart app |507.4 ms|62.1 ms|32.4 ms|87.935 MB|

Private footprint is one attributed snapshot per mode, not a median. All 20 overview memory snapshots and four attribution snapshots include complete page/worker contexts with zero CDP errors; worker-backed snapshots retain at least 32 MB canonical buffers. Ordinary raw million-point loss entries reduce to 3,580 in the sampled controls. Worker zoom remains slower than the raw fixture; hover is effectively unchanged.

Historical original/pre-log-fix app medians remain 515.5/63.9/32.0 ms and 495.9/62.8/32.8 ms. Those runs used Chromium 156. Browser version, sequential run order and small samples confound causal build comparisons; current measurements establish the final runtime evidence, not a causal speedup from the log fix.

## Completed sustained use

`soak/latest.json` is a portable pointer to the completed results. CPU ×1, 180 seconds activity plus 35 seconds idle,216.670 seconds wall time:136 completed loops,546 counted active-loop actions, all 20 runs visited, zero browser/console errors. Checkpoint normalization and forced GC collect page and worker together. Retained V8/backing storage: 38.931 MB warmup →44.966 MB maximum checkpoint →41.440 MB after idle; +2.509 MB retained. Worker buffers stay 32.318 MB. Counts exclude checkpoint reloads and individual DOM events. This finite retained-memory observation is not an unforced peak, full native/GPU accounting, visual oracle or multi-hour absence-of-leaks proof.

## Preserved failed attempt and checks

`performance-enospc/` and `performance-enospc-stdout.txt` retain the first attempt: 15 fixture runs completed, then writing the full-app trace failed with ENOSPC while the host had about 100 MB free. The partial app trace is truncated. No final numbers come from it. After the user freed about 5 GB, every mode/application was repeated into fresh `performance/`; the completed observation set is never spliced with the failed run.

`checks.txt` and `unit-results.json` record formatting, TypeScript, ESLint, all 80 unit tests and production build. `performance-stdout.txt` and `soak-stdout.txt` preserve progress summaries. Known local project/home/temp prefixes were normalized only in these new own outputs; numeric observations, process attribution, timestamps and chronology were preserved. Earlier raw evidence and Git history were not rewritten.
