# Shared generation waits and malformed-source controller audit

This run passed133 of135 engine/scenario cases. The two Chromium failures exposed remaining weaknesses in the test harness, which were audited across the suite rather than patched only at those assertions.

- Dragging changed the requested URL, but the test immediately read start/end inputs from the preceding committed full view (`from=0`). The renderer was not shown to be wrong. The test now extracts the requested bounds from the changed URL, waits for those same bounds in all three actual uPlot renderers and inputs, then verifies values and reset. The same generation-specific helper is shared by all viewport-changing scenarios.
- The malformed-identity test poisoned only a worker construction and cleared its flag. That did not maintain a broken-source condition across a legitimate replacement worker or initial width/query transition. The test now warms a real run, poisons every native reply during explicit reload, asserts that a mutated native packet was actually delivered, observes fail-closed UI, and only then disables poisoning before a genuine retry. Native worker generation and response delivery remain real; the intentional packet mutation is the adversarial input.

No production changes, increased timeouts, automatic retries or removed Home/value assertions were used to resolve these cases. Targeted repeated execution and the subsequent complete matrix are recorded separately. Original output, JSON and traces remain unchanged here.
