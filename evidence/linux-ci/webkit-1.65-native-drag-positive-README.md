# Positive native WebKit drag observations

Ten executions passed using the internally aligned Playwright1.65.0 and matching WebKit r2388 on macOS. One worker was selected, with no retries, skipped cases or timeout changes. This local result is separate from the subsequent complete Linux CI matrix.

Every execution recorded twelve trusted held-button mousemoves with changing absolute positions and nonzero relative movement. Before native mouseup, the actual visible selection measured115px while the source view remained ready, unbusy and focused. After release, all three real renderer domains matched the selected range, the spike remained9.4, and native double-click restored the full domain.

The raw unique JSON report contains the full passive event attachments. `webkit-1.65-native-drag-positive-summary.json` derives the above counts and per-execution timestamps directly from those attachments. The canonical earlier full135-case Mac report was not overwritten.

The matching1.64.1 negative is retained separately with its zero relative movements and absent selection. Official Playwright issue43417 and fix43443 corroborate the driver-version distinction. No production code, synthetic event property, forced DOM interaction, range setter or disabled assertion was used to obtain the positive result.
