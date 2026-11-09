# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> reloading prepares a new view while keeping the recorded synthetic source time and revision distinct
- Location: tests/e2e/adversarial.spec.ts:481:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('chart-loss')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('chart-loss') with timeout 10000ms
  - waiting for getByTestId('chart-loss')

```

```yaml
- link "Skip to content":
  - /url: "#main"
- complementary "Workspace":
  - link "Soup home":
    - /url: "#/"
    - text: soup.
  - text: O
  - strong: Observatory
  - text: Demo workspace
  - button "Find a run ⌘ K":
    - img
    - text: Find a run ⌘ K
  - paragraph: WORKSPACE
  - navigation "Main navigation":
    - link "Training runs 20":
      - /url: "#/"
      - img
      - text: Training runs 20
    - link "Field guide":
      - /url: "#/guide"
      - img
      - text: Field guide
      - img
  - text: PROJECT Foundation models 20 experiments · 3 metrics
  - img
  - strong: A little room to experiment.
  - paragraph: Explore synthetic runs. Your production training is untouched.
  - text: SC
  - strong: Soup collective
  - text: Research workspace
- banner:
  - text: Foundation models / Training runs Synthetic data
  - button "Search runs":
    - img
  - text: SC
- main:
  - link "Training runs":
    - /url: "#/"
  - img
  - text: run-009
  - button "Previous run":
    - img
  - text: 9 / 20
  - button "Next run":
    - img
  - heading "whisper-small-en" [level=1]
  - text: Completed Whisper LibriSpeech Nov 9, 05:32 UTC
  - button "Save run":
    - img
  - button "Export view":
    - img
    - text: Export view
  - button "Reload snapshot":
    - img
    - text: Reload snapshot
  - text: baseline
  - img
  - text: 21.6K source points Latest loss
  - img
  - text: 0.3532 Latest recorded value Unsmoothed Training steps
  - img
  - text: 21,599 of 21,599 planned steps Run duration
  - img
  - text: 3h 23m At the recorded snapshot Quality findings
  - img
  - text: "00"
  - button "Inspect data quality":
    - text: Inspect data quality
    - img
  - tablist "Run views":
    - tab "Metrics"
    - tab "Data quality"
    - tab "Run details" [selected]
    - text: Snapshot · not streaming
  - tabpanel "Run details":
    - heading "Run details" [level=2]
    - paragraph: The recorded configuration of this synthetic experiment.
    - term: Run ID
    - definition: run-009
    - term: Model
    - definition: Whisper
    - term: Dataset
    - definition: LibriSpeech
    - term: Source observations
    - definition: 21,600
    - term: Planned steps
    - definition: 21,599
    - term: Started at
    - definition: Nov 9, 05:32 UTC
    - term: Duration
    - definition: 3h 23m
    - term: Data source
    - definition: Deterministic synthetic fixture
    - term: Source snapshot at
    - definition:
      - time: Nov 9, 18:00 UTC
    - term: Fixture revision
    - definition: soup-fixtures-v2
    - term: View prepared at
    - definition:
      - time: Nov 9, 20:43 UTC
    - term: Freshness meaning
    - definition: Preparation time is not a newer training observation
    - term: Update mode
    - definition: Static snapshot; reload does not advance training
- contentinfo:
  - img
  - text: Built for the signal, including the noise. SOUP OBSERVATORY / 1.0
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | interface TransportRequest {
  4   |   requestId: number;
  5   |   id: string;
  6   |   range?: { min: number; max: number };
  7   | }
  8   | interface QueuedReply {
  9   |   request: TransportRequest;
  10  |   deliver: () => void;
  11  | }
  12  | interface WorkerGate {
  13  |   blocked: boolean;
  14  |   queue: QueuedReply[];
  15  |   deliveries: TransportRequest[];
  16  |   corruptNext?: 'identity' | 'columns' | 'stale';
  17  |   fail: () => void;
  18  |   release: (id: string, min?: number) => number;
  19  | }
  20  | declare global {
  21  |   interface Window {
  22  |     __soupWorkerGate: WorkerGate;
  23  |   }
  24  | }
  25  | 
  26  | /** Control delivery of real worker responses, not a replacement data source. The
  27  |  * production client/React/query cache receive genuine generated measurements in
  28  |  * a deliberately hostile order. No hook or debug mode is shipped in the app. */
  29  | async function installWorkerGate(page: Page) {
  30  |   await page.addInitScript(() => {
  31  |     const NativeWorker = window.Worker;
  32  |     const workers: Worker[] = [];
  33  |     const gate: WorkerGate = {
  34  |       blocked: false,
  35  |       queue: [],
  36  |       deliveries: [],
  37  |       fail() {
  38  |         workers.at(-1)?.dispatchEvent(new Event('error'));
  39  |       },
  40  |       release(id, min) {
  41  |         const selected = this.queue.filter(
  42  |           (reply) =>
  43  |             reply.request.id === id && (min === undefined || reply.request.range?.min === min),
  44  |         );
  45  |         this.queue = this.queue.filter((reply) => !selected.includes(reply));
  46  |         selected.forEach((reply) => reply.deliver());
  47  |         return selected.length;
  48  |       },
  49  |     };
  50  |     window.__soupWorkerGate = gate;
  51  |     class DeliveryControlledWorker extends NativeWorker {
  52  |       private deliveredMessage: ((this: Worker, event: MessageEvent) => unknown) | null = null;
  53  |       private requests = new Map<number, TransportRequest>();
  54  |       private corruptMode: WorkerGate['corruptNext'];
  55  |       constructor(url: string | URL, options?: WorkerOptions) {
  56  |         super(url, options);
  57  |         workers.push(this);
  58  |         this.corruptMode = gate.corruptNext;
  59  |         gate.corruptNext = undefined;
  60  |         super.addEventListener('message', (event) => {
  61  |           const request = this.requests.get(event.data?.requestId);
  62  |           if (!request) return;
  63  |           const deliver = () => {
  64  |             gate.deliveries.push(request);
  65  |             const payload = event.data;
  66  |             if (this.corruptMode === 'identity') payload.detail.run.id = 'run-001';
  67  |             if (this.corruptMode === 'columns') payload.detail.metrics.loss.y.pop();
  68  |             if (this.corruptMode === 'stale') payload.detail.source.revision = 'soup-fixtures-v1';
  69  |             this.deliveredMessage?.call(this, new MessageEvent('message', { data: payload }));
  70  |           };
  71  |           if (gate.blocked) gate.queue.push({ request, deliver });
  72  |           else deliver();
  73  |         });
  74  |       }
  75  |       override get onmessage() {
  76  |         return this.deliveredMessage;
  77  |       }
  78  |       override set onmessage(listener) {
  79  |         this.deliveredMessage = listener;
  80  |       }
  81  |       override postMessage(message: TransportRequest) {
  82  |         this.requests.set(message.requestId, message);
  83  |         super.postMessage(message);
  84  |       }
  85  |     }
  86  |     window.Worker = DeliveryControlledWorker;
  87  |   });
  88  | }
  89  | async function openReady(page: Page, id = 'run-001', suffix = '') {
  90  |   await page.goto(`/#/runs/${id}${suffix}`);
  91  |   await expect(page.locator(`[data-run-id="${id}"]`)).toHaveAttribute('data-ready', 'true');
> 92  |   await expect(page.getByTestId('chart-loss')).toBeVisible();
      |                                                ^ Error: expect(locator).toBeVisible() failed
  93  | }
  94  | async function awaitQueued(page: Page, id: string, min?: number) {
  95  |   await expect
  96  |     .poll(() =>
  97  |       page.evaluate(
  98  |         ({ id, min }) =>
  99  |           window.__soupWorkerGate.queue.filter(
  100 |             (reply) =>
  101 |               reply.request.id === id && (min === undefined || reply.request.range?.min === min),
  102 |           ).length,
  103 |         { id, min },
  104 |       ),
  105 |     )
  106 |     .toBeGreaterThan(0);
  107 | }
  108 | async function renderedFrames(page: Page) {
  109 |   await page.evaluate(
  110 |     () =>
  111 |       new Promise<void>((resolve) =>
  112 |         requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  113 |       ),
  114 |   );
  115 | }
  116 | 
  117 | test('actual React route keeps old-run data out while real worker replies arrive in reverse selection order', async ({
  118 |   page,
  119 | }) => {
  120 |   await installWorkerGate(page);
  121 |   await openReady(page);
  122 |   await page.evaluate(() => {
  123 |     window.__soupWorkerGate.blocked = true;
  124 |   });
  125 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  126 |   await expect(page.getByRole('heading', { name: 'mistral-7b-instruct-v3' })).toBeVisible();
  127 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  128 |   await expect(page.getByRole('status', { name: 'Loading run metrics' })).toBeVisible();
  129 |   await awaitQueued(page, 'run-002');
  130 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  131 |   await awaitQueued(page, 'run-003');
  132 |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  133 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  134 |   const released = await page.evaluate(() => window.__soupWorkerGate.release('run-003'));
  135 |   expect(released).toBeGreaterThan(0);
  136 |   await expect(page.locator('[data-run-id="run-003"]')).toHaveAttribute('data-ready', 'true');
  137 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  138 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  139 |   await page.evaluate(() => window.__soupWorkerGate.release('run-002'));
  140 |   await renderedFrames(page);
  141 |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  142 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  143 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  144 |   await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  145 |   const deliveryIds = await page.evaluate(() =>
  146 |     window.__soupWorkerGate.deliveries.map((request) => request.id),
  147 |   );
  148 |   expect(deliveryIds.lastIndexOf('run-002')).toBeGreaterThan(deliveryIds.lastIndexOf('run-003'));
  149 | });
  150 | 
  151 | test('superseded same-run range cannot overwrite a newer zoom when its genuine response arrives late', async ({
  152 |   page,
  153 | }) => {
  154 |   await installWorkerGate(page);
  155 |   await openReady(page);
  156 |   await page.evaluate(() => {
  157 |     window.__soupWorkerGate.blocked = true;
  158 |     location.hash = '/runs/run-001?min=100&max=200';
  159 |   });
  160 |   await awaitQueued(page, 'run-001', 100);
  161 |   await page.evaluate(() => {
  162 |     location.hash = '/runs/run-001?min=499999&max=500001';
  163 |   });
  164 |   await awaitQueued(page, 'run-001', 499999);
  165 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  166 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  167 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  168 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  169 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  170 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 100));
  171 |   await renderedFrames(page);
  172 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  173 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  174 |   await expect(page.getByTestId('chart-grad_norm')).toHaveAttribute('data-source-points', '3');
  175 |   await expect(page.getByTestId('chart-lr')).toHaveAttribute('data-source-points', '3');
  176 | });
  177 | 
  178 | test('selected-range loading never presents full-run loss as the selected latest value', async ({
  179 |   page,
  180 | }) => {
  181 |   await installWorkerGate(page);
  182 |   await openReady(page);
  183 |   await page.evaluate(() => {
  184 |     window.__soupWorkerGate.blocked = true;
  185 |     location.hash = '/runs/run-001?min=499999&max=500001';
  186 |   });
  187 |   await awaitQueued(page, 'run-001', 499999);
  188 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'false');
  189 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  190 |   // Retained same-run charts are acceptable only if every metric is visibly busy.
  191 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  192 |     const chart = page.locator(`.metric-chart--${metric}`);
```