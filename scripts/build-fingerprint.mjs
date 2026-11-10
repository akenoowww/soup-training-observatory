/* global fetch */
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

/** Public production artifacts only; verify the served bytes before measurement. */
export async function captureBuildFingerprint(baseURL, distDirectory = 'dist') {
  const base = new URL(baseURL.endsWith('/') ? baseURL : `${baseURL}/`);
  const served = async (filename) => {
    const local = await readFile(resolve(distDirectory, filename));
    const response = await fetch(new URL(filename, base));
    if (!response.ok)
      throw new Error(`Fingerprint request failed: ${filename} (${response.status}).`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (sha256(bytes) !== sha256(local)) {
      throw new Error(`Served production artifact differs from local build: ${filename}.`);
    }
    return { filename, sha256: sha256(bytes), bytes: bytes.length };
  };
  const index = await served('index.html');
  const benchmark = await served('benchmark.html');
  const names = await readdir(resolve(distDirectory, 'assets'));
  const exactlyOne = (pattern, label) => {
    const found = names.filter((name) => pattern.test(name));
    if (found.length !== 1) throw new Error(`Expected exactly one production ${label} asset.`);
    return `assets/${found[0]}`;
  };
  return {
    indexSha256: index.sha256,
    benchmarkIndexSha256: benchmark.sha256,
    application: await served(exactlyOne(/^app-[^/]+\.js$/u, 'application')),
    worker: await served(exactlyOne(/^data\.worker-[^/]+\.js$/u, 'worker')),
    scope:
      'SHA256 of actual HTTP response bytes, checked against the frozen local production build before timed browser work.',
  };
}
