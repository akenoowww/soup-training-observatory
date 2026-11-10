/* global performance, Worker, Blob, clearTimeout */
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const output = resolve(
  process.argv[2] ?? 'evidence/final-build-measurements/cpu-scope-calibration.json',
);
if (existsSync(output))
  throw new Error('Choose a fresh calibration output; previous results are immutable.');
const candidate = chromium.executablePath();
const executablePath = existsSync(candidate)
  ? candidate
  : [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ].find(existsSync);
if (!executablePath) throw new Error('No measurement Chromium is installed.');
const workload = () => {
  const started = performance.now();
  let hash = 2166136261;
  for (let i = 0; i < 100_000_000; i++) hash = Math.imul(hash ^ i, 16777619);
  return { durationMs: performance.now() - started, hash };
};
const browser = await chromium.launch({ headless: true, executablePath });
try {
  const page = await browser.newPage();
  const session = await page.context().newCDPSession(page);
  const browserSession = await browser.newBrowserCDPSession();
  await page.evaluate((source) => {
    const worker = new Worker(
      URL.createObjectURL(
        new Blob([`onmessage=()=>postMessage((${source})())`], { type: 'text/javascript' }),
      ),
    );
    globalThis.measureWorker = () =>
      new Promise((done) => {
        worker.onmessage = (event) => done(event.data);
        worker.postMessage(null);
      });
  }, workload.toString());
  await page.evaluate(workload);
  await page.evaluate(() => globalThis.measureWorker());
  const phases = [];
  let expectedHash;
  for (const [label, rate] of [
    ['initial-x1', 1],
    ['page-x4', 4],
    ['restored-x1', 1],
  ]) {
    await session.send('Emulation.setCPUThrottlingRate', { rate });
    const samples = [];
    for (let i = 0; i < 3; i++) {
      const worker = await page.evaluate(() => globalThis.measureWorker());
      const main = await page.evaluate(workload);
      expectedHash ??= worker.hash;
      if (main.hash !== expectedHash || worker.hash !== expectedHash)
        throw new Error('Calibration workload changed its result.');
      samples.push({ pageMs: main.durationMs, workerMs: worker.durationMs, hash: expectedHash });
    }
    phases.push({ label, pageThrottleRate: rate, samples });
  }
  const { targetInfos } = await browserSession.send('Target.getTargets');
  const worker = targetInfos.find((target) => target.type === 'worker');
  if (!worker) throw new Error('Calibration worker target is missing.');
  const { sessionId } = await browserSession.send('Target.attachToTarget', {
    targetId: worker.targetId,
    flatten: false,
  });
  const reply = new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error('Worker throttle command timed out.')), 5_000);
    const listener = (event) => {
      if (event.sessionId !== sessionId) return;
      const message = JSON.parse(event.message);
      if (message.id !== 1) return;
      clearTimeout(timer);
      browserSession.off('Target.receivedMessageFromTarget', listener);
      done(
        message.error ? { supported: false, error: message.error.message } : { supported: true },
      );
    };
    browserSession.on('Target.receivedMessageFromTarget', listener);
  });
  await browserSession.send('Target.sendMessageToTarget', {
    sessionId,
    message: JSON.stringify({
      id: 1,
      method: 'Emulation.setCPUThrottlingRate',
      params: { rate: 4 },
    }),
  });
  const workerTargetThrottle = await reply;
  await browserSession.send('Target.detachFromTarget', { sessionId });
  const result = {
    generatedAt: new Date().toISOString(),
    browser: browser.version(),
    machine: `${process.platform}/${process.arch}`,
    workload:
      '100,000,000 Math.imul(hash ^ i, 16777619) iterations, initial hash2166136261; one warmup in each context; internal performance.now() excludes automation transport.',
    phases,
    workerTargetThrottle,
    scope:
      'One local browser and machine; observed page and dedicated-worker durations under page-target x1/x4/x1. This calibration does not establish whole-machine throttling or device equivalence.',
  };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(result, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
