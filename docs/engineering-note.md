# SOUP engineering note

## Verdict

**SHIP as a synthetic frontend demonstrator. DON'T SHIP as a live production training control.** The required generated-data experience is implemented; real-cluster authentication, ingestion contracts, source sequence/freshness guarantees, authorization and operator-validated acceptance would be required before someone relies on it to spend or stop real money. The first integration priority is a source contract with run identity, monotonically increasing revision, ingestion timestamp and explicit missing-value semantics. Reload time is not source freshness.

## Truthfulness and architecture

The browser generates twenty deterministic fixtures. A module worker owns Float64 step/loss/lr/grad_norm columns. The million-point run allocates 32,000,000 bytes for canonical columns; UI receives sampled arrays. A two-run LRU bounds canonical retention. React owns presentation, TanStack Query owns asynchronous cache/isolation, and uPlot supplies mature Canvas rendering. Native controls provide precise ranges and keyboard alternatives.

Numeric stable sorting precedes plotting. Duplicate steps use the last received observation, including invalid latest values. Non-finite values become null gaps; absent training steps add an explicit null marker. Each visible numeric-step bucket retains first/last/min/max observations in original order, independently by metric. There is no averaging or smoothing. A single-point spike remains selected whenever the visible range contains it. Pathological frequent discontinuities deliberately exceed the normal four-points-per-pixel budget instead of inventing continuity.

Tooltips display the actual retained measurement, labeled sampled. Summary/axis formatting is separate from values; tiny learning rates retain scientific notation, and adjacent deep-zoom ticks expand precision until distinct. The latest loss follows the visibly labeled selected range; step/duration summaries describe the whole run. CSV is labeled sampled viewport, with blank gap values.

## Automated evidence

Executed: **41 unit tests and 13 production-browser tests passed**, strict TypeScript, ESLint and build passed. Automated WCAG 2 A/AA axe checks of the inspected desktop/mobile views report zero violations; this is not full accessibility certification. `npm audit` reports zero known vulnerabilities after a tested minimatch dev-tool override. See the recorded output in `evidence/` for versions and results. Unit checks cover the million-point spike over six widths and six viewports, bucket extrema, finite source-value identity, NaN/±Infinity, missing steps, duplicate policy, numeric ordering, zero handling, exact statistics, invalid latest values, worker abort/out-of-order replies, timeout/crash recovery, and UTC/date rollover. Browser scenarios cover actual painted spike pixels, shared zoom, visible quality information, logarithmic exclusions, switching runs, search/filter/sort/recovery, keyboard use, sampled export, worker failure/retry and mobile overflow.

These checks do **not** establish real-cluster behavior, scientific validity of fixtures, every possible zoom boundary/data distribution, screen-reader usability, touch ergonomics on physical devices, visual clarity on every display, or performance on arbitrary hardware. A min/max line preserves extrema but can visually overstate local oscillation/order within a very dense pixel; zoom reveals the retained observations. At overview resolution a one-point gap can be subpixel, so missingness counts remain visible beside charts.

## Silent failures

- **Stale data:** source is explicitly synthetic/static, status is snapshot status, and reload never claims new training progress. A real source is intentionally absent; freshness cannot be certified by this frontend.
- **Request races:** run ID, range and width are query keys; AbortSignal removes pending requests, and responses resolve only their original request ID. The run detail remounts on identity changes, so an old run's plot is not reused under the new heading.
- **Locale/time zone:** numeric axes use steps, precise inputs use numbers, numeric presentation is explicit en-US, and every timestamp is UTC. Tests cover offset input and date rollover.
- **Smoothing/divergence:** no smoothing path exists; extrema plus the divergence fixture make late increases discoverable. No 'healthy' verdict is inferred from final loss.
- **Log zeros:** nonpositive values are masked only for rendering and counted as excluded plotted samples; the original values remain inspectable on linear scale. Non-finite values never become zero.
- **Failure recovery:** worker failures show an actionable error without substituted demo success. Retry starts a fresh worker. Invalid URL ranges are disclosed and restore the full recorded domain.

## Performance

Measured results, CPU ×4 Chrome trace files and collection methodology are in `evidence/performance/`. Chrome 156, macOS arm64, three fixture repetitions:

| Measurement | Unreduced baseline | Worker + extrema |
| --- | ---: | ---: |
| First render, median | 601.1 ms | 243.2 ms |
| Zoom, median | 6.9 ms | 33.3 ms |
| Hover, median | 30.6 ms | 30.9 ms |
| Page + worker V8 / backing stores | 57.1 MB | 34.6 MB |
| Isolated renderer RSS, approximate | 526.5 MB | 507.9 MB |
| Retained loss entries | 1,000,000 | 3,580 |

Zoom is **slower** after worker resampling; hover is effectively unchanged at the two-animation-frame measurement resolution. This negative result is retained. Separate full React route, one run: first render **548.3 ms**, zoom **192.3 ms**, hover **41.2 ms**, V8/backing stores **37.0 MB**, renderer RSS **549.9 MB**. Those application timings include automation transport and cannot be compared directly with fixture-only timings.

 The isolated fixture compares unreduced million-point uPlot against the same data with worker sampling. First render includes source preparation; zoom completes after the updated plot paints; hover covers a pointer movement through a subsequent paint. The fixture isolates chart/pipeline cost; separate application results include the full React interface. Chrome CPU throttling is an emulation, not a claim about a named low-end device. Main-thread V8 heap alone excludes worker data; memory results identify backing stores, worker heap and renderer RSS separately rather than labeling one heap as complete tab memory.

## What surprised us; what remains concerning

The easiest misleading chart was a tiny status-shaped sparkline: it looked plausible while claiming a trend unrelated to that run. It was removed. Duplicate removal also initially inflated the reordered count because shifted array positions were mistaken for changed source order; an independent all-run consistency check exposed it. Dense sampling remains an interpretation trade-off: preserving every extreme protects a divergence signal, while compression hides detailed timing and can make a microscopic gap impossible to see. Explicit gaps/counts and zoom help, but an operator study with representative real telemetry would be the next meaningful acceptance check.

## AI assistance

Codex implemented this project with the requested Frontend Workbench Product Design and Copy Guard skills. Independent agents authored the data pipeline, chart adapter, browser tests and performance collector, and reviewed source-contract consistency. Accepted suggestions included mature uPlot, worker ownership, per-bucket extrema, explicit synthetic provenance and UTC formatting. Rejected/corrected output included invented status-based microcharts, CSS-variable strings passed to Canvas colors, colliding deep-zoom labels, incorrect issue counts and a worker timeout that would retry the same stalled worker. Verification was performed through executed tests, real browser rendering, accessibility checks and recorded traces; no human-authored verification or real training integration is claimed.
