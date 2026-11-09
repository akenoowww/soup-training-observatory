# Sampling contract, correctness argument, and independent checks

## Input and viewport contract

A training step is a nonnegative safe integer (`Number.isSafeInteger(step) && step >= 0`). Negative, fractional, non-finite and unsafe integer source steps are rejected and counted. They are not rounded into another observation. This domain follows the meaning of a training-step counter and avoids ambiguous JavaScript coordinates above the safe-integer limit. Viewport bounds may be fractional: a range between two recorded steps must not pull an outside observation into view.

For duplicate steps, the last received row owns all three metrics. Stable numeric sorting then determines plotting order. A newest invalid observation stays invalid; an older finite value is never substituted. Metric values can be zero or negative; non-finite metric values create gaps. Logarithmic exclusions belong to rendering and do not mutate the stored data.

The viewport includes source rows satisfying `min <= step <= max`. Its end is found by a true binary upper bound, rather than adding floating-point epsilon to the endpoint. Exact inclusion matters both for fractional view bounds and large supported step values.

## Immutable source and asynchronous boundary

Every response carries `SOURCE_SNAPSHOT`: kind `synthetic`, revision `soup-fixtures-v2`, recorded time `2026-11-09T18:00:00.000Z`. Browser preparation time remains a separate `fetchedAt`. Reload does not advance that source identity. Run starts are derived from the source recording time minus their deterministic end offset and duration, so a recorded duration never claims training after the known snapshot.

The client checks the expected source kind/revision/recorded time, run identity, aligned finite/null samples, range/domain and extrema/latest statistics. A stale revision, impossible timestamp or inconsistent response fails closed and replaces the worker. This prevents a stale/incompatible local fixture worker from masquerading as the current dataset. It does not certify freshness or completeness of a real training service; there is no real ingestion source in this exercise.

## What the reduction preserves

1. Restrict the canonical series to the requested numeric viewport.
2. Split it into finite segments at non-finite measurements and missing integer training steps.
3. Divide the viewport into numeric-step buckets using the supplied pixel budget.
4. Within each finite segment/bucket, retain its first, last, minimum and maximum observation; emit them in source-step order and eliminate repeated selections of the same row.
5. Emit an explicit null marker at invalid observations or inside an absent-step interval so the line renderer cannot connect separated finite segments.

For any nonempty finite segment/bucket, the minimum and maximum indices are selected by construction. Therefore its extrema and the complete viewport's global extrema are retained. In particular, a unique single-point divergence spike cannot disappear at any width or viewport containing that source step. This argument depends on normalization and exact viewport inclusion being correct; both have separate tests.

Every selected finite `(step, value)` pair is an existing canonical observation. No metric average, smoothing kernel or synthetic finite value is introduced. Null markers are explicitly synthetic gap coordinates, not measured values. Their coordinates must remain finite, strictly ordered and inside the gap. Viewport statistics are computed from all canonical rows in the viewport, not inferred from the compressed line.

## Independent adversarial checks

`src/domain/series.property.test.ts` uses a test-only reference based on a last-arrival Map and fully materialized collections. It deliberately does not use the production typed-column ordering, binary bounds or streaming extrema state.

- **128 reproducible malformed arrival streams:** shuffled duplicate steps and invalid source coordinates; compare exact canonical values for all three metrics and duplicate counts.
- **192 reproducible datasets x 2 viewports x 3 metrics = 1,152 checks:** source identity, exact statistics, strict coordinate order, bucket/segment first-last-min-max retention, and no finite segment crossing invalid data or absent steps. Source positions include ordinary steps, million-scale steps, and values near `Number.MAX_SAFE_INTEGER`; fractional viewport boundaries are included.
- **105 fixed outlier/boundary combinations:** multiple positive/negative outliers, ranges exactly on observations, single-point ranges and bucket-edge placements over seven widths and all metrics.
- **Directed regressions:** exact upper endpoint inclusion, rejection/counting of unsupported source steps, and a distinct finite null marker near the maximum supported step.

The ordinary regression suite separately executes the actual million-point fixture across six widths and six ranges, including a single-point spike viewport. The browser suite is a separate layer: algebraic retention alone does not establish that Canvas actually paints a visible spike or break.

## Failures found before the fixes

Original output is retained at `evidence/round2/data-oracle-first-failure.txt`. Under the earlier unrestricted finite-step contract:

- an inclusive endpoint at `0.1` incorrectly included a neighbouring step at `0.10000000000000003` because epsilon expanded the viewport;
- an absent-step midpoint between `1e308` and `1.1e308` overflowed to Infinity.

The supported-domain rerun at `evidence/round2/data-oracle-contract-first-run.txt` also exposed incorrect inclusion near the safe-integer limit, so rejecting unsupported source coordinates alone did not fix viewport correctness. The exact upper-bound correction is necessary. The source contract is now explicit and unsupported steps are counted rather than silently interpreted.

## Limits of this evidence

These are deterministic adversarial tests plus a correctness argument, not a formal machine-checked proof over all floating-point states. They do not prove scientific validity, source freshness, browser behavior, perceptual clarity or real-cluster integration.

The line connects retained finite observations within each valid segment. This compresses intermediate timing and shape: it preserves extrema, not every local oscillation or every smaller peak sharing a bucket with a larger peak. The single-outlier guarantee is stronger than the guarantee for arbitrary many dense outliers. A one-point gap can be less than one physical pixel at an overview scale; visible missingness counts and zoom remain necessary.

The usual output bound is at most four retained finite observations per pixel bucket for a continuous series. Many discontinuities deliberately add segment boundaries and null markers rather than concealing gaps, so an adversarial alternating finite/invalid series can exceed that budget. The application must disclose or reject unsupported render workloads instead of calling them bounded merely because the ordinary fixture is small.

Executed after the source-step and exact-upper-bound fixes: all six adversarial property tests passed in the scoped Vitest run (`evidence/round2/data-oracle-final.txt`, 10 November 2026). Full TypeScript compilation also passed during this check. The earlier failing outputs remain unchanged; the passing result does not erase the original counterexamples or establish browser rendering.

The final data/domain run passed 46 scoped tests. Source-contract tests exercise stale-revision rejection, source chronology, and advancing preparation time without changing the recorded snapshot. Original failures are retained at `evidence/round2/source-contract-first-failure.txt` and `source-contract-integration-failure.txt`; final output is `evidence/round2/data-final.txt`.
