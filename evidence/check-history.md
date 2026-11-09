# Check history and failures retained

These are work-session observations, not a fabricated successful test run.

- Dependency installation initially could not resolve registry.npmjs.org in the restricted network. Retried through permitted network access and installation succeeded.
- First TypeScript check failed at MetricChart.tsx:75: uPlot MouseListener expected a handler returning null, but the double-click handler returned void. Corrected return; final TypeScript check passed.
- First lint reported two unused ErrorBoundary callback arguments. Removed the empty callback; final lint passed.
- npm initially reported 7 moderate findings through the dev-tool minimatch graph. Applied the 11.0.1+ override, checked the actual installed graph, and reran lint/build/tests; audit then reported zero findings. No production vulnerability was concealed.
- Independent data checks exposed incorrect issue counts, duplicate-removal being counted as reordering, and planned-step/model metadata mismatches. Corrected and rechecked all 20 runs before final tests.
- First desktop axe audit reported a 3.39:1 footer version contrast ratio due to opacity. Removed the opacity; repeated desktop/mobile audit reported zero violations. Other automatic audit limits remain applicable.
- First browser suite:10 passed,1 failed. The390px run-browser document expanded to808px because an absolutely positioned screen-reader label escaped the scroll container. Fixed by positioning the table scroll container, retaining native table overflow. Original results, screenshot and trace are preserved in e2e-first-run/.
- Final browser suite:13 passed. Added missing-only and real delayed-worker loading scenarios rather than weakening the failed assertion. Final output is e2e-results.json.
- Performance optimization improved first render and memory but **regressed zoom latency**. Both results, all three repetitions and original Chrome traces are retained in performance/. Hover is approximately unchanged. Measurements are scoped in results.json.
