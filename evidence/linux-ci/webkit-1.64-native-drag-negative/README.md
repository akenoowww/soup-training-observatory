# Native WebKit input negative on Playwright 1.64.1

This single diagnostic uses the matching WebKit r2370 and unchanged production application. It is not a claimed passing test or a retried/hidden failure. The actual event attachment is extracted unchanged from its trace into `events.json`; raw trace, screenshot and error context remain in `artifacts/`.

The test first establishes the exact full domain in all three renderers, ready=true, busy=false, foreground document focus, a focused chart, actionable hover and stable fresh geometry. It then uses native Playwright mouse input. While the button is held, twelve trusted `mousemove` events target `.u-over` with `buttons=1` and changing `clientX` from 973 to 1079. Every event nevertheless reports `movementX=0` and `movementY=0`; selection width remains 0. The stronger check fails before mouseup because no visible selection was received. No event property or application state was modified.

The owning uPlot 1.6.32 source returns from its drag mouse handler when both movement deltas are zero. The observed toolkit input matches the official Playwright report [43417](https://github.com/microsoft/playwright/issues/43417), reproduced by its maintainers on affected WebKit builds; [43443](https://github.com/microsoft/playwright/pull/43443) provides the fix targeted at 1.65. This corroborates a test-driver limitation, rather than requiring a speculative production pointer adapter.

The earlier Linux CI fourth-run failure is preserved separately. Its trace records sent pointer coordinates and no resulting selection, but does not itself record movementX/Y. The detailed deltas above are observations of this local matching-driver diagnostic; they are not falsely presented as additional fields captured by the earlier Linux run.
