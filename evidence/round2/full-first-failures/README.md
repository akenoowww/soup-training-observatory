# First complete three-engine matrix:124 passed,8 failed

The initial132 executions included44 scenarios in Chromium, Firefox and WebKit. Every original failed result/trace is preserved in this directory; the aggregate output remains `../e2e-full-first.txt`.

Failures were investigated individually:

- Two genuine rendering/readability failures: all-zero linear intervals used uPlot's default `[0,100]` range. Chromium/Firefox clipping placed the zero curve outside the scanned visible plot; WebKit happened to paint the boundary. The fix gives constant data an explicit finite range with the real measured value inside, rather than inventing a positive value or changing the input.
- One genuine modal recovery failure in WebKit: pointer-clicking a button on macOS does not necessarily focus it, so remembering only `document.activeElement` restored BODY rather than the actual opener. The UI now retains/focuses the explicit opener.
- Three test-setup failures: the source-freshness test used a shared helper that required a visible chart, although its route deliberately opened the Run details tab. The test now waits for the intended ready details panel.
- Two platform-assumption failures: WebKit's default macOS Tab preference skips links/buttons. A direct diagnostic confirmed Option+Tab focuses the skip link and then Open navigation. The mobile keyboard test now uses that native traversal for WebKit; it does not simulate success with `.focus()` or drop the reachability assertion.

These changes distinguish application defects from a faulty test oracle. A later pass must not be interpreted as the initial132 checks having passed.
