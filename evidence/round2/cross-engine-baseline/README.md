# Initial Firefox/WebKit baseline

Thirty-one of32 scenarios passed against the prior production build. All16 Firefox scenarios passed, including independent Canvas gap/axis checks. One WebKit keyboard-search scenario failed: Tab traversal escaped the custom modal instead of reaching the result button. The root UI fix uses native modal containment with explicit eligible-control Tab traversal. Initial output and failure trace are retained.

These engines ran locally through Playwright. They are not physical phone testing or Safari release certification.
