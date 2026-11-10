# Performance evidence and interpretation

## What the measurements answer

The task asks for first render, zoom, hover, memory at one million points, before/after numbers and a Chrome Performance trace under CPU x4. The collector measures the actual plotting/data pipeline and the complete React application separately. It does not relabel the fixture as application behavior, main-page heap as total tab memory, or a five-sample maximum as a reliable population tail.

The current results are in [`evidence/final-build-measurements/performance/`](../evidence/final-build-measurements/performance/results.json): `app-pYEMV88W.js` and `data.worker-pg0qDgzo.js`, measured in Chrome **157.0.8103.50** on macOS arm64. Before timing, the collector hashes actual served app/worker HTTP bytes and checks them against the frozen local production build. These identities match delivery and the three-engine hosted smoke. The earlier Chrome 156 results in `evidence/round2/performance-fixed/` describe `app-DsJyw_oe.js` before the log-gap correction; they remain unchanged historical evidence.

The source is deterministic synthetic data. Measurements model local browser work against a production build served on localhost. They do not model training-cluster traffic, deployment network latency or a named low-end device.

## A consequential discovery: page throttling does not throttle this worker

`Emulation.setCPUThrottlingRate({ rate: 4 })` was applied to the page target. We then tested the scope instead of assuming it covered all computation:

- Page and dedicated-worker contexts performed the same deterministic 100-million-iteration integer calculation, after warmup, three times at page x1, three at page x4, and three more at x1.
- Current Chrome 157 page medians were **135.9 -> 534.9 -> 113.7 ms**; worker medians were **135.2 -> 116.4 -> 112.2 ms** for those same three phases. All nine result hashes stayed identical.
- Sending the same throttling command to the worker target returned **“Operation is only supported for pages, not workers.”**

The identical worker workload was `let hash = 2166136261; for (let i = 0; i < 100000000; i++) hash = Math.imul(hash ^ i, 16777619);`, timed with worker `performance.now()`. A warmup preceded the saved x1/x4/x1 runs; all result hashes were -446695227.

Current raw calibration: [`evidence/final-build-measurements/cpu-scope-calibration.json`](../evidence/final-build-measurements/cpu-scope-calibration.json). Page work slowed while worker work did not receive an equivalent x4 slowdown. The x1 return phase is also faster than the initial phase, exposing warmup/order drift; three observations per phase do not establish that page throttling caused a worker speedup. These are observations of this browser and machine, not a guarantee across versions. Worker-backed results therefore mean **page x4 with separately observed worker scheduling**, not an equally slowed whole machine. We do not add artificial delays or invent globally throttled timings.

The unchanged [historical Chrome 156 calibration](../evidence/round2/cpu-scope-calibration.json) measured worker medians of approximately 121/119/123 ms across its page x1/x4/x1 phases and also rejected worker-target throttling. It is historical context, not the calibration used for the current measurements.

A third fixture mode, `sampled-main`, runs the same extrema sampler on the throttled main thread. It separates reduction from moving computation to a worker. All modes retain the same canonical four-column source; the actual worker API prepares all three metric viewports, while the controlled fixture displays loss only.

The official protocol defines the requested slowdown through [`Emulation.setCPUThrottlingRate`](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setCPUThrottlingRate). The additional worker-scope claim above comes from our saved experiment.

## Timing endpoints

**Controlled fixture** (`benchmark.html`): first render starts at document navigation and ends after source preparation, uPlot creation and two animation frames. Zoom starts inside the in-page viewport operation and ends after sampling/scale update plus two frames. Hover starts in the capture listener for an actual trusted mouse event; the result is recorded after uPlot processes the cursor and two frames. The runner verifies that the middle hover reports step 500,000 and value 9.4, not merely that a tooltip appeared. The legacy synthetic hover shortcut is not used for collected timings.

**Complete application** (`/#/runs/run-001`): a collector is injected into the isolated measurement browser. It does not add product test controls or change source values. First render ends after fonts are loaded, all three charts have their expected drawn domains, update overlays are absent and two frames have elapsed. Zoom starts in the actual button click capture listener and ends after the new URL range, all three drawn chart domains, no update overlays and two frames agree. The new UI separately delays its QA `data-ready` marker by two frames; the collector does not then add another two frames after that marker, because that would penalize the new build for a metadata convention rather than visible chart latency. Hover starts at actual mousemove and ends after the sampled-value tooltip changes and two frames elapse. Playwright command transport and actionability waits occur outside the recorded input spans. The input start is the capture-phase handler timestamp, so these are dispatch-to-settled-paint intervals; hardware input latency and any pre-dispatch queue delay are outside this metric. It is not labeled INP.

The historical original build lacks actual-draw domain attributes. For that cohort, settlement requires URL-span-matched source counts on all three populated canvases plus two frames. The previous fixed baseline and current build supply uPlot draw-hook domains. Each run records the exact domain-evidence type. These checks bound paint completion but do not timestamp display photons; load and input markers and Chrome Paint events remain inspectable in the trace.

Each fresh-browser **fixture** repetition includes one zoom and three hover positions. With five repetitions, each fixture mode therefore has **5 first-render, 5 zoom and 15 hover observations**. Each fresh-browser **complete-application** repetition includes three consecutive zooms and three hover positions, giving **5 first-render, 15 zoom and 15 hover observations** for the current and both historical application cohorts. The 15 input observations are clustered within five browsers; they are not 15 independent cold repetitions.

| Evidence group                                         | First-render observations | Zoom observations | Hover observations |
| ------------------------------------------------------ | ------------------------: | ----------------: | -----------------: |
| Current raw 1M fixture                                 |                         5 |                 5 |                 15 |
| Current main-thread sampled fixture                    |                         5 |                 5 |                 15 |
| Current worker sampled fixture                         |                         5 |                 5 |                 15 |
| Complete application, historical original (Chrome 156) |                         5 |                15 |                 15 |
| Complete application, previous baseline (Chrome 156)   |                         5 |                15 |                 15 |
| Complete application, current (Chrome 157)             |                         5 |                15 |                 15 |

The generator independently derives these counts from raw `fixtureRuns[].zoom.durationMs`, `fixtureRuns[].hovers[]`, and `applicationRuns[].zooms[]`/`.hovers[]`, then checks the corresponding summary `count` and `values` arrays. The unused fixture `zoomMs`/`hoverMs` arrays are not observations. Current evidence must contain all 20 raw runs, five per mode. Its memory gate requires zero recorded errors, a page context in every snapshot and exactly one measured worker with at least 32 MB backing in optimized/application modes; the two main-thread controls require zero workers. The separate four MemoryInfra rows must have valid frame/worker attribution, deduplicated PIDs and complete memory observations. `node scripts/build-submission-note.mjs --verify-measurements` verifies counts and current memory completeness without launching Chrome or changing artifacts. `--verify-evidence` additionally binds app/worker filenames and SHA256 across performance, soak, delivery and each hosted engine, and requires same-browser CPU calibration.

Report raw observations, median and nearest-rank P95. A fixture zoom P95 uses only five values, while fixture hover and application input P95s use fifteen. These are descriptive order statistics, usually close to the largest sample; they are not SLAs or statistically stable tail estimates.

The first repetition of each fixture mode/application is traced; later repetitions omit tracing overhead and have `traceFile: null`. The same schedule is used for every mode. The representative trace and all numeric observations remain separate evidence, with the instrumentation limit stated rather than treating them as identical runs.

## Before/after chronology

- `evidence/performance/` retains the original first implementation's fixture and single-application results. The original full-app input timings include automation transport and **must not be compared directly** with the improved event-to-paint method.
- `evidence/round2/performance-before/` captures the original application build using the improved collector before the production bundle was replaced. Five cold loads: median **515.5 ms**; fifteen zooms: **63.9 ms**; fifteen hovers: **32.0 ms**. Main+worker V8/backing stores: **36.315 MB**; isolated renderer RSS approximately **540.3 MB**. Exact observations, source-build fingerprint and trace are retained.
- `evidence/round2/performance/` is a measured candidate (`app-CdawIVe3.js`) that was subsequently **rejected by the sustained-use check**, with raw/main-sampled/worker fixture controls and repeated application results. Five cold application loads: median **583.3 ms**; fifteen zooms: **62.8 ms**; fifteen hovers: **32.2 ms**. First render regressed relative to the comparable 515.5 ms baseline; zoom and hover are effectively unchanged at this sample/frame resolution. The regression is retained. Runtime validation, actual-axis state and additional visible statistics changed between builds, but these timings do not isolate a causal attribution. The source fingerprint and per-observation trace identity prevent silently comparing different builds.

- `evidence/round2/performance-fixed/` is the native-GC release build (`app-DsJyw_oe.js`) after 135/135 cross-engine browser checks. Five cold application loads: median **495.9 ms**, largest observed 540.8 ms; fifteen zooms: median **62.8 ms**, largest 98.2 ms; fifteen hovers: median **32.8 ms**, largest 33.6 ms. The same dispatch-to-paint collector was used. Against the original comparable 515.5/63.9/32.0 ms baseline, the observed changes are small and do not establish a causal performance improvement. The significant retention correction is checked separately by the observer regression and sustained-use run. Exact application and benchmark HTML fingerprints and asset names are embedded in this output.

- `evidence/final-build-measurements/performance/` measures the current log-gap-corrected bundle `app-pYEMV88W.js` with Chrome **157.0.8103.50**: five cold loads, median **507.4 ms**, maximum 615.6 ms; fifteen zooms, median **62.1 ms**, maximum 122.7 ms; fifteen hovers, median **32.4 ms**, maximum 33.6 ms. Both historical application cohorts used Chrome **156.0.8078.81**. Historical original -> current is 515.5 -> 507.4 / 63.9 -> 62.1 / 32.0 -> 32.4 ms; previous baseline -> current is 495.9 -> 507.4 / 62.8 -> 62.1 / 32.8 -> 32.4 ms, respectively. Browser version, sequential run order and the small sample confound code differences; these arrows neither establish a performance effect of the log-gap correction nor a controlled browser-version effect.

The first attempt at the current collection stopped when the host ran out of disk space while writing the application trace after 15 fixture repetitions. Its partial observations and failure are preserved in `evidence/final-build-measurements/performance-enospc/`; none is mixed into the completed fresh 20-run collection.

A worker optimization may improve first render/memory without improving zoom. Such regressions remain visible; a negative result is not deleted or relabeled.

Historical Chrome 156 controlled fixture medians, `app-DsJyw_oe.js` (per mode: five cold loads, five zooms and fifteen trusted hover observations):

| Measurement                     | Raw 1M main thread | Sampled main thread | Actual worker + sampling |
| ------------------------------- | -----------------: | ------------------: | -----------------------: |
| First chart render              |           596.5 ms |            427.6 ms |                 221.3 ms |
| Source preparation              |           427.8 ms |            293.1 ms |                 143.7 ms |
| Zoom                            |            21.6 ms |             30.7 ms |                  34.2 ms |
| Hover                           |            16.1 ms |             16.0 ms |                  16.2 ms |
| Page + worker V8/backing stores |          57.063 MB |           33.882 MB |                34.216 MB |
| Retained loss entries           |          1,000,000 |               3,580 |                    3,580 |

In that historical collection, **zoom was slower after reduction/resampling** (21.6 ms raw versus 34.2 ms through the actual worker); hover was essentially unchanged. Both remain recorded negative/neutral observations.

Current same-browser Chrome 157 fixture medians, `app-pYEMV88W.js` (same 5/5/15 observation counts):

| Measurement                     | Raw 1M main thread | Sampled main thread | Actual worker + sampling |
| ------------------------------- | -----------------: | ------------------: | -----------------------: |
| First chart render              |           603.6 ms |            434.0 ms |                 235.0 ms |
| Source preparation              |           429.1 ms |            299.6 ms |                 154.1 ms |
| Zoom                            |            12.8 ms |             28.1 ms |                  33.6 ms |
| Hover                           |            15.8 ms |             16.1 ms |                  16.2 ms |
| Page + worker V8/backing stores |          57.066 MB |           33.886 MB |                34.220 MB |
| Retained loss entries           |          1,000,000 |               3,580 |                    3,580 |

The current fixture again has **slower zoom in worker mode: 33.6 versus 12.8 ms raw**. Hover remains close to the frame-resolution floor. The current app's standalone medians are 507.4/62.1/32.4 ms; the faster isolated worker fixture does not establish a faster full React application.

Within the current same-browser fixture, the observed first-render difference separates on-main-thread reduction from worker placement under the explicitly calibrated page-only throttle. It does not establish that an equally slowed whole machine would achieve the worker number. Existing original fixture hover measurements used a synthetic event shortcut; trusted-event results are not presented as a hover optimization over that older method.

## Memory and sustained use

`Runtime.getHeapUsage` is collected separately from the page and dedicated worker, after explicit garbage collection in both contexts. We sum V8 used heap and backing stores, so the worker's approximately 32 MB Float64 allocation is counted. Native Canvas/GPU allocation is not part of that V8 sum. See the official [`Runtime.getHeapUsage`](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-getHeapUsage) interface.

For stronger attribution, separate post-timing MemoryInfra snapshots map the actual main frame and dedicated worker to renderer PIDs through `TracingStartedInBrowser` and `TracingSessionIdForWorker`. The PIDs are deduplicated when the worker shares the page renderer. `process_totals.private_footprint_bytes` is summed only for these attributed renderer processes; spare renderers, browser, GPU and utility processes are excluded. The raw memory trace and exact frame/worker mappings are saved per fixture mode and application. This gives a concrete renderer-private footprint at the million-point overview, while shared browser/GPU resources remain outside its scope. The approach follows the frame/process relationships inspected in the [official DevTools trace metadata handler](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/models/trace/handlers/MetaHandler.ts). A preliminary experiment confirmed worker and page share one renderer and produced an attributed private-footprint observation around 108 MB, rather than labeling the roughly 540 MB all-renderer RSS sum as that tab alone; the preliminary observation is not the final measured build.

Renderer RSS is also independently summed from renderer processes in a fresh one-page browser. It includes native process footprint and may include spare renderers. It excludes browser/GPU/utility processes and is an approximation of the tab's footprint, not the private-memory figure in browser Task Manager. Both metrics are reported with these boundaries.

Current Chrome 157 separate MemoryInfra overview snapshots (one observation per mode, not five-run medians):

| Mode                             | Attributed renderer private footprint | Attributed renderer RSS |
| -------------------------------- | ------------------------------------: | ----------------------: |
| Raw 1M fixture                   |                             78.957 MB |              194.544 MB |
| Main-thread sampled fixture      |                             54.675 MB |              169.017 MB |
| Worker sampled fixture           |                             58.509 MB |              173.572 MB |
| Complete three-chart application |                             87.935 MB |              215.368 MB |

The current application's separate five-run page+worker V8/backing median is **36.562 MB**. Its single attributed overview contains **36.536 MB** of V8/backing storage; it is a separate observation. All 20 timed-run snapshots and four attribution snapshots contain zero recorded memory errors. Optimized/application snapshots each contain one worker with at least 32 MB backing storage; main-thread controls have none. App/worker SHA256 receipts identify the same current production bundle as delivery and hosted smoke. Private footprint includes native renderer infrastructure beyond the V8 sum, while shared browser/GPU resources remain outside this attribution.

A separate real-UI soak script (`scripts/soak.mjs`) switches among all 20 runs, submits numeric ranges, changes scale and inspects points with approximately one-second pacing. At checkpoints it normalizes the active run and worker cache before measurement, then measures again after idle recovery. It verifies readiness/source counts and interaction completion; it is retained-memory/interaction evidence rather than a per-iteration oracle of painted bounds or scale. Browser geometry tests provide that separate evidence. Action counts are semantic active-loop actions, excluding checkpoint reloads/navigation and individual DOM/input events. Current soak output belongs in `evidence/final-build-measurements/soak/`; earlier raw checkpoints, GC results, browser errors and failures remain under `evidence/round2/soak/`.

The **completed current Chrome 157 soak** binds the same `app-pYEMV88W.js` and `data.worker-pg0qDgzo.js` SHA256 values as current performance, delivery and hosted smoke. It ran **180 seconds active plus 35 seconds idle**, 216.670 seconds wall time, under normal CPU scheduling. All 20 runs were visited over **136 completed iterations**, with zero page/console errors. Its **546 counted active-loop actions** comprise 136 run switches, 136 range submissions, 136 keyboard inspections, 92 scale changes and 46 zoom resets. The action count does not include checkpoint standardization or lower-level browser events.

Current combined retained page/worker V8 and backing stores: **38.931 MB warmup**, **44.966 MB maximum checkpoint**, **44.686 MB after activity**, and **41.440 MB after idle**; final minus warmup is **+2.509 MB**. Worker backing remained **32.318 MB** at every checkpoint. GC was explicitly requested in page and worker and checkpoints normalized the worker LRU/active run, so these figures describe retained allocations rather than unforced transient peaks. The severe historical retention storm did not recur in this finite current-bundle observation; it neither proves zero slower leaks nor establishes that the small difference from historical Chrome 156 checkpoints is caused by code changes. Raw observations and operation logs: [`evidence/final-build-measurements/soak/2026-11-10T09-21-50-323Z/results.json`](../evidence/final-build-measurements/soak/2026-11-10T09-21-50-323Z/results.json); portable index: [`latest.json`](../evidence/final-build-measurements/soak/latest.json).

Historical sustained-use chronology follows; these Chrome 156 checkpoints do not describe the current bundle.

The old-cache baseline ran 90 seconds active plus 35 seconds idle: 75 iterations across all 20 runs, no browser errors. Combined page/worker V8+backing stores grew from 39.05 MB warmup to a 52.74 MB active peak and recovered to 48.70 MB after 35 seconds idle. Worker storage stayed approximately 32.32 MB. The old query TTL was 60 seconds, so 35 seconds idle does not demonstrate full cache expiration; this result is **not proof of a leak**. The next candidate run is a separate longer observation, not a rewritten baseline.

That candidate exposed a real regression after the static matrix had passed: after 34 seconds, retained page+worker V8/backing stores reached 494.82 MB from 38.95 MB; the worker remained approximately 32.32 MB, while main-page V8 heap alone reached 461.69 MB. Only three canvases were present. An independent allocation sample attributed 213.30 MB of 216.90 MB sampled retained allocation to worker-message deserialization, with repeated `QueryObserver.getOptimisticResult/build` stacks. Root reproduced an observer transition whose active query had been synchronously removed by a custom inactive-query pruner. The pruner was removed entirely in favor of TanStack's standard ten-second inactive-query garbage collection; real-observer transition and idle-expiry tests guard this failure.

The failing run's eventual timeout was a **separate harness bug**: corrected fixture chronology changed the first sorted row, but the soak's wraparound assumed it was run001. The harness now selects the exact run001 link. We do not use that harness correction to dismiss the independently measured memory growth. The original failed run, image, allocations and causal test failure remain under `evidence/round2/soak/final-bounded-cache/`, `retention-diagnostic/` and `evidence/round2/retention/`. A bounded fixed-build probe on `app-DsJyw_oe.js` then completed 30 seconds activity + 15 seconds idle: 24 iterations across all 20 runs, no browser errors, combined retained memory 38.92 MB warmup, 43.41 MB peak and 40.34 MB after idle; worker backing stores stayed 32.318 MB. This corroborates the real-observer regression fix without implying a multi-hour leak guarantee. The subsequent full run passed 180 seconds of active use plus 35 seconds idle (217 seconds wall time), 136 completed iterations across all 20 runs and 546 counted actions, with zero page/console errors. Combined retained V8/backing stores were 38.816 MB warmup, 44.928 MB peak, 44.675 MB after activity and 41.431 MB after idle; net retained change was +2.615 MB. Worker backing stores remained 32.318 MB. DOM counters stayed around 397 elements / 651 nodes / 240 event listeners / 3 canvases. The severe prior retention storm did not recur. Raw snapshots, action counts, source assets and limits: `evidence/round2/soak/final-native-gc/2026-11-09T21-17-15-550Z/results.json`; its portable `latest.json` pointer includes the relative directory. This finite observation does not prove zero leaks over hours.

Historical Chrome 156 fixed-build separate MemoryInfra overview snapshots, `app-DsJyw_oe.js` (one observation per mode; raw trace retained):

| Mode                             | Attributed renderer private footprint | Attributed renderer RSS |
| -------------------------------- | ------------------------------------: | ----------------------: |
| Raw 1M fixture                   |                              93.85 MB |               231.93 MB |
| Main-thread sampled fixture      |                              69.55 MB |               206.08 MB |
| Worker sampled fixture           |                              73.03 MB |               210.65 MB |
| Complete three-chart application |                             102.42 MB |               251.82 MB |

In both historical worker-backed snapshots, trace metadata attributes the page and data worker to the same renderer PID; it is counted once. This stronger evidence excludes spare renderer processes from the attributed footprint. The historical complete app's separately measured page+worker V8/backing median is 36.564 MB; the larger private footprint includes additional renderer infrastructure/native allocation. None is relabeled a complete accounting of shared GPU/browser resources.

A few minutes of successful use can expose obvious retention and interaction failures. It does not prove absence of leaks over hours or in every browser.

## Reproduce

```sh
npm ci
npm run build
npm run preview -- --port 4173
# another terminal; choose a fresh reproduction directory
node scripts/calibrate-cpu-scope.mjs evidence/reproduction-01/cpu-scope-calibration.json
node scripts/performance.mjs http://127.0.0.1:4173 5 evidence/reproduction-01/performance
node scripts/soak.mjs http://127.0.0.1:4173 180 35 evidence/reproduction-01/soak
```

Use a fresh evidence directory; completed and failed results are never overwritten. Keep the build frozen between performance and soak, and run without other CPU-intensive test jobs. Page CPU x4 is configured automatically for performance; soak runs at normal scheduling. The scripts use bundled Playwright Chromium when installed, otherwise an available system Chrome. Actual served app/worker SHA256, browser version and methodology are embedded in output. Open representative `*.trace.json` files through Chrome DevTools Performance to inspect named `soup:` spans and real paint/input events. The current completed collection is under `evidence/final-build-measurements/`; select its performance, sustained-use and CPU-calibration paths in `docs/delivery.json` before running `node scripts/build-submission-note.mjs --verify-evidence` and regenerating the PDF.
