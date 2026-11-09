# SOUP · Training Observatory

A complete frontend for inspecting 20 synthetic training runs, including a million-point run and deliberately malformed measurements. Built with React, TypeScript, Vite, TanStack Query, a dedicated Web Worker, and uPlot.

## Run locally

Requires Node.js 24+ and npm.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. Routes use a hash router, so direct run links also work on static hosting under a repository subpath.

```sh
npm run check        # strict types, lint, unit tests, production build
npm run test:e2e     # browser integration scenarios, production preview
npm run test:perf    # actual Chrome CPU ×4 traces and before/after memory
```

For the complete browser suite, install all engines with `npx playwright install --with-deps chromium firefox webkit`. On macOS the Chromium project can also use an installed Google Chrome. Mobile checks emulate viewports/touch; they are not physical-device tests. The performance command expects `npm run preview -- --port 4173` to be running after a build. Full details and measured results are in [the engineering note](docs/engineering-note.md).

## What works

- Search, filter and sort all 20 runs; URL-backed filters and recoverable empty views.
- Run detail with loss, learning rate and gradient norm, precise viewport bounds, shared drag/keyboard zoom, linear/log scale, sampled-point inspection and accessible values.
- Real loading, worker failure/retry, unknown-run, invalid-range and empty-metric states.
- A Data quality view exposing non-finite values, missing steps, duplicate resolution, reordered measurements, spikes and divergence.
- Keyboard search (`⌘/Ctrl K`), chart keyboard inspection, native forms, responsive navigation and reduced-motion support.
- Browser-local bookmarks and CSV export of the **sampled viewport**, with blank fields for gap markers.
- Self-hosted fonts, cacheable hashed assets, static hosting configuration and CI.

## Data contract

This is explicitly a **synthetic workspace**. No training cluster, account, paid API, secrets or backend is needed. `Running` describes a static fixture, not a live job; reloading does not advance training. The UI does not claim to stop or mutate real runs.

Source training steps must be nonnegative safe integers. Unsupported source steps are rejected and counted; they are never rounded. Viewport bounds may be fractional. Steps are normalized numerically. The last received observation at a duplicate step wins, including when that value is invalid. Non-finite values and missing training steps break the line. Each pixel bucket retains first/last/minimum/maximum values independently for every metric; smoothing is never enabled. Hover inspects retained observations and does not claim to search all raw points. Logarithmic mode explicitly excludes and discloses nonpositive plotted samples.

Each response carries the immutable fixture revision and recording time, separately from the time this browser prepared the view. Old revisions, mismatched run IDs, malformed columns and inconsistent statistics fail closed. The worker retains the canonical typed arrays (32 MB for the million-point run), while the UI receives a small extrema-preserving viewport. A two-run LRU bounds worker retention; TanStack Query expires inactive viewport queries after 10 seconds. No custom cache-notification eviction runs during observer transitions. Pathological discontinuities may exceed the normal four-points-per-pixel budget rather than conceal missing data.

## Structure

```text
src/
  app/                 application shell and routes
  components/          shared status and error boundary
  features/
    runs/              run browser and field guide
    run-detail/        run orchestration and quality/details views
    charts/            uPlot adapter, precision, keyboard interaction
  domain/              typed contracts and tested normalization/sampling
  data/                deterministic source, engine, isolated worker client
  workers/             computation entry point
  shared/              explicit numeric/UTC formatting
  styles/              shared design tokens and responsive composition
  benchmark.ts         isolated before/after measurement fixture
scripts/               repeatable performance collection
tests/e2e/             browser-level scenarios
evidence/              actual test output, screenshots and performance traces
docs/                  design and engineering decisions
```

Rendering, data acquisition and pure transformations are separated. `loadRun` is the replaceable data boundary for a future real API. TanStack Query keys include run identity and viewport; AbortSignal plus worker request IDs prevent late replies from populating a different run. Worker timeout/crash invalidates the worker so retry can recover.

## Deployment

`npm run build` produces a static `dist/` with application and benchmark entries.

- **Vercel:** import the repository. `vercel.json` defines the build, immutable asset cache and security headers. No environment variables are required.
- **GitHub Pages:** enable Pages with GitHub Actions, then run **Deploy to GitHub Pages**. The supplied workflow verifies and builds before publishing. Relative asset paths and hash routes support `/repository-name/` hosting.

The benchmark page is a labeled engineering fixture, not an alternative product interface. It does not contact external services.

## Verification and evidence

The hardened candidate passes **71 unit tests** and **45 browser scenarios across three engines: 135 executions**, with zero skipped or flaky scenarios in the recorded run. The suite tests actual Canvas pixels, drawn axis labels and coordinates, deliberately reordered real Worker deliveries, unavailable/error recovery, source revisions, keyboard focus, viewport/touch/DPR adaptation, and optional browser storage failures.

- [Final types/lint/unit/build output](evidence/round2/checks-final.txt)
- [Final Chromium / Firefox / WebKit output](evidence/round2/e2e-final.txt)
- [Independent sampling oracle and correctness argument](docs/sampling-correctness.md)
- [Browser test methods and limits](tests/e2e/README.md)
- [Performance methodology and CPU-throttling scope](docs/performance-methodology.md)
- [Requirements and evidence matrix](docs/acceptance-matrix.md)
- [Two-page submission note](docs/submission-note.pdf)

Original failed tests and the original performance results remain in `evidence/`; the hardening round has separate files under `evidence/round2/`. Automated accessibility findings and manually examined incomplete checks are reported separately. CI configuration is provided; a local pass is not represented as an executed GitHub Actions pass.

## Evidence and delivery limits

The [engineering note](docs/engineering-note.md) gives the release verdict, test boundaries, measured performance, silent-failure checks and AI assistance disclosure. Local browser evidence is distinct from deployment, real-cluster integration and human acceptance. Failed runs of checks are retained rather than rewritten as passes.
