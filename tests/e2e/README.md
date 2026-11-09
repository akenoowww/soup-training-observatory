# Browser evidence

Run `npm run build`, install browser engines with `npx playwright install chromium firefox webkit`, then run `npm run test:e2e`. The runner starts production preview on port 4173 when absent and can reuse an existing preview of the same `dist/`. CI installs the Linux browser dependencies before executing the same suite.

The second-round suite has 45 scenarios, each executed in Chromium, Firefox and WebKit: 135 local engine/scenario executions. This is not 135 different user journeys. The recorded final run passed all 135 with zero skipped/flaky/unexpected results. Local execution used macOS; the supplied Ubuntu workflow is prepared separately and must not be described as an observed remote CI pass.

## What the stronger checks observe

- `adversarial.spec.ts` wraps the **real** Worker and defers delivery of genuine generated responses. It delivers run and viewport replies in reverse selection order through the actual React/TanStack Query/client path. It also checks already-loaded cross-run loading, selected-range unavailable/busy/error states, malformed identity/columns, stale source revision and successful fresh-worker retry.
- `canvas-truth.spec.ts` inspects actual metric-colored Canvas pixels, and captures text forwarded to the real Canvas `fillText` implementation. It checks NaN gaps against finite control data, numeric axis/painted-value agreement for all three metrics, deep-zoom precision, isolated finite points between gaps, logarithmic labels and real zeros. The singleton intervention changes only one real worker reply's metric columns/statistics while preserving its genuine source envelope; this models a specific valid boundary case, not an alternative product data source.
- A twenty-distinct-viewport regression follows the query-eviction loop discovered during the first sustained soak. It counts unmodified native Worker requests, verifies current rendered bounds/statistics after every viewport, and closes the test page if a runaway exceeds 24 requests rather than risking OOM. The final run made exactly 20 requests in every engine. The production fix uses native inactive-query garbage collection, not custom active-query eviction.
- Viewport-changing scenarios wait for exact requested input bounds and all three renderer-derived domains before the ready marker. A generic old-ready view is not accepted as proof that a new generation committed. Malformed-source tests poison real replies persistently during an explicit reload, then disarm only after fail-closed UI before genuine retry.
- Additional scenarios use real pointer dragging, keyboard inspection/zoom/tab movement, bookmark persistence/storage failure, explicit UTC under a non-US locale/+14 timezone,320/390/768px layouts, DPR2, touch-input emulation and offline viewport preparation after the worker has loaded. Touch emulation is not a physical phone, and does not establish pinch-zoom ergonomics.
- `accessibility.spec.ts` runs axe against list, loaded metrics, expanded values/axes, open search and open mobile-navigation states. The JSON retains both confirmed violations and incomplete/manual findings. Computed-color/hit-testing review and actual mobile screenshots corroborate selected native-dialog contrast pairs without declaring full accessibility conformance.

Safari/WebKit's macOS default keyboard preference uses Option+Tab to include links/buttons. The mobile traversal test uses that native convention only on Darwin; other platforms use Tab. Dialog traversal remains explicit across engines, and the UI returns focus to the actual opener.

## Boundaries

These tests do not prove all possible telemetry distributions or zoom windows, scientific validity, physical-device behavior, screen-reader usability, real-cluster freshness/authorization, a production host's HTTP configuration, or sustained memory behavior. Separate seeded domain tests and performance/soak evidence address different risks. Canvas color scans are scoped geometric checks with finite controls, not full-image equivalence proofs.

Original initial failures and their traces remain under `evidence/round2/browser-first-run/`, `cross-engine-baseline/` and `full-first-failures/`. The corrected test-oracle and platform assumptions are explained there alongside actual application defects. Final output lives at `evidence/round2/e2e-final.txt` and `e2e-results.json`.
