# Scoped manual review of mobile-navigation contrast

The automated scans retain their original `incomplete` color-contrast findings. No axe rule was disabled, and an incomplete finding is not relabeled as an automatic pass.

On the captured production build, the 390 x844 native navigation dialog was opened independently in Chromium, Firefox and WebKit. The three viewport PNGs were visually inspected: menu text is visible on the opaque drawer, with the native backdrop outside it. Firefox/WebKit display a dim backdrop while Chromium also renders blur; the drawer remains readable in each captured instance.

For every flagged text node (10 Chromium,11 Firefox,10 WebKit), the review recorded actual computed foreground, nearest opaque ancestor background, ancestor opacity/filter, rectangle and center `elementFromPoint` ownership. All centers belonged to the intended text element or its child; all inspected ancestors were opaque and unfiltered. Calculated normal-text contrast ranges from **5.270:1** to **13.248:1**, above4.5:1. The minimum is the20-run count on its raised background. Detailed values and source script hashes are retained in `all-engines-mobile-navigation-contrast.json`.

This corroborates the contrast of those text/background pairs in these captured states. Nearest-background calculation and a center hit test do not establish every glyph pixel, every possible overlapping location, all device layouts or assistive-technology usability. It is not a full accessibility conformance claim.

The earlier Chromium full-page capture is retained separately. Native backdrop is viewport-bound, so that full-page image must not be read as showing a backdrop over below-the-viewport content.

Final refresh: `all-engines-mobile-navigation-contrast.json` and the three engine-prefixed viewport PNGs were refreshed after the final135/135 browser matrix, against bundle `app-DsJyw_oe.js`. Earlier Chromium-only `mobile-navigation-computed.json`, `mobile-navigation-contrast.json` and `mobile-navigation.png` remain historical evidence; use the all-engines record for final-build identity.
