Initial production E2E run: 10 passed, 1 failed (mobile document horizontal overflow).
At a 390px viewport, document.scrollWidth was 808px. The visible UI looked contained,
but an absolutely positioned screen-reader-only table header escaped its scroll
container because no positioned ancestor established its containing block.
Root cause was inspected using element bounds, not inferred from the screenshot.
The app fix positions the table scroll container; the final rerun is recorded
separately in evidence/e2e-results.json. These failed artifacts are retained.
