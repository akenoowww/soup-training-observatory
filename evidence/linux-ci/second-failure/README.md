# Second Linux CI result:133/135 passed, different failures

The next actual Linux run did not reproduce the same pair of failures. It passed133 cases and failed:

1. Firefox's loaded-chart accessibility evaluation reported `frame.evaluate: Page crashed`. The original context and trace are preserved here. This is an observed browser-process failure, not a diagnosed application memory leak or proven OOM. The next functional CI run uses one worker to bound shared-runner resource contention; its result must be evaluated separately, without retrying away this failure or claiming its cause is known.
2. The WebKit sort test selected lowest-loss ordering and immediately read the old name-sorted rows using `allTextContents`. That snapshot was taken before React's route-driven table update committed. The corrected assertion waits for the requested sort URL and polls the actual20 populated finite values until their order is numeric ascending. It does not increase timeouts, change sorting code or accept fewer rows.

The first CI run's keyboard/recovery failures remain in the separate initial-failure directory. Local targeted passes are not labeled as successful Linux execution. The final serialized Linux workflow result is recorded separately after its actual completion.
