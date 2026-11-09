import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { generateRun } from './data/fixtures';
import { loadRun } from './data/client';
import { baselineMetric, sampleMetric } from './domain/series';
import type { CanonicalRun, SeriesResult } from './domain/types';

interface BenchmarkResults {
  mode: 'baseline' | 'sampled-main' | 'optimized';
  dataPreparationMs: number;
  plotUntilPaintMs: number;
  firstRenderMs: number;
  sourcePoints: number;
  renderedPoints: number;
  spikeRetained: boolean;
  zoomMs: number[];
  hoverMs: number[];
}
interface BenchmarkAPI {
  ready: boolean;
  results: BenchmarkResults;
  // Retaining baseline columns deliberately matches the worker-owned source data.
  source?: CanonicalRun;
  zoom: () => Promise<{
    durationMs: number;
    renderedPoints: number;
    sourcePoints: number;
    spikeRetained: boolean;
  }>;
  armHover?: () => void;
  lastHover?: { durationMs: number; step: number | null; value: number | null; isTrusted: boolean };
  hover: (fraction?: number) => Promise<{
    durationMs: number;
    step: number | null;
    value: number | null;
    isTrusted: boolean;
  }>;
}
declare global {
  interface Window {
    soupBenchmark: BenchmarkAPI;
  }
}

const requestedMode = new URLSearchParams(location.search).get('mode');
const mode =
  requestedMode === 'baseline' || requestedMode === 'sampled-main' ? requestedMode : 'optimized';
const results: BenchmarkResults = {
  mode,
  firstRenderMs: 0,
  dataPreparationMs: 0,
  plotUntilPaintMs: 0,
  sourcePoints: 1_000_000,
  renderedPoints: 0,
  spikeRetained: false,
  zoomMs: [],
  hoverMs: [],
};
const api: BenchmarkAPI = {
  ready: false,
  results,
  zoom: async () => {
    throw new Error('Not ready');
  },
  hover: async () => {
    throw new Error('Not ready');
  },
};
window.soupBenchmark = api;
const host = document.getElementById('plot')!;
const status = document.getElementById('status')!;
const output = document.getElementById('results')!;
const paint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
const mark = (name: string) => performance.mark(`soup:benchmark:${name}`);
const showResults = () => {
  output.textContent = JSON.stringify(results, null, 2);
};

async function start() {
  mark('start');
  const dataStart = performance.now();
  let sampled: SeriesResult;
  if (mode === 'baseline' || mode === 'sampled-main') {
    api.source = generateRun('run-001');
    sampled =
      mode === 'baseline'
        ? baselineMetric(api.source, 'loss')
        : sampleMetric(api.source, 'loss', 900);
  } else {
    sampled = (await loadRun('run-001', { width: 900 })).metrics.loss;
  }
  mark('data-ready');
  results.dataPreparationMs = performance.now() - dataStart;
  const plotStart = performance.now();
  const plot = new uPlot(
    {
      width: 900,
      height: 360,
      legend: { show: false },
      padding: [16, 16, 0, 0],
      scales: { x: { time: false }, y: { auto: true } },
      axes: [
        {
          stroke: '#9FB3C8',
          grid: { show: false },
          values: (_p, ticks) => ticks.map((value) => value.toLocaleString('en-US')),
        },
        { stroke: '#9FB3C8', grid: { stroke: '#334E68', width: 1 } },
      ],
      series: [
        { label: 'Step' },
        { label: 'Loss', stroke: '#65D6AD', width: 1.6, spanGaps: false, points: { show: false } },
      ],
      cursor: { y: false, drag: { x: false, y: false }, points: { show: true, size: 6 } },
      hooks: {
        setCursor: [
          (p) => {
            const index = p.cursor.idx;
            status.textContent =
              index == null
                ? 'Hover a sampled observation.'
                : `Step ${p.data[0][index]} · loss ${p.data[1][index]} · ${mode}`;
          },
        ],
      },
    },
    [sampled.x, sampled.y],
    host,
  );
  results.renderedPoints = sampled.renderedCount;
  results.spikeRetained = sampled.y.includes(9.4);
  await paint();
  mark('first-paint');
  // Includes document/module startup, generation, worker exchange and chart paint.
  results.firstRenderMs = performance.now();
  results.plotUntilPaintMs = performance.now() - plotStart;
  performance.measure('soup:benchmark:first-render', { start: 0, end: performance.now() });
  document.getElementById('title')!.textContent =
    mode === 'baseline'
      ? 'Before · unreduced 1,000,000-point chart'
      : mode === 'sampled-main'
        ? 'Control · extrema sampling on main thread'
        : 'After · worker-backed extrema sampling';
  api.zoom = async () => {
    mark('zoom-start');
    const startTime = performance.now();
    if (mode === 'optimized') {
      sampled = (await loadRun('run-001', { width: 900, range: { min: 490_000, max: 510_000 } }))
        .metrics.loss;
      plot.setData([sampled.x, sampled.y], false);
    } else if (mode === 'sampled-main') {
      sampled = sampleMetric(api.source!, 'loss', 900, { min: 490_000, max: 510_000 });
      plot.setData([sampled.x, sampled.y], false);
    }
    plot.setScale('x', { min: 490_000, max: 510_000 });
    await paint();
    const durationMs = performance.now() - startTime;
    results.zoomMs.push(durationMs);
    mark('zoom-painted');
    performance.measure(
      'soup:benchmark:zoom',
      'soup:benchmark:zoom-start',
      'soup:benchmark:zoom-painted',
    );
    showResults();
    return {
      durationMs,
      renderedPoints: sampled.renderedCount,
      sourcePoints: mode === 'baseline' ? 20_001 : sampled.rawCount,
      spikeRetained: sampled.y.includes(9.4),
    };
  };
  let hoverArmed = false;
  api.armHover = () => {
    hoverArmed = true;
    api.lastHover = undefined;
  };
  plot.over.addEventListener(
    'mousemove',
    (event) => {
      if (!hoverArmed) return;
      hoverArmed = false;
      mark('hover-start');
      const startTime = performance.now();
      void paint().then(() => {
        const index = plot.cursor.idx;
        const result = {
          durationMs: performance.now() - startTime,
          step: index == null ? null : plot.data[0][index]!,
          value: index == null ? null : (plot.data[1]?.[index] ?? null),
          isTrusted: event.isTrusted,
        };
        api.lastHover = result;
        results.hoverMs.push(result.durationMs);
        mark('hover-painted');
        performance.measure(
          'soup:benchmark:hover',
          'soup:benchmark:hover-start',
          'soup:benchmark:hover-painted',
        );
        showResults();
      });
    },
    { capture: true },
  );
  // This API remains useful for manual console inspection; the collector uses
  // actual trusted mouse input plus armHover instead of this synthetic shortcut.
  api.hover = async (fraction = 0.5) => {
    api.armHover!();
    const bounds = plot.over.getBoundingClientRect();
    plot.over.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: bounds.left + bounds.width * fraction,
        clientY: bounds.top + bounds.height * 0.5,
      }),
    );
    await paint();
    return api.lastHover!;
  };
  api.ready = true;
  status.textContent = `${sampled.renderedCount.toLocaleString('en-US')} plotted observations · source 1,000,000 · spike ${results.spikeRetained ? 'retained' : 'MISSING'}`;
  showResults();
}
start().catch((error) => {
  status.textContent = `Benchmark failed: ${error instanceof Error ? error.message : 'Unknown failure'}`;
  throw error;
});
