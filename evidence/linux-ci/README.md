# Linux CI chronology

These are actual GitHub-hosted runs of the public repository. Original failures remain available; a local macOS result is not substituted for a Linux result.

- [Initial run 42703340902](https://github.com/akenoowww/soup-training-observatory/actions/runs/42703340902), commit `6925b92`: build/unit checks passed, browser suite reported 133 passed / 2 failed. WebKit keyboard input had no painted-interactive readiness precondition. The cold-worker recovery test lifted the network fault and then targeted a conditional body button that disappeared after a genuine subsequent worker load. The trace proves the visible successful data state; it does not prove React was unmounted at the initial shortcut.
- [Node24-action run 42703898004](https://github.com/akenoowww/soup-training-observatory/actions/runs/42703898004), commit `f4f6df5`: 133 passed / 2 failed, with different failures. Firefox's renderer crashed during axe; the cause was not isolated and is not asserted to be an OOM. A WebKit sort check read the previous DOM order immediately after a deferred navigation update.
- Portability checks now wait for visible interactive state and real rendering turns; sorting polls for all 20 finite, populated, ascending values; worker recovery uses a persistent public Reload snapshot action. The exact pixel/value/source assertions remain. Targeted macOS repetitions passed 30/30 for readiness/recovery and 15/15 for sorting; no test retries or larger per-test timeouts were introduced.
- The final Linux configuration uses a pinned Ubuntu 24.04 image, one functional-test worker and zero retries, following Playwright's reproducibility guidance. This isolates the shared runner's resources; it does not prove the earlier Firefox crash's root cause. All 45 scenarios still run in Chromium, Firefox and WebKit.

The then-current isolated run was [42706441083](https://github.com/akenoowww/soup-training-observatory/actions/runs/42706441083), commit `665c6e2`. Its machine-readable report and completed status are added only after the observed run finishes. The production application bundle remains `app-DsJyw_oe.js`; test-harness changes did not alter it.

## Isolated failure and upstream browser regression

Run [42706441083](https://github.com/akenoowww/soup-training-observatory/actions/runs/42706441083), commit `665c6e2`, completed **134 passed / 1 failed** with one worker on Ubuntu 24.04. The only failure was Firefox's loaded-chart axe scan. This disproves the earlier assumption that concurrency isolation alone would resolve the failure. Its JSON and traces are preserved.

The installed axe version is 4.14.0, not the lower bound of the package range. [Playwright #43967](https://github.com/microsoft/playwright/issues/43967) documents the exact locator/main-world ARIA interaction and a Firefox content-process crash in Playwright 1.65.0; the issue explicitly names 1.64.1 as last good. The next driver version is pinned to that published stable release, with all tests and accessibility rules retained. Its outcome is recorded separately after the full CI run.

## Final accepted Linux result

[Workflow 42712785795](https://github.com/akenoowww/soup-training-observatory/actions/runs/42712785795), code commit `76fd9d6`, completed successfully in all three isolated jobs. The identical45 scenario titles ran in each engine:135 passed overall,0unexpected/skipped/flaky,0retries. Actual driver graphs and full per-engine JSON are under `final/`; the aggregate is `final/summary.json`. Every configured axe rule and every application ARIA label remained enabled.

## Reproduce the isolated Linux profiles

The shared application is the same in every job. Use a disposable checkout for the Firefox tooling compatibility profile, as CI does; it keeps alternate SDK/core versions out of the ordinary working installation. Node24 and an available localhost4173 are required.

Canonical Chromium/WebKit profile:

```sh
npm ci
npm run check
npx playwright install --with-deps chromium webkit
npx playwright test --project=chromium --project=webkit
```

Firefox profile in a fresh checkout:

```sh
git clone https://github.com/akenoowww/soup-training-observatory.git /tmp/soup-firefox-qa
cd /tmp/soup-firefox-qa
npm ci
npm pkg set 'devDependencies.@playwright/test=1.64.1' 'overrides.playwright-core=1.64.1'
npm install --ignore-scripts --no-audit
npm run check
npx playwright install --with-deps firefox
npx playwright test --project=firefox
```

These run the same authored tests. The compatibility split addresses the two documented browser-automation regressions; it does not replace real input with scripted data changes or disable accessibility rules.
