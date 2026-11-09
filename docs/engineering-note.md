# SOUP engineering note

The canonical short submission note is [the two-page PDF](submission-note.pdf). This file links its evidence and records the release boundary. The assignment requests generated data; a training backend and authentication are not prerequisites for this frontend exercise.

## Verdict

**DON'T SHIP the submission yet: the final sustained-use check and externally accessible delivery links are not yet complete. Public publication still requires the owner’s authorization.** The local application candidate has passed the checks below, with no remaining known P1 defect in the requested generated-data scenarios. The final delivery step is a hosted smoke check and a repository the reviewer can access. The next technical improvement is an explicit render-workload policy for extreme discontinuities. The chart benchmark is kept separate from complete application behavior.

## Truthfulness

Source steps are nonnegative safe integers; unsupported coordinates are rejected and counted. Numeric sorting applies the last received observation at each duplicate step, including invalid values. Exact binary bounds select only observations inside the viewport. Non-finite values and absent steps split finite segments. Each segment/bucket retains first/last/min/max observations in source order. No averaging or smoothing is enabled. Isolated finite points have explicit markers, and constant zero curves are padded inside the plot instead of being clipped at its edge.

[The independent oracle and correctness argument](sampling-correctness.md) cover 128 malformed arrival streams, 1,152 dataset/range/metric combinations and 105 directed outlier/boundary combinations. The actual million-point fixture is also tested over six widths and six ranges. This is reproducible adversarial evidence and an algorithmic argument, not a formal proof over every browser and floating-point state.

Hover and export identify sampled observations. Viewport statistics come from all unique source rows in view. Selected-range summaries remain unavailable during pending or failed requests. Actual painted axis labels and curve coordinates are compared in browser tests. Log mode explicitly discloses excluded nonpositive samples; linear mode retains genuine zero values.

## Executed checks

- **71 unit tests:** normalization, independent sampling oracle, statistics, source/protocol validation, request cancellation/recovery, cache bounds, URL/storage contracts and UTC/numeric precision.
- **45 browser scenarios x 3 engines = 135 passed**, zero skipped/flaky: Chromium, Firefox and WebKit on macOS. These include actual Canvas spike/gap/singleton/zero geometry, axis `fillText` labels, shared drag/reset, controlled real-Worker response order through React/query/client, pending/error scopes, malformed source rejection, reload, storage failures, keyboard/modal focus, 320/390/768px, DPR2 and touch emulation.
- Formatting, TypeScript, ESLint and production build pass. CI installs all three engines; local results are not claimed as an executed Linux CI result.
- Fifteen axe state reports contain zero confirmed violations. Three mobile native-dialog scans retain an incomplete background/contrast category. All 31 flagged nodes were examined through computed colors, opacity, hit tests and three actual screenshots: contrast 5.27-13.25:1. The incomplete reports remain unchanged; this is not full accessibility certification.

Outputs: [checks](../evidence/round2/checks-final.txt), [browser run](../evidence/round2/e2e-final.txt), [browser methods](../tests/e2e/README.md), [accessibility evidence](../evidence/round2/accessibility/).

## Silent failures

- **Stale data:** responses carry immutable source revision/recorded time; view preparation time is separate. Stale revisions and impossible chronology fail closed. Reload does not advance the source snapshot. No live-source freshness is inferred.
- **Races:** query identity includes run/revision/range/width, responses retain their producing viewport, and aborted request IDs cannot update a new selection. Controlled real Worker replies are released in reverse order in integration tests. Previous same-run plots stay covered while updating; a different run gets no placeholder.
- **Locale/time zone:** explicit en-US numeric presentation and UTC timestamps are exercised in a Russian locale with a UTC+14 browser zone, plus offset/date-rollover tests.
- **Divergence:** extrema are preserved, smoothing is absent, and low final loss does not become a healthy-run verdict.
- **Log zeros:** values are not clamped positive. An all-zero log view explicitly says no positive values; switching back restores the actual zero line.

## Performance and memory

Chrome 156, macOS arm64, production build. Five fresh repetitions per fixture mode and five full-application loads; input summaries contain fifteen observations each. CPU x4 applies to the page. Calibration showed the dedicated worker stayed normally scheduled, so a main-thread-sampled control separates reduction from worker placement.

| Median                                                 | Raw million-point chart | Main-thread sampling | Worker sampling |
| ------------------------------------------------------ | ----------------------: | -------------------: | --------------: |
| First render                                           |                596.5 ms |             427.6 ms |        221.3 ms |
| Zoom                                                   |                 21.6 ms |              30.7 ms |         34.2 ms |
| Hover                                                  |                 16.0 ms |              15.9 ms |         16.2 ms |
| Attributed renderer private footprint, single overview |                93.85 MB |             69.55 MB |        73.03 MB |

The **complete React application** uses comparable actual input-to-paint endpoints before/after hardening: first render **515.5 -> 495.9 ms**; zoom **63.9 -> 62.8 ms**; hover **32.0 -> 32.8 ms**. The small observed cold-render difference is descriptive; causal improvement is not established by five samples. An interim candidate measured 583.3 ms and later failed the memory soak; its negative results remain preserved. The smaller chart benchmark does not establish that the full application became faster.

At 1M points the full application's measured renderer private footprint was **102.42 MB**. Actual trace metadata attributes the page and worker to the same PID, deduplicated; spare renderer/browser/GPU processes are excluded. Its V8/backing-store sum was about **36.56 MB**, including the 32 MB source columns. Original all-renderer RSS estimates remain in the raw evidence and are not relabeled as private tab memory. Memory dumps were collected separately from timed runs.

[Raw observations and traces](../evidence/round2/performance-fixed/results.json), [comparable old-build results](../evidence/round2/performance-before/results.json), [methodology and limitations](performance-methodology.md). The interim custom cache cap caused a real ~495 MB retained-memory spike and was rejected. Native TanStack 10-second GC replaces it; the exact observer-transition regression and fixed 30-second probe passed. A new 180-second sustained-use run is still being verified under `evidence/round2/soak/`; no short run establishes absence of leaks over hours.

## Surprise, remaining concern and AI use

A retained outlier was still invisible when it was the only finite point between two gaps. A genuine zero could also disappear on a clipping boundary. These were rendering failures that sampler tests alone missed. A plausible status-shaped sparkline was removed because it invented a trend. The remaining concern is perceptual compression: extrema survive, while dense timing/oscillations and subpixel gaps do not become fully readable. Pathologically many discontinuities can exceed the normal output budget; that workload needs a separately bounded rendering policy before broader real-source use.

Codex with Frontend Workbench authored the implementation and independent agent reviews. Accepted suggestions included uPlot, worker ownership, extrema sampling, explicit fixture provenance and native dialogs. Corrected suggestions included invented trends, mixed-scope summaries, collapsed labels, invisible singleton/zero rendering and mistaken CPU/memory attribution. Verification was executed through tests, browser pixels/labels and Chrome traces. No candidate's human verification, personal understanding or interview performance is fabricated. The live discussion remains the candidate's own work; no canned answers are supplied.
