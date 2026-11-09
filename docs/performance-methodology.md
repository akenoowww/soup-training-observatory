# Performance evidence and interpretation

## What the measurements answer

The task asks for first render, zoom, hover, memory at one million points, before/after numbers and a Chrome Performance trace under CPU x4. The collector measures the actual plotting/data pipeline and the complete React application separately. It does not relabel the fixture as application behavior, main-page heap as total tab memory, or a five-sample maximum as a reliable population tail.

The source is deterministic synthetic data. Measurements model local browser work against a production build served on localhost. They do not model training-cluster traffic, deployment network latency or a named low-end device.

## A consequential discovery: page throttling does not throttle this worker

`Emulation.setCPUThrottlingRate({ rate: 4 })` was applied to the page target. We then tested the scope instead of assuming it covered all computation:

- A dedicated worker performed the same deterministic 100-million-iteration integer calculation, after warmup, three times at page x1, three at page x4, and three more at x1.
- Chrome 156 on this machine measured approximately 121 ms at page x1, 119 ms at page x4, and 123 ms after returning to x1. The result hash stayed identical.
- Sending the same throttling command to the worker target returned **“Operation is only supported for pages, not workers.”**

The identical worker workload was `let hash = 2166136261; for (let i = 0; i < 100000000; i++) hash = Math.imul(hash ^ i, 16777619);`, timed with worker `performance.now()`. A warmup preceded the saved x1/x4/x1 runs; all result hashes were -446695227.

Raw calibration: [`evidence/round2/cpu-scope-calibration.json`](../evidence/round2/cpu-scope-calibration.json). These are observations of this Chrome setup, not a guarantee about every browser version. The worker-backed results therefore mean **page x4 with normally scheduled worker computation**, not “the entire machine is four times slower.” We do not add artificial delays or invent globally throttled timings.

A third fixture mode, `sampled-main`, runs the same extrema sampler on the throttled main thread. It separates reduction from moving computation to a worker. All modes retain the same canonical four-column source; the actual worker API prepares all three metric viewports, while the controlled fixture displays loss only.

The official protocol defines the requested slowdown through [`Emulation.setCPUThrottlingRate`](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setCPUThrottlingRate). The additional worker-scope claim above comes from our saved experiment.

## Timing endpoints

**Controlled fixture** (`benchmark.html`): first render starts at document navigation and ends after source preparation, uPlot creation and two animation frames. Zoom starts inside the in-page viewport operation and ends after sampling/scale update plus two frames. Hover starts in the capture listener for an actual trusted mouse event; the result is recorded after uPlot processes the cursor and two frames. The runner verifies that the middle hover reports step 500,000 and value 9.4, not merely that a tooltip appeared. The legacy synthetic hover shortcut is not used for collected timings.

**Complete application** (`/#/runs/run-001`): a collector is injected into the isolated measurement browser. It does not add product test controls or change source values. First render ends after fonts are loaded, all three charts have their expected drawn domains, update overlays are absent and two frames have elapsed. Zoom starts in the actual button click capture listener and ends after the new URL range, all three drawn chart domains, no update overlays and two frames agree. The new UI separately delays its QA `data-ready` marker by two frames; the collector does not then add another two frames after that marker, because that would penalize the new build for a metadata convention rather than visible chart latency. Hover starts at actual mousemove and ends after the sampled-value tooltip changes and two frames elapse. Playwright command transport and actionability waits occur outside the recorded input spans. The input start is the capture-phase handler timestamp, so these are dispatch-to-settled-paint intervals; hardware input latency and any pre-dispatch queue delay are outside this metric. It is not labeled INP.

The old build lacks actual-draw domain attributes. For its baseline, settlement requires URL-span-matched source counts on all three populated canvases plus two frames. The final build supplies uPlot draw-hook domains. Each run records the exact domain-evidence type. These checks bound paint completion but do not timestamp display photons; load and input markers and Chrome Paint events remain inspectable in the trace.

Each fresh-browser application repetition includes three consecutive zooms and three hover positions. Report raw observations, median and nearest-rank P95. With five cold loads and fifteen input observations, P95 is a descriptive order statistic and usually close to the largest sample; it is not an SLA or statistically stable tail estimate.

The first repetition of each fixture mode/application is traced; later repetitions omit tracing overhead and have `traceFile: null`. The same schedule is used for every mode. The representative trace and all numeric observations remain separate evidence, with the instrumentation limit stated rather than treating them as identical runs.

## Before/after chronology

- `evidence/performance/` retains the original first implementation's fixture and single-application results. The original full-app input timings include automation transport and **must not be compared directly** with the improved event-to-paint method.
- `evidence/round2/performance-before/` captures the original application build using the improved collector before the production bundle was replaced. Five cold loads: median **515.5 ms**; fifteen zooms: **63.9 ms**; fifteen hovers: **32.0 ms**. Main+worker V8/backing stores: **36.315 MB**; isolated renderer RSS approximately **540.3 MB**. Exact observations, source-build fingerprint and trace are retained.
- `evidence/round2/performance/` is a measured candidate (`app-CdawIVe3.js`) that was subsequently **rejected by the sustained-use check**, with raw/main-sampled/worker fixture controls and repeated application results. Five cold application loads: median **583.3 ms**; fifteen zooms: **62.8 ms**; fifteen hovers: **32.2 ms**. First render regressed relative to the comparable 515.5 ms baseline; zoom and hover are effectively unchanged at this sample/frame resolution. The regression is retained. Runtime validation, actual-axis state and additional visible statistics changed between builds, but these timings do not isolate a causal attribution. The source fingerprint and per-observation trace identity prevent silently comparing different builds.

- `evidence/round2/performance-fixed/` is the native-GC release build (`app-DsJyw_oe.js`) after 135/135 cross-engine browser checks. Five cold application loads: median **495.9 ms**, largest observed 540.8 ms; fifteen zooms: median **62.8 ms**, largest 98.2 ms; fifteen hovers: median **32.8 ms**, largest 33.6 ms. The same dispatch-to-paint collector was used. Against the original comparable 515.5/63.9/32.0 ms baseline, the observed changes are small and do not establish a causal performance improvement. The significant retention correction is checked separately by the observer regression and sustained-use run. Exact application and benchmark HTML fingerprints and asset names are embedded in this output.

A worker optimization may improve first render/memory without improving zoom. Such regressions remain visible; a negative result is not deleted or relabeled.

Final fixed-build controlled fixture medians (five cold samples per mode; fifteen trusted mouse observations):

| Measurement                     | Raw 1M main thread | Sampled main thread | Actual worker + sampling |
| ------------------------------- | -----------------: | ------------------: | -----------------------: |
| First chart render              |           596.5 ms |            427.6 ms |                 221.3 ms |
| Source preparation              |           427.8 ms |            293.1 ms |                 143.7 ms |
| Zoom                            |            21.6 ms |             30.7 ms |                  34.2 ms |
| Hover                           |            16.1 ms |             16.0 ms |                  16.2 ms |
| Page + worker V8/backing stores |          57.063 MB |           33.882 MB |                34.216 MB |
| Retained loss entries           |          1,000,000 |               3,580 |                    3,580 |

**Zoom is slower after reduction/resampling** (21.6 ms raw versus 34.2 ms through the actual worker); hover is essentially unchanged. Both are retained as negative/neutral observations.

These controls show both an on-main-thread reduction benefit and a further worker-placement benefit under the explicitly calibrated page-only throttle. They do not establish that an entire slow machine would achieve the worker number. Existing original fixture hover measurements used a synthetic event shortcut; current trusted-event results are not presented as a hover optimization over that older method.

## Memory and sustained use

`Runtime.getHeapUsage` is collected separately from the page and dedicated worker, after explicit garbage collection in both contexts. We sum V8 used heap and backing stores, so the worker's approximately 32 MB Float64 allocation is counted. Native Canvas/GPU allocation is not part of that V8 sum. See the official [`Runtime.getHeapUsage`](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-getHeapUsage) interface.

For stronger attribution, separate post-timing MemoryInfra snapshots map the actual main frame and dedicated worker to renderer PIDs through `TracingStartedInBrowser` and `TracingSessionIdForWorker`. The PIDs are deduplicated when the worker shares the page renderer. `process_totals.private_footprint_bytes` is summed only for these attributed renderer processes; spare renderers, browser, GPU and utility processes are excluded. The raw memory trace and exact frame/worker mappings are saved per fixture mode and application. This gives a concrete renderer-private footprint at the million-point overview, while shared browser/GPU resources remain outside its scope. The approach follows the frame/process relationships inspected in the [official DevTools trace metadata handler](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/models/trace/handlers/MetaHandler.ts). A preliminary experiment confirmed worker and page share one renderer and produced an attributed private-footprint observation around 108 MB, rather than labeling the roughly 540 MB all-renderer RSS sum as that tab alone; the preliminary observation is not the final measured build.

Renderer RSS is also independently summed from renderer processes in a fresh one-page browser. It includes native process footprint and may include spare renderers. It excludes browser/GPU/utility processes and is an approximation of the tab's footprint, not the private-memory figure in browser Task Manager. Both metrics are reported with these boundaries.

A separate real-UI soak script (`scripts/soak.mjs`) switches among all 20 runs, applies exact ranges, changes scale and inspects points with approximately one-second pacing. At checkpoints it normalizes the active run and worker cache before measurement, then measures again after idle recovery. Raw active peaks, GC results, browser errors and all original failures are retained under `evidence/round2/soak/`.

The old-cache baseline ran 90 seconds active plus 35 seconds idle: 75 iterations across all 20 runs, no browser errors. Combined page/worker V8+backing stores grew from 39.05 MB warmup to a 52.74 MB active peak and recovered to 48.70 MB after 35 seconds idle. Worker storage stayed approximately 32.32 MB. The old query TTL was 60 seconds, so 35 seconds idle does not demonstrate full cache expiration; this result is **not proof of a leak**. The next candidate run is a separate longer observation, not a rewritten baseline.

That candidate exposed a real regression after the static matrix had passed: after 34 seconds, retained page+worker V8/backing stores reached 494.82 MB from 38.95 MB; the worker remained approximately 32.32 MB, while main-page V8 heap alone reached 461.69 MB. Only three canvases were present. An independent allocation sample attributed 213.30 MB of 216.90 MB sampled retained allocation to worker-message deserialization, with repeated `QueryObserver.getOptimisticResult/build` stacks. Root reproduced an observer transition whose active query had been synchronously removed by a custom inactive-query pruner. The pruner was removed entirely in favor of TanStack's standard ten-second inactive-query garbage collection; real-observer transition and idle-expiry tests guard this failure.

The failing run's eventual timeout was a **separate harness bug**: corrected fixture chronology changed the first sorted row, but the soak's wraparound assumed it was run001. The harness now selects the exact run001 link. We do not use that harness correction to dismiss the independently measured memory growth. The original failed run, image, allocations and causal test failure remain under `evidence/round2/soak/final-bounded-cache/`, `retention-diagnostic/` and `evidence/round2/retention/`. A bounded fixed-build probe on `app-DsJyw_oe.js` then completed 30 seconds activity + 15 seconds idle: 24 iterations across all 20 runs, no browser errors, combined retained memory 38.92 MB warmup, 43.41 MB peak and 40.34 MB after idle; worker backing stores stayed 32.318 MB. This corroborates the real-observer regression fix without implying a multi-hour leak guarantee. The subsequent full run passed 180 seconds of active use plus 35 seconds idle (217 seconds wall time), 136 completed iterations across all 20 runs and 546 counted actions, with zero page/console errors. Combined retained V8/backing stores were 38.816 MB warmup, 44.928 MB peak, 44.675 MB after activity and 41.431 MB after idle; net retained change was +2.615 MB. Worker backing stores remained 32.318 MB. DOM counters stayed around 397 elements / 651 nodes / 240 event listeners / 3 canvases. The severe prior retention storm did not recur. Raw snapshots, action counts, source assets and limits: `evidence/round2/soak/final-native-gc/2026-11-09T21-17-15-550Z/results.json`; its portable `latest.json` pointer includes the relative directory. This finite observation does not prove zero leaks over hours.

Final fixed-build separate MemoryInfra overview snapshots (one observation per mode; raw trace retained):

| Mode                             | Attributed renderer private footprint | Attributed renderer RSS |
| -------------------------------- | ------------------------------------: | ----------------------: |
| Raw 1M fixture                   |                              93.85 MB |               231.93 MB |
| Main-thread sampled fixture      |                              69.55 MB |               206.08 MB |
| Worker sampled fixture           |                              73.03 MB |               210.65 MB |
| Complete three-chart application |                             102.42 MB |               251.82 MB |

In both worker-backed snapshots, trace metadata attributes the page and data worker to the same renderer PID; it is counted once. This stronger evidence excludes spare renderer processes from the attributed footprint. The complete app's separately measured page+worker V8/backing median is 36.564 MB; the larger private footprint includes additional renderer infrastructure/native allocation. None is relabeled a complete accounting of shared GPU/browser resources.

A few minutes of successful use can expose obvious retention and interaction failures. It does not prove absence of leaks over hours or in every browser.

## Reproduce

```sh
npm ci
npm run build
npm run preview -- --port 4173
# another terminal; CPU x4 is configured automatically
node scripts/performance.mjs http://127.0.0.1:4173 5 evidence/my-performance-run
node scripts/soak.mjs http://127.0.0.1:4173 180 35
```

Use a fresh evidence directory; completed performance results are never overwritten. Run without other CPU-intensive test jobs. The script uses bundled Playwright Chromium when installed, otherwise an available system Chrome. Source/build fingerprint, browser version and exact methodology are embedded in output. Open the representative `*.trace.json` through Chrome DevTools Performance to inspect named `soup:` spans and real paint/input events.
