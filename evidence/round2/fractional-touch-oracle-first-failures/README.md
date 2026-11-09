# Incorrect integer-bound expectation in the strengthened touch test

This run passed132 cases and failed the same touch case in three engines. Its newly added generation-specific wait incorrectly expected integer-expanded bounds249999..750000. The toolbar's documented numeric viewport preserves the exact middle half of0..999999:249999.75..749999.25. The actual inputs already allow `step="any"`, all three charts displayed this same correct range, and the spike remained retained.

The test now derives the mathematical quarter and three-quarter boundaries directly from the known full domain instead of assuming toolbar zoom rounds like keyboard zoom. The exact rendered-domain and Home/value assertions were not removed. The original test failure, screenshots and traces remain here. No application change was made in response.
