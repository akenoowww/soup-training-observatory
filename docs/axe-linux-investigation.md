# Linux Firefox accessibility-scan investigation

This note records an unresolved release-check failure and the evidence used to choose a discriminating next experiment. It does not relabel a browser crash as a passing accessibility audit.

## Local evidence inspected

The retained `evidence/linux-ci/third-run-results.json` identifies GitHub Actions run `42706441083` on the pinned Ubuntu 24.04 setup with one worker: 134 passed, one unexpected failure, no skipped/flaky tests. The failing scenario is Firefox's loaded numeric-chart accessibility audit, before the expanded inspector audit. Its stack enters `AxeBuilder.runPartialRecursive` at the initial frame evaluation. Other functional/Canvas checks passing, and prior macOS scans passing, narrow the observed condition but do not by themselves prove a tooling defect.

The declared dependency range is not the executed version. The current lockfile and installed public package metadata resolve **@axe-core/playwright 4.14.0, axe-core 4.14.0 and Playwright 1.65.0**. Browser metadata for Playwright 1.65.0 names Firefox 159.0, revision 1572.

## Source-level distinction between default and legacy execution

Inspected `node_modules/@axe-core/playwright/dist/index.mjs`:

- `analyze()` injects axe, then normally calls `runPartialRecursive(page.mainFrame(), context)`.
- The first evaluation in that function calls `axe.utils.getFrameContexts(context)`, before `axe.runPartial` and well before `finishRun` creates a separate blank page.
- `setLegacyMode(true)` is an actual public API. It routes to `runLegacy`, which injects axe and calls the ordinary `axe.run(context, options)` in the existing page. The same `withTags` options remain active; no rules need to be disabled.
- Legacy mode excludes cross-origin frame coverage. The documented integration warns that this is a last-resort compatibility path, and its error-handling document says it will be removed in the next major version.

Therefore it is incorrect to attribute this stack to the separate blank aggregation page. Legacy mode changes more than that final page, so a controlled comparison can still be useful. It may not avoid a defect shared by both modes' main-world DOM reads.

Official API references: [integration README](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md#axebuildersetlegacymodelegacymode-boolean--true), [error handling](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/error-handling.md).

## Relevant primary upstream evidence

[Playwright issue 43967](https://github.com/microsoft/playwright/issues/43967) describes a closely matching regression: Playwright 1.65.0 / Firefox 159 can crash when `ariaLabelledByElements` is read in both the main and isolated worlds. The reporter explicitly encountered a named role/label locator followed by an `@axe-core/playwright` scan. A later comment identifies axe-core 4.14.0 reads in `aria-prohibited-attr` and `hidden-content` as triggers.

The Playwright automation bot reproduced the two-world property-read crash on Ubuntu 24.04.5 and Firefox 159, with Chromium/WebKit controls passing, and reported a signal-11 content-process exit. The maintainer closed the issue on 9 November 2026 with a statement that the next Firefox roll should contain the fix. This confirms that an upstream defect exists; it does not establish that every SOUP crash has that cause.

The [latest published Playwright release](https://github.com/microsoft/playwright/releases/latest) still resolves to 1.65.0 when checked. The [1.64.1 browser manifest](https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-core/browsers.json) uses Firefox 157, while [1.65.0](https://github.com/microsoft/playwright/blob/v1.65.0/packages/playwright-core/browsers.json) uses Firefox 159. The issue's last-good version is 1.64.1, but it also notes that Firefox 157 can be made to fail with a custom two-world reader. A version rollback must therefore be verified, not assumed to cure all manifestations.

## Minimal discriminating experiment

Keep Ubuntu, one worker, application build, selected WCAG tags and browser settings fixed. Give every attempt a fresh browser context/page, since a crash poisons the previous page.

1. Execute the exact loaded-run audit once using the default integration and once with `.setLegacyMode(true)`. Assert that the page has no iframe elements and only its main frame before using the bounded legacy comparison. Retain failures and complete result JSON; do not turn a crash into an empty violations list.
2. Reproduce the upstream two-world control on a minimal page: a span with an ID and a button referring to it via `aria-labelledby`; read `button.ariaLabelledByElements` in `page.evaluate`, then resolve a named role locator. Use separate fresh pages for the documented same-world/no-reference controls if the two-world case crashes.
3. If both full audit modes crash, changing aggregation mode is insufficient evidence. Prefer a verified fixed Firefox roll, or pin the last-good published Playwright release and reinstall its matching browsers, then rerun the full matrix. Do not remove valid application ARIA, disable accessibility rules or skip Firefox merely to make the summary green.

A legacy result can be acceptable for this iframe-free page if it executes the same complete tag-selected rule set and returns preserved findings, with its execution mode and cross-origin-frame limitation explicit. It remains a compatibility workaround, not an identified root cause until the controls support the mechanism. No application/test source was changed by this investigation.

## Selected release-tooling experiment

The application, ARIA attributes and all WCAG rules remain unchanged. The published Playwright driver is pinned to **1.64.1**, the upstream issue's explicit last-good version, instead of disabling ARIA rules or introducing an application workaround. The public npm latest was still 1.65.0 when checked on 10 November 2026.

The isolated SOUP run under 1.65.0, pinned Ubuntu 24.04 and one worker passed 134 of 135 cases; only Firefox's first loaded-chart axe analysis crashed in `runPartialRecursive`. Its actual report is retained at `evidence/linux-ci/third-run-results.json`. The next complete Linux run with matching 1.64.1 browsers is the discriminating application experiment. Until that run finishes, no claim that this pin resolves the SOUP crash is made. The exact lower-level Firefox trigger is supported by the upstream minimal reproduction; the classification for SOUP remains an evidence-based inference.

## Observed pinned-driver result

The complete application experiment on Playwright 1.64.1 completed **134 passed / 1 failed** in Linux CI run `42708679021`. Every Firefox case, including the formerly crashing full axe scan, passed. The remaining failure was a WebKit drag gesture, not axe/Firefox. All WCAG rules and application ARIA attributes remained unchanged, and the production JavaScript SHA256 remained identical. This corroborates the selected driver-version workaround for the observed Firefox failure; it does not claim to fix Firefox itself. The raw result is `evidence/linux-ci/fourth-run-results.json`.

## Isolated stable SDKs per browser

A single older SDK is not sufficient: [Playwright #43417](https://github.com/microsoft/playwright/issues/43417) documents zero `movementX`/`movementY` for WebKit's synthesized mouse movement in 1.64.1; the fix was released with 1.65.0. uPlot's installed mouse handler ignores zero-delta events during a drag. This matches the remaining WebKit diagnostic target, and passive event data is retained rather than rewriting browser events.

The selected CI design isolates **Chromium/WebKit on 1.65.0 and Firefox on 1.64.1** in separate job checkouts. Each process has exactly one matching `@playwright/test`, `playwright`, and `playwright-core`; no Page objects cross SDKs. The Firefox job changes only public dev-tool manifests in its disposable checkout, runs the same typecheck/build and all 45 Firefox scenarios, then exports its actual dependency graph. The other jobs run all 45 scenarios each on the canonical current SDK. All axe rules and application ARIA remain enabled. The overall workflow is green only if all three jobs succeed.
