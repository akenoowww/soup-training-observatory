# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> touch input emulation >> navigation and explicit zoom controls work through touchscreen taps
- Location: tests/e2e/adversarial.spec.ts:478:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByRole('spinbutton', { name: 'Start step' })
Expected: "249999"
Received: "249999.75"
Timeout:  10000ms

Call log:
  - Expect "toHaveValue" getByRole('spinbutton', { name: 'Start step' }) with timeout 10000ms
  - waiting for getByRole('spinbutton', { name: 'Start step' })
    - locator resolved to <input min="0" value="0" step="any" required="" name="from" max="999999" type="number" aria-label="Start step"/>
    - unexpected value "0"
    23 × locator resolved to <input min="0" step="any" required="" name="from" max="999999" type="number" value="249999.75" aria-label="Start step"/>
       - unexpected value "249999.75"

```

```yaml
- spinbutton "Start step": "249999.75"
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
  92  |   await expect(page.getByTestId('chart-loss')).toBeVisible();
  93  | }
  94  | /** A route/ready marker can still describe the preceding committed React view.
  95  |  * Wait for every renderer's actual requested domain before inspecting new data. */
  96  | async function waitRenderedViewport(page: Page, min: number, max: number) {
> 97  |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue(String(min));
      |                                                                      ^ Error: expect(locator).toHaveValue(expected) failed
  98  |   await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue(String(max));
  99  |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  100 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-min', String(min));
  101 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-max', String(max));
  102 |   }
  103 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  104 | }
  105 | async function awaitQueued(page: Page, id: string, min?: number) {
  106 |   await expect
  107 |     .poll(() =>
  108 |       page.evaluate(
  109 |         ({ id, min }) =>
  110 |           window.__soupWorkerGate.queue.filter(
  111 |             (reply) =>
  112 |               reply.request.id === id && (min === undefined || reply.request.range?.min === min),
  113 |           ).length,
  114 |         { id, min },
  115 |       ),
  116 |     )
  117 |     .toBeGreaterThan(0);
  118 | }
  119 | async function renderedFrames(page: Page) {
  120 |   await page.evaluate(
  121 |     () =>
  122 |       new Promise<void>((resolve) =>
  123 |         requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  124 |       ),
  125 |   );
  126 | }
  127 | 
  128 | test('actual React route keeps old-run data out while real worker replies arrive in reverse selection order', async ({
  129 |   page,
  130 | }) => {
  131 |   await installWorkerGate(page);
  132 |   await openReady(page);
  133 |   await page.evaluate(() => {
  134 |     window.__soupWorkerGate.blocked = true;
  135 |   });
  136 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  137 |   await expect(page.getByRole('heading', { name: 'mistral-7b-instruct-v3' })).toBeVisible();
  138 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  139 |   await expect(page.getByRole('status', { name: 'Loading run metrics' })).toBeVisible();
  140 |   await awaitQueued(page, 'run-002');
  141 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  142 |   await awaitQueued(page, 'run-003');
  143 |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  144 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  145 |   const released = await page.evaluate(() => window.__soupWorkerGate.release('run-003'));
  146 |   expect(released).toBeGreaterThan(0);
  147 |   await expect(page.locator('[data-run-id="run-003"]')).toHaveAttribute('data-ready', 'true');
  148 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  149 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  150 |   await page.evaluate(() => window.__soupWorkerGate.release('run-002'));
  151 |   await renderedFrames(page);
  152 |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  153 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  154 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  155 |   await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  156 |   const deliveryIds = await page.evaluate(() =>
  157 |     window.__soupWorkerGate.deliveries.map((request) => request.id),
  158 |   );
  159 |   expect(deliveryIds.lastIndexOf('run-002')).toBeGreaterThan(deliveryIds.lastIndexOf('run-003'));
  160 | });
  161 | 
  162 | test('superseded same-run range cannot overwrite a newer zoom when its genuine response arrives late', async ({
  163 |   page,
  164 | }) => {
  165 |   await installWorkerGate(page);
  166 |   await openReady(page);
  167 |   await page.evaluate(() => {
  168 |     window.__soupWorkerGate.blocked = true;
  169 |     location.hash = '/runs/run-001?min=100&max=200';
  170 |   });
  171 |   await awaitQueued(page, 'run-001', 100);
  172 |   await page.evaluate(() => {
  173 |     location.hash = '/runs/run-001?min=499999&max=500001';
  174 |   });
  175 |   await awaitQueued(page, 'run-001', 499999);
  176 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  177 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  178 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  179 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  180 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  181 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 100));
  182 |   await renderedFrames(page);
  183 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  184 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  185 |   await expect(page.getByTestId('chart-grad_norm')).toHaveAttribute('data-source-points', '3');
  186 |   await expect(page.getByTestId('chart-lr')).toHaveAttribute('data-source-points', '3');
  187 | });
  188 | 
  189 | test('selected-range loading never presents full-run loss as the selected latest value', async ({
  190 |   page,
  191 | }) => {
  192 |   await installWorkerGate(page);
  193 |   await openReady(page);
  194 |   await page.evaluate(() => {
  195 |     window.__soupWorkerGate.blocked = true;
  196 |     location.hash = '/runs/run-001?min=499999&max=500001';
  197 |   });
```