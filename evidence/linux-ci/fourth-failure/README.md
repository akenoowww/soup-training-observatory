# Fourth Linux CI:134/135 passed

Playwright 1.64.1 completed all 45 Firefox cases, including full accessibility rules. The remaining WebKit drag case sent down/move/up commands over the plotted surface but never changed the URL. Its original error context, screenshot, trace and aggregate JSON are preserved here.

The trace explicitly shows all three renderers at 0..999999, ready=true and busy=false before the gesture. It does not justify calling loading the cause. The final cursor remains near the starting 35% position, and no selection-width change is observed. Command logs alone do not establish which native movement properties the application received.

A separate matching-driver diagnostic adds passive event observations and requires visible selection before release; its negative result is preserved in `../webkit-1.64-native-drag-negative/`. The selected release approach isolates internally aligned SDK/browser versions per CI job to avoid the independently documented test-tool regressions. It does not patch events, bypass DOM interaction, skip this scenario or change application code.
