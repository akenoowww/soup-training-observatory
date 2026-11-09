# Initial Linux CI result:133/135 passed

Public repository CI run42703340902 passed133 engine/scenario cases and failed two WebKit cases. The original job log, screenshots, error contexts and trace ZIPs are preserved here. `trace-observations.json` extracts relevant original events without modifying the ZIPs.

## Keyboard shortcut startup precondition

The original test called Control+K immediately after `page.goto`, without observing a painted interactive application. Its trace already contains the run-list DOM before the key, so it would be inaccurate to claim React was definitely unmounted. The trace does not observe installation of the app's passive-effect keyboard listener; no dialog appeared after the key.

The corrected test waits for the visible run-list heading, enabled public Search control,20 rendered rows and two actual animation-frame rendering turns before keyboard input. This is a normal application-readiness precondition, without a production debug hook, arbitrary sleep, retry or increased timeout. The shortcut, keyboard result selection and exact chart Home/End assertions remain exercised.

## Recovery control disappeared after genuine recovery

The worker trace shows the intended aborted module request, an error heading at142898ms, then a successful worker HTTP200 fetch at142937ms after the fault was lifted. At143093ms, Playwright records the error-body Try again element detaching; the final image contains normal real charts. The trace directly establishes successful module recovery before the conditional body-button click completed. Measured-width query transitions are a source-level explanation for a legitimate subsequent request; the trace does not record a specific900-to1000 width payload.

The corrected test uses the persistent public Reload snapshot control after removing the network fault. That control is available in error, loading and successful states, while the conditional error-body button can legitimately disappear when a real query has already recovered. It then verifies all three actual full-range renderer bounds,1M source observations, max9.4 and actual painted spike pixels. Controlled malformed-source/range-failure scenarios separately retain their Try again checks.

No application code or production bundle was changed for these harness corrections. Local repeated checks and a new actual Linux CI run are recorded separately; a local pass alone is not represented as a Linux pass.
