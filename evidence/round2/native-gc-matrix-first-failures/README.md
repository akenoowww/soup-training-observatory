# First135-case matrix after replacing custom query eviction

The first run passed133 cases and failed two Chromium keyboard-inspection cases. The new20-distinct-viewport regression passed in every engine with exactly20 native requests; this matrix did not show a renewed query-eviction loop.

The two failures were investigated using the original DPR2 trace before changing application code. `keyboard-generation-analysis.json` extracts the relevant original frame snapshots:

1. After Inspect spike and chart focus, the still-committed full view reported ready=true and actual x0..999999.
2. Home inspected that old view: the trace contains the aria-live announcement `Sampled step0:2.84` while the requested zoom begins updating.
3. The actual490000..510000 response then replaced the series and cleared the old inspection state, as designed.

The old test waited for a generic ready marker and max9.4, both of which were also true for the preceding full view. It therefore did not establish that the requested generation had committed before pressing Home. This evidence did not justify a speculative pointer/keyboard production mechanism.

The corrected tests wait for the exact requested start/end inputs and all three uPlot-derived rendered bounds, then the ready marker. Home/End value assertions remain unchanged. Each of the two Chromium cases was then executed ten times on the same unchanged production bundle:20/20 passed, recorded separately in `../keyboard-generation-recheck.txt` and JSON. The final complete three-engine matrix is recorded separately; the original failures and trace were not edited or removed.
