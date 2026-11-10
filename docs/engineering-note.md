# SOUP engineering note

The canonical short submission note is [the two-page PDF](submission-note.pdf). This file links its evidence and records the release boundary. The assignment requests generated data; a training backend and authentication are not prerequisites for this frontend exercise.

## Verdict

**SHIP within the assignment's generated-data scope.** The [public repository](https://github.com/akenoowww/soup-training-observatory), [deployed application](https://akenoowww.github.io/soup-training-observatory/) and [successful complete Linux CI](https://github.com/akenoowww/soup-training-observatory/actions/runs/42761775159) are available. Local checks, Linux CI and hosted smoke passed for the log-gap correction; the sustained-use measurements below remain the earlier recorded baseline. **First improvement after SHIP:** impose explicit processing and rendered-output budgets for extremely fragmented series with many breaks. If preserving the real breaks exceeds the budget, show an actionable narrower-range state rather than silently discarding discontinuities. This exercise does not require a real training backend.

## Truthfulness

Source steps are nonnegative safe integers; unsupported coordinates are rejected and counted. Numeric sorting applies the last received observation at each duplicate step, including invalid values. Exact binary bounds select only observations inside the viewport. Non-finite values and absent steps split finite segments. Positive/nonpositive transitions split reduction state before sampling, preserving original numeric endpoints. Each resulting component/bucket retains first/last/min/max observations in source order. No averaging or smoothing is enabled. Isolated finite points have explicit markers, and constant zero curves are padded inside the plot instead of being clipped at its edge.

[The independent oracle and correctness argument](sampling-correctness.md) cover 128 malformed arrival streams, 1,152 dataset/range/metric combinations and 105 directed outlier/boundary combinations. The actual million-point fixture is also tested over six widths and six ranges. This is reproducible adversarial evidence and an algorithmic argument, not a formal proof over every browser and floating-point state.

Hover and export identify sampled observations. Viewport statistics come from all unique source rows in view. Selected-range summaries remain unavailable during pending or failed requests. Actual painted axis labels and curve coordinates are compared in browser tests. Log mode explicitly discloses excluded nonpositive samples; linear mode retains genuine zero values. Nine added tests cover two separate zero/negative intervals in one bucket and 2,160 seeded log-topology combinations. A real Canvas regression verifies two log gaps and the corresponding linear zero curves.

## Executed checks

- **80 unit tests:** normalization, independent sampling oracle, statistics, source/protocol validation, request cancellation/recovery, cache bounds, URL/storage contracts and UTC/numeric precision.
- **46 browser scenarios x 3 engines = 138 passed**, zero skipped/flaky: Chromium, Firefox and WebKit on macOS. These include actual Canvas spike/gap/singleton/zero geometry, axis `fillText` labels, shared drag/reset, controlled real-Worker response order through React/query/client, pending/error scopes, malformed source rejection, reload, storage failures, keyboard/modal focus, 320/390/768px, DPR2 and touch emulation.
- Formatting, TypeScript, ESLint and production build pass. Actual pinned Ubuntu 24.04 CI passed all three isolated browser jobs, 46 scenarios each, 138 in total; the machine-readable reports are in `evidence/followup-log-scale/linux-ci/final/`.
- Fifteen axe state reports contain zero confirmed violations. Three mobile native-dialog scans retain an incomplete background/contrast category. All 31 flagged nodes were examined through computed colors, opacity, hit tests and three actual screenshots: contrast 5.27-13.25:1. The incomplete reports remain unchanged; this is not full accessibility certification.

Outputs: [checks](../evidence/followup-log-scale/checks-serial.txt), [browser run](../evidence/followup-log-scale/e2e-results.txt), [browser methods](../tests/e2e/README.md), [current axe reports](../evidence/followup-log-scale/accessibility/) and [earlier manual checks](../evidence/round2/accessibility/manual/README.md).

## Silent failures

- **Stale data:** responses carry immutable source revision/recorded time; view preparation time is separate. Stale revisions and impossible chronology fail closed. Reload does not advance the source snapshot. No live-source freshness is inferred.
- **Races:** query identity includes run/revision/range/width, responses retain their producing viewport, and aborted request IDs cannot update a new selection. Controlled real Worker replies are released in reverse order in integration tests. Previous same-run plots stay covered while updating; a different run gets no placeholder.
- **Locale/time zone:** explicit en-US numeric presentation and UTC timestamps are exercised in a Russian locale with a UTC+14 browser zone, plus offset/date-rollover tests.
- **Divergence:** extrema are preserved, smoothing is absent, and low final loss does not become a healthy-run verdict.
- **Log zeros:** values are not clamped positive. Every nonpositive component survives reduction before log masking, so separate zero/negative intervals cannot disappear and reconnect a positive curve. An all-zero log view explicitly says no positive values; switching back restores the actual zero line.

## Performance and memory

Recorded SHIP baseline `app-DsJyw_oe.js`, measured before the subsequent log-gap correction. Chrome 156, macOS arm64, production build. Each fixture mode has **5 first-render, 5 zoom and 15 hover observations**. The complete application has **5 first-render, 15 zoom and 15 hover observations**; the comparable before-build application has the same counts. The PDF generator derives these counts from raw `fixtureRuns`/`applicationRuns` and cross-checks every summary count and value array; run `node scripts/build-submission-note.mjs --verify-measurements` without launching a browser. CPU x4 applies to the page. Calibration showed the dedicated worker stayed normally scheduled, so a main-thread-sampled control separates reduction from worker placement.

| Median                                                 | Raw million-point chart | Main-thread sampling | Worker sampling |
| ------------------------------------------------------ | ----------------------: | -------------------: | --------------: |
| First render                                           |                596.5 ms |             427.6 ms |        221.3 ms |
| Zoom                                                   |                 21.6 ms |              30.7 ms |         34.2 ms |
| Hover                                                  |                 16.1 ms |              16.0 ms |         16.2 ms |
| Attributed renderer private footprint, single overview |                93.85 MB |             69.55 MB |        73.03 MB |

The **complete React application baseline** uses comparable actual input-to-paint endpoints before/after the earlier hardening: first render **515.5 -> 495.9 ms**; zoom **63.9 -> 62.8 ms**; hover **32.0 -> 32.8 ms**. The small observed cold-render difference is descriptive; causal improvement is not established by five samples. An interim candidate measured 583.3 ms and later failed the memory soak; its negative results remain preserved. The smaller chart benchmark does not establish that the full application became faster.

At 1M points that measured baseline application's renderer private footprint was **102.42 MB**. Actual trace metadata attributes the page and worker to the same PID, deduplicated; spare renderer/browser/GPU processes are excluded. Its V8/backing-store sum was about **36.56 MB**, including the 32 MB source columns. Original all-renderer RSS estimates remain in the raw evidence and are not relabeled as private tab memory. Memory dumps were collected separately from timed runs.

[Raw observations and traces](../evidence/round2/performance-fixed/results.json), [comparable old-build results](../evidence/round2/performance-before/results.json), [methodology and limitations](performance-methodology.md). The interim custom cache cap caused a real ~495 MB retained-memory spike and was rejected. Native TanStack 10-second GC replaces it; the exact observer-transition regression and fixed 30-second probe passed. The sustained-use run for that same baseline completed 136 cycles (546 counted actions) across all 20 runs over 180 seconds activity plus 35 seconds idle, with zero browser/console errors. Retained page/worker V8 and backing stores: 38.82 MB warmup, 44.93 MB maximum checkpoint, 41.43 MB after idle; worker backing stayed 32.318 MB. These historical measurements do not assert timing or memory of the later log-gap correction. The remaining 2.61 MB above warmup is reported, so absence of leaks over hours is not claimed. See `evidence/round2/soak/final-native-gc/latest.json`.

## Surprise, remaining concern and AI use

A retained outlier was still invisible when it was the only finite point between two gaps. A genuine zero could also disappear on a clipping boundary. These were rendering failures that sampler tests alone missed. A plausible status-shaped sparkline was removed because it invented a trend. The remaining concern is perceptual compression: extrema survive, while dense timing/oscillations and subpixel gaps do not become fully readable. Pathologically many discontinuities can exceed the normal output budget; that workload needs a separately bounded rendering policy before broader real-source use.

Codex with Frontend Workbench authored the implementation and independent agent reviews. Accepted suggestions included uPlot, worker ownership, extrema sampling, explicit fixture provenance and native dialogs. Corrected suggestions included invented trends, mixed-scope summaries, collapsed labels, invisible singleton/zero rendering and mistaken CPU/memory attribution. Verification was executed through tests, browser pixels/labels and Chrome traces. The recorded verification is tool-driven test execution and source/browser inspection. Human acceptance and physical-device/assistive-technology studies remain separate evidence.

## Delivery and independent platform evidence

The owner explicitly approved public GitHub and Pages under `akenoowww`. The repository and HTTPS site were created; the deployed JavaScript SHA256 matches the current tested local log-fix bundle `app-pYEMV88W.js`, not the older measured performance baseline. Hosted smoke passed eight groups in each of Chromium, Firefox and WebKit, including real spike/gap pixels, source counts, module worker, fonts, CSV, mobile routes and error recovery. No HTTP 4xx, request failure or JavaScript error was observed. See `evidence/followup-log-scale/hosted/results.json`.

Initial real Linux CI failures are preserved in `evidence/linux-ci/`: missing test readiness conditions, an immediate sort read, and one unexplained Firefox renderer crash under parallel execution. The final pipeline uses pinned Ubuntu 24.04 and one worker per isolated engine job. Chromium/WebKit use internally aligned Playwright 1.65.0; Firefox uses 1.64.1 to avoid the confirmed upstream ARIA regression. All axe rules and application labels remain. Each job passed every one of its 46 scenarios: 138/138 overall, zero retries/skips. The known older-WebKit zero-delta automation limitation is independently recorded rather than patched in the application.

The generator-only follow-up initially hit the default 5-second limit in the existing 192-dataset unit oracle while test files ran concurrently; the blocked deployment and failed CI logs remain in `evidence/followup-log-scale/`. Vitest now runs files sequentially, preserving all 80 tests, seeds, assertions and the default deadline. The repeated full Linux workflow, local serial checks and hosted smoke are reported separately from the historical performance/soak baseline.
