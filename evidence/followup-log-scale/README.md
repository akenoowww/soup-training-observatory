# Log-topology regression and shared-snapshot correction

The original sampler could retain a bucket's first zero or most-negative minimum while discarding another nonpositive interval. Masking only the retained values afterwards then connected positive observations across the discarded zero/negative values.

- `before-fix.txt` retains the initial scale-aware proposal's failing invocation. The former JavaScript implementation ignored its unused fifth argument.
- `before-shared-snapshot-fix.txt` is the regression run using the unchanged four-argument API. It demonstrates the lost second zero, lesser-negative interval and duplicate-derived boundary.
- `data-tests-final.txt` records the corrected shared snapshot with directed regressions, independent seeded log-topology invariants and the existing data/domain suite.

The correction splits reduction state at finite positive/nonpositive transitions, retains first/last/minimum/maximum original observations for each resulting component/bucket, and leaves finite nonpositive representatives numeric. Linear rendering therefore remains continuous without fabricated gaps; the existing log mask turns those retained representatives into the required breaks. Raw min/max/latest still describe every finite source observation in view, and nonpositive rows are not counted as invalid.

The independent new oracle checks 48 seeded arrival streams, five widths, three viewports and three metrics (2,160 combinations). It compares positive component boundaries/extrema, original point identity, exact raw statistics and every rendered positive adjacency against a materialized source reference. Directed tests include second zeros, less-negative boundaries, invalid/missing values, duplicate resolution and all-nonpositive views. Long nonpositive plateaus remain reduced rather than emitting all excluded source rows.

The normal four-finite-points-per-bucket budget now assumes bounded positive/nonpositive fragmentation, in addition to bounded missing/non-finite fragmentation. Rapidly alternating sign components can exceed it. A render-workload limit and recovery policy remain the explicitly named first post-SHIP improvement. These checks do not prove arbitrary browser painting; the separate Canvas regression covers the actual renderer.

Only the known local project prefix was normalized to `/workspace/soup` in these new text outputs. Original public diagnostics/history were not altered.

## Integrated verification

Source commit: `aa273d70ba898ba6f13f7530ba240c10a972166d`. `checks.txt` records formatting, TypeScript, ESLint, all 80 unit tests and production build. `unit-results.json` records the complete 80/80 unit run. `e2e-results.json` / `.txt` record 46 scenarios in each of Chromium, Firefox and WebKit on macOS: **138 passed**, zero retries/skips/flaky results. The coarse-reduction regression examines actual Canvas pixels for two separate zero plateaus before/after log and back to linear. Fifteen fresh axe state reports are in `accessibility/`, with zero confirmed violations; previous manual examination of incomplete native-dialog background checks remains historical evidence.

`local-first-run.json` / `.txt` preserve the 137/138 attempt. The loading-state test deliberately held the worker script but awaited the page load event; Firefox waited for that same worker. It now observes DOMContentLoaded while the worker is blocked and verifies both the pending UI and eventual real chart. `targeted-three-engines.txt` records all six targeted checks passing before the full repeat. `canvas-control-before-interior-fixture.txt` preserves the initial pixel-control failure; the positive control was moved inside the log axis by adding a genuine positive trough to the synthetic source.

Current local assets: `app-pYEMV88W.js` SHA256 `67a08b9a7f8e221727ee09a74231dd8b010e3bfd1ff824badbabbbc75f0051d7`; `data.worker-pg0qDgzo.js` SHA256 `bf1595d98be8e7f31da13faf50b2d043165c7cfdfb11a809dee69934a803f69c`. The old performance and sustained-use measurements remain unchanged and explicitly describe `app-DsJyw_oe.js`, before this correction. They do not measure this new bundle.

## Unit runner scheduling follow-up

The first application-fix Linux workflow [42760822037](https://github.com/akenoowww/soup-training-observatory/actions/runs/42760822037) passed all 80 units in each job and all 138 browser executions; `linux-ci/summary.json` verifies identical 46 scenario titles per engine. A later generator-only commit had an intermittent 5-second timeout in the existing single 192-dataset property test. Both that failed workflow [42761440977](https://github.com/akenoowww/soup-training-observatory/actions/runs/42761440977) and the blocked deployment [42761470204](https://github.com/akenoowww/soup-training-observatory/actions/runs/42761470204) are retained; their failing check logs are `generator-ci-unit-timeout.txt` and `deployment-unit-timeout.txt`. The tested application source did not change between the successful and failed runs.

Commit `18e142564cc1b44069bae58a84a13d98f661db34` runs Vitest files sequentially. All 80 tests, the 192 datasets / 1,152 existing oracle combinations, the 2,160 new log-topology combinations and the default per-test timeout remain intact. No retry, seed reduction, assertion removal or timeout extension was introduced. `unit-serial-results.json` and `checks-serial.txt` record the full local serial run. The ordinary output bundle remains `app-pYEMV88W.js`. This scheduling choice reduces contention; it does not guarantee completion on an arbitrarily overloaded machine.

## Final current-code delivery

Final workflow [42761775159](https://github.com/akenoowww/soup-training-observatory/actions/runs/42761775159), source/tooling commit `18e142564cc1b44069bae58a84a13d98f661db34`, completed successfully. `linux-ci/final/` contains the observed workflow status, three full per-engine JSON reports, driver graphs and a summary verifying the same 46 titles / 138 total passes, zero retries/skips/flaky results. All three jobs also passed the complete 80-test unit suite and normal check/build command.

[Pages deployment42761802036](https://github.com/akenoowww/soup-training-observatory/actions/runs/42761802036) published that commit successfully. `hosted/results.json` records eight live-site groups in each of three fresh browser contexts (24 groups); `hosted-bundle-match.json` verifies both current app and worker SHA256 against local production assets in all three engines. The current two-page report is regenerated from these records; performance/soak figures continue to name their older measured bundle.
