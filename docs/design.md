# SOUP training observatory: design decisions

The primary object is a training run. The interface helps an engineer inspect whether a loss curve is diverging, then check learning rate, gradient norm and missing observations before making a decision elsewhere. It does not invent a training-control backend or a recommendation to stop a real run.

## Screen and state contract

| Surface | Representation and ownership | Required behavior |
| --- | --- | --- |
| Application shell | Compact brand and workspace rail; actual destinations only | Training runs, run detail and data guide remain reachable; active destination has text and a visible marker |
| Run browser | Search/filter toolbar and aligned table | Twenty deterministic runs; sort numeric fields numerically, search name/model/dataset, filter status; clear filters recovers an empty result |
| Run detail identity | Breadcrumb, run name, labeled status, metadata | Switching runs immediately changes identity; previous-run values cannot appear under the new name |
| Run summary | Latest loss, recorded step, elapsed duration and data issues | Step and duration summaries describe the complete run; latest loss explicitly follows the selected range. Unknown/non-finite latest values remain unavailable, never zero |
| Primary evidence | Large loss line chart | Unsmooth line, visible extrema, honest gaps, numeric step axis; zoom or explicit step bounds; keyboard alternative |
| Supporting evidence | Learning rate and gradient norm charts | Same step viewport; distinct labeled colors; truthful log-scale treatment |
| Data integrity | Concise issue count and expandable issue descriptions | Explain non-finite observations, duplicates, ordering and missing steps at the point of chart interpretation |
| Data guide | Short data-treatment explanation | Explain extrema selection, sample hover, duplicate policy, gaps, log zeros and synthetic source |
| Loading | Reserved chart geometry and plain progress text | No stale chart labeled as the newly selected run |
| Error | Human explanation, retry and back navigation | Failure must not substitute a healthy demo run or blank zero-valued chart |
| Empty | Explicit no-matching-runs message | Preserve filters and provide a clear-filters action |

The first viewport prioritizes identity, four summaries and loss. Learning rate and gradient norm continue below it. Data interpretation remains discoverable beside the plots. Equal weight for all three charts was rejected because the decision in the brief starts with loss divergence; auxiliary metrics explain rather than displace that evidence.

## Visual foundations

The selected relationship is a quiet instrumentation shell surrounding a high-attention loss plot. Persistent context is compact; plots get most horizontal space. There are no decorative gradients, stock images, floating promotional cards or unimplemented navigation items.

Colors use the Frontend Workbench bundled, verified Refactoring UI public scale subset. Local ordinal IDs below are not official publisher shade names.

| Role | Exact value | Catalog entry |
| --- | --- | --- |
| Canvas and shell | `#102A43` | blue-grey.01 |
| Panel | `#243B53` | blue-grey.02 |
| Borders and plot grid | `#334E68` | blue-grey.03 |
| Main text | `#F0F4F8` | blue-grey.10 |
| Secondary text | `#BCCCDC` | blue-grey.08 |
| Muted labels | `#9FB3C8` | blue-grey.07 |
| Loss, primary emphasis | `#65D6AD` | teal.07 |
| Learning rate | `#62B0E8` | blue.07 |
| Gradient norm | `#CFBCF2` | purple.09 |
| Warning | `#F7C948` | yellow-vivid.06 |
| Error | `#F29B9B` | red.08 |

Calculated contrast on the panel is 7.02:1 for secondary text, 5.34:1 for muted labels, 6.45:1 for loss, 7.34:1 for warning and 6.64:1 for gradient norm. These are token-pair calculations, not an accessibility conformance claim.

Use a system sans-serif stack for labels and headings; tabular numerals and monospace for precise metrics. Starting scale: 12px captions, 14px controls/body, 18px section titles, 28px page title and 30px summary values. Use a 4px spacing base, 16–24px section gaps, 32px desktop content padding, 8px panel radius and 36–40px controls. The desktop rail is approximately 224px; below tablet width it yields to compact navigation. Narrow screens stack summaries and charts, preserve readable labels and use an explicit horizontally scrollable table rather than silently removing columns.

## Copy and interaction rules

- Show **Demo workspace** or equally direct synthetic-data wording. A fixture's `Running` status is a recorded scenario, not evidence of an active training process or live feed.
- Keep step position numeric and locale-independent in exact inputs. Display locale and date-time zone explicitly where start times could be ambiguous.
- Hover describes a **Sampled step** and its recorded value. It does not imply that every raw point was searched or that the cursor's exact x-coordinate was observed.
- Use **Data issues** rather than **Unhealthy**. A finite latest loss cannot establish that an entire run is safe; a low final value can follow a large spike.
- Name all icon buttons. Native controls and visible focus cover search, filters, sorting, zoom, scale changes, reset and recovery. Color is supplementary to names/status text.
- No smoothing is enabled. Log scale must visibly disclose any non-positive observations it cannot represent and retain a linear alternative.
- A decorative sparkline is still a data claim. Run-list microcharts must derive from that run's actual observations; otherwise omit them. Status must never select a fabricated trend shape.

An independent review before handoff challenged run identity, latest-value scope, snapshot wording, logarithmic exclusions and mobile priority. The resulting requirements above keep cross-run loading atomic, distinguish `Latest in view`, reject backfilling a non-finite latest observation and put issues/loss ahead of auxiliary detail on narrow screens. This review checked proposal and source; it did not observe browser behavior.

## Evidence and limits

Research checked 10 November 2026. Official UI evidence informs task semantics, not imported styling:

- [MLflow Tracking](https://www.mlflow.org/docs/latest/ml/tracking/): inspected the official linked chart screenshot (`tracking-metrics-ui-temp-ffc0da57b388076730e20207dbd7f9c4.png`, displayed version 2.8.0, capture date unknown). Directly visible: named metric, step axis, latest/min/max table, scale controls. No live MLflow interaction was tested.
- [W&B point aggregation](https://docs.coreweave.com/products/wandb/app/features/panels/line-plot/sampling): read current official documentation and inspected its shaded-extrema chart image. Documented behavior: dynamic buckets, preserved extrema, viewport recomputation. This does not prove our sampler or rendering; their tests and browser evidence are separate.
- [Awwwards: Algorithmic Trading Dashboard layout](https://www.awwwards.com/inspiration/dashboard-layout-algorithmic-trading-dashboard): inspected the actual gallery image, capture date unknown. Permitted adaptation: compact navigation, restrained dark panels, primary evidence followed by subordinate data. It supplies no colors, training semantics, accessibility or performance evidence.
- [Awwwards: Traced UI element](https://www.awwwards.com/inspiration/ui-element-traced): inspected and rejected as a layout reference because its large editorial sections and imagery would displace dense training evidence.

Research captures are retained under `.frontend-workbench/research/` and are not product assets. Design decisions are proposals until checked against the implemented screens. Test passes, browser checks, performance measurements and user acceptance remain separate evidence.

## Implemented-screen review

Inspected `evidence/screenshots/run-desktop-full.png` and `run-mobile.png`, together with current run-detail, run-list, guide and chart source. The desktop keeps the selected shell, metrics hierarchy, labeled axes, large visible single-point spike and subordinate charts. The narrow composition preserves the same content in a readable stack without squeezing three plots into one row. Synthetic-data wording, UTC timestamps and unsmoothed sample semantics remain visible; fabricated run-list sparklines have been removed.

The inspected mobile capture contains an active `Updating range…` state after resize, and the desktop capture predates the latest entries/unique-observation wording. These images prove those captured states only; settled gallery evidence must be recaptured after loading ends. A count labeled `Data observations` counts finding categories, so `Quality findings` is the recommended label. This is an independent visual/source review, not a fresh execution of tests, accessibility tooling or deployment verification.

Final owner review after that independent review: refreshed the production desktop/mobile images after data-ready and no updating overlay, then inspected both. The current images show settled charts, `Quality findings`, and entries/unique-observation wording. Actual browser checks and their outputs are retained separately in `evidence/`; no user acceptance or publication is implied.
