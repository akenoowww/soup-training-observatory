import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import uPlot from 'uplot';
import { AlertTriangle, ArrowDownRight, ChartNoAxesCombined, Keyboard } from 'lucide-react';
import type { Metric, Range, SeriesResult } from '../../domain/types';
import {
  constantMetricRange,
  formatMetric,
  formatMetricTicks,
  formatStep,
  formatStepTicks,
  isolatedPointIndices,
  prepareValues,
} from './chart-format';
import 'uplot/dist/uPlot.min.css';
import './charts.css';

export interface MetricChartProps {
  metric: Metric;
  series: SeriesResult;
  title?: string;
  color?: string;
  range?: Range;
  onRangeChange?: (range: Range) => void;
  scale?: 'linear' | 'log';
  loading?: boolean;
}

interface AxisTick {
  value: number;
  label: string;
}
interface RenderedAxes {
  x: Range;
  y: Range;
  xTicks: AxisTick[];
  yTicks: AxisTick[];
  points: number;
}
const metricDefinitions: Record<Metric, { title: string; color: string; description: string }> = {
  loss: { title: 'Training loss', color: '#65D6AD', description: 'Lower is better' },
  lr: { title: 'Learning rate', color: '#62B0E8', description: 'Optimizer step size' },
  grad_norm: { title: 'Gradient norm', color: '#CFBCF2', description: 'Gradient magnitude' },
};

export function MetricChart({
  metric,
  series,
  title,
  color,
  range,
  onRangeChange,
  scale = 'linear',
  loading = false,
}: MetricChartProps) {
  const definition = metricDefinitions[metric];
  const chartTitle = title ?? definition.title;
  const lineColor = color ?? definition.color;
  const descriptionId = useId();
  const titleId = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const indexRef = useRef<number | null>(null);
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);
  const [keyboardAnnouncement, setKeyboardAnnouncement] = useState('');
  const [tableOpen, setTableOpen] = useState(false);
  const [rendered, setRendered] = useState<RenderedAxes | null>(null);
  const prepared = useMemo(() => prepareValues(series.y, scale), [series.y, scale]);
  const viewMin = range?.min ?? series.domain.min;
  const viewMax = range?.max ?? series.domain.max;
  const isolatedPoints = useMemo(() => isolatedPointIndices(prepared.values), [prepared.values]);
  // uPlot's long-lived event handlers must use the current response and viewport.
  const currentRef = useRef({ series, prepared, isolatedPoints, range, onRangeChange, loading });
  currentRef.current = { series, prepared, isolatedPoints, range, onRangeChange, loading };

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let active = true;
    let lastAxes = '';
    let xTicks: AxisTick[] = [];
    let yTicks: AxisTick[] = [];
    const width = Math.max(220, Math.floor(host.getBoundingClientRect().width));
    const height = metric === 'loss' ? 252 : 216;
    const yRange: uPlot.Range.Function = (_plot, min, max) => {
      if (min === null || max === null || !Number.isFinite(min) || !Number.isFinite(max)) {
        return scale === 'log' ? [0.01, 1] : [0, 1];
      }
      if (scale === 'log') {
        const safeMin = min > 0 ? min : Number.MIN_VALUE;
        return uPlot.rangeLog(safeMin, Math.max(max, safeMin * 1.01), 10, false);
      }
      // A constant zero needs interior space: uPlot's default [0, 100]
      // puts its genuine line on the clipping boundary in Chromium/Firefox.
      if (min === max) return constantMetricRange(min, metric);
      return uPlot.rangeNum(min, max, 0.12, false);
    };
    const plot = new uPlot(
      {
        width,
        height,
        padding: [14, 17, 0, 2],
        legend: { show: false },
        select: { show: true, over: true, left: 0, top: 0, width: 0, height: 0 },
        cursor: {
          show: true,
          x: true,
          y: false,
          bind: {
            dblclick: () => (event) => {
              event.preventDefault();
              const current = currentRef.current;
              if (!current.loading) current.onRangeChange?.(current.series.domain);
              return null;
            },
          },
          drag: { x: true, y: false, setScale: false },
          points: { size: 5, width: 1, fill: lineColor, stroke: '#F0F4F8' },
        },
        scales: {
          x: {
            time: false,
            auto: false,
            range: (_plot, min, max) => {
              const current = currentRef.current;
              const bounds = current.range ?? current.series.domain;
              return [
                min ?? bounds.min,
                max ?? (bounds.max > bounds.min ? bounds.max : bounds.min + 1),
              ];
            },
          },
          y: { distr: scale === 'log' ? 3 : 1, range: yRange },
        },
        axes: [
          {
            stroke: '#9FB3C8',
            font: '11px "IBM Plex Mono", monospace',
            gap: 9,
            size: 38,
            space: 76,
            grid: { show: false },
            ticks: { show: false },
            values: (_plot, ticks) => {
              const labels = formatStepTicks(ticks);
              xTicks = ticks.flatMap((value, index) =>
                Number.isFinite(value) && labels[index] !== null
                  ? [{ value, label: labels[index]! }]
                  : [],
              );
              return labels;
            },
          },
          {
            stroke: '#9FB3C8',
            font: '11px "IBM Plex Mono", monospace',
            gap: 10,
            size: (_plot, values) =>
              Math.min(
                152,
                Math.max(
                  metric === 'lr' ? 69 : 55,
                  ...(values ?? []).map((value) => String(value ?? '').length * 6.7 + 19),
                ),
              ),
            space: 42,
            grid: { stroke: '#334E68', width: 1, dash: [3, 5] },
            ticks: { show: false },
            values: (_plot, ticks) => {
              const labels = formatMetricTicks(ticks, metric);
              yTicks = ticks.flatMap((value, index) =>
                Number.isFinite(value) && labels[index] !== null
                  ? [{ value, label: labels[index]! }]
                  : [],
              );
              return labels;
            },
          },
        ],
        series: [
          { label: 'Step' },
          {
            label: chartTitle,
            stroke: lineColor,
            width: 1.6,
            spanGaps: false,
            // A finite singleton between nulls has no line segment. Draw only those
            // points, rather than concealing the measurement or drawing every marker.
            points: {
              show: false,
              size: 5,
              fill: lineColor,
              stroke: lineColor,
              filter: () =>
                currentRef.current.isolatedPoints.length ? currentRef.current.isolatedPoints : null,
            },
          },
        ],
        hooks: {
          setCursor: [
            (current) => {
              if (!active || currentRef.current.loading) return;
              const index = current.cursor.idx;
              const next = index == null || (current.cursor.left ?? -1) < 0 ? null : index;
              if (next !== indexRef.current) {
                indexRef.current = next;
                setInspectedIndex(next);
              }
            },
          ],
          setSelect: [
            (current) => {
              const latest = currentRef.current;
              if (current.select.width < 4 || !latest.onRangeChange || latest.loading) return;
              const min = Math.max(
                latest.series.domain.min,
                current.posToVal(current.select.left, 'x'),
              );
              const max = Math.min(
                latest.series.domain.max,
                current.posToVal(current.select.left + current.select.width, 'x'),
              );
              if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
                latest.onRangeChange({ min: Math.floor(min), max: Math.ceil(max) });
              }
              current.setSelect({ left: 0, top: 0, width: 0, height: 0 }, false);
            },
          ],
          draw: [
            (current) => {
              if (!active) return;
              const axes: RenderedAxes = {
                x: { min: current.scales.x!.min!, max: current.scales.x!.max! },
                y: { min: current.scales.y!.min!, max: current.scales.y!.max! },
                xTicks,
                yTicks,
                points: current.data[0].length,
              };
              const key = JSON.stringify(axes);
              if (key !== lastAxes) {
                lastAxes = key;
                setRendered(axes);
              }
            },
          ],
        },
      },
      [[], []],
      host,
    );
    plotRef.current = plot;
    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.max(220, Math.floor(entries[0]?.contentRect.width ?? width));
      if (active && nextWidth !== plot.width) plot.setSize({ width: nextWidth, height });
    });
    observer.observe(host);
    return () => {
      active = false;
      observer.disconnect();
      plotRef.current = null;
      plot.destroy();
    };
  }, [metric, chartTitle, lineColor, scale]);

  useLayoutEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    indexRef.current = null;
    setInspectedIndex(null);
    setKeyboardAnnouncement('');
    // Update the existing canvas atomically. Recreating three charts on every
    // viewport change discarded focus/geometry and added unnecessary zoom work.
    plot.batch(() => {
      plot.setCursor({ left: -10, top: -10 }, false);
      plot.setSelect({ left: 0, top: 0, width: 0, height: 0 }, false);
      plot.setData([series.x, prepared.values], false);
      plot.setScale('x', { min: viewMin, max: viewMax > viewMin ? viewMax : viewMin + 1 });
    });
  }, [series, prepared, viewMin, viewMax, metric, chartTitle, lineColor, scale]);

  const currentIndex =
    inspectedIndex !== null && inspectedIndex < series.x.length ? inspectedIndex : null;
  const currentValue = currentIndex === null ? null : (prepared.values[currentIndex] ?? null);
  const showPoint = (index: number) => {
    const plot = plotRef.current;
    if (!plot || loading || series.x.length === 0) return;
    const next = Math.max(0, Math.min(series.x.length - 1, index));
    indexRef.current = next;
    setInspectedIndex(next);
    plot.setCursor({ left: plot.valToPos(series.x[next]!, 'x'), top: 0 }, false);
    const value = prepared.values[next];
    setKeyboardAnnouncement(
      `${value == null ? 'Gap or excluded value at step' : 'Sampled step'} ${formatStep(series.x[next]!)}: ${value == null ? 'missing or excluded value' : String(value)}.`,
    );
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      loading ||
      !['ArrowLeft', 'ArrowRight', 'Home', 'End', '+', '=', '-', 'Escape'].includes(event.key)
    )
      return;
    event.preventDefault();
    const current = indexRef.current ?? 0;
    const stride = event.shiftKey ? 10 : 1;
    if (event.key === 'ArrowLeft') showPoint(current - stride);
    if (event.key === 'ArrowRight') showPoint(current + stride);
    if (event.key === 'Home') showPoint(0);
    if (event.key === 'End') showPoint(series.x.length - 1);
    if (event.key === 'Escape') {
      indexRef.current = null;
      setInspectedIndex(null);
      plotRef.current?.setCursor({ left: -10, top: -10 }, false);
    }
    if (['+', '=', '-'].includes(event.key) && onRangeChange) {
      const min = range?.min ?? series.domain.min;
      const max = range?.max ?? series.domain.max;
      const midpoint = (min + max) / 2;
      const span = Math.max(1, (max - min) * (event.key === '-' ? 2 : 0.5));
      const domainSpan = series.domain.max - series.domain.min;
      const clampedSpan = Math.min(span, domainSpan);
      const nextMin = Math.max(
        series.domain.min,
        Math.min(midpoint - clampedSpan / 2, series.domain.max - clampedSpan),
      );
      onRangeChange({ min: Math.floor(nextMin), max: Math.ceil(nextMin + clampedSpan) });
    }
  };
  const tableStart = Math.max(0, (currentIndex ?? 0) - 3);
  const tableIndices = Array.from(
    { length: Math.min(7, series.x.length - tableStart) },
    (_, index) => tableStart + index,
  );
  const emptyLabel =
    scale === 'log' && prepared.nonpositiveCount > 0
      ? 'No positive values in this range'
      : 'No finite values in this range';

  return (
    <section
      className={`metric-chart metric-chart--${metric}`}
      aria-labelledby={titleId}
      aria-busy={loading}
    >
      <header className="metric-chart__header">
        <div>
          <h3 id={titleId}>
            <span className="metric-chart__dot" style={{ background: lineColor }} />
            {chartTitle}
          </h3>
          <p>{definition.description}</p>
        </div>
        <div className="metric-chart__latest">
          <strong
            style={{ color: lineColor }}
            title={
              series.latest === null ? 'Latest measurement unavailable' : String(series.latest)
            }
          >
            {formatMetric(series.latest, metric)}
          </strong>
          <span>Latest in view</span>
        </div>
      </header>
      <div
        className="metric-chart__extrema"
        role="group"
        aria-label={`${chartTitle} visible range statistics`}
      >
        <span>
          Min{' '}
          <strong title={series.min === null ? 'Unavailable' : String(series.min)}>
            {formatMetric(series.min, metric)}
          </strong>
        </span>
        <span>
          Max{' '}
          <strong title={series.max === null ? 'Unavailable' : String(series.max)}>
            {formatMetric(series.max, metric)}
          </strong>
        </span>
        <span className="metric-chart__bounds">
          Step {formatStep(rendered?.x.min ?? range?.min ?? series.domain.min)} –{' '}
          {formatStep(rendered?.x.max ?? range?.max ?? series.domain.max)}
        </span>
      </div>
      <div
        className="metric-chart__interactive"
        tabIndex={0}
        role="group"
        aria-disabled={loading}
        aria-label={`${chartTitle} interactive chart`}
        aria-describedby={descriptionId}
        onKeyDown={onKeyDown}
        data-testid={`chart-${metric}`}
        data-rendered-points={series.renderedCount}
        data-source-points={series.rawCount}
        data-min-value={series.min ?? 'missing'}
        data-max-value={series.max ?? 'missing'}
        data-x-min={rendered?.x.min}
        data-x-max={rendered?.x.max}
        data-y-min={rendered?.y.min}
        data-y-max={rendered?.y.max}
        data-painted-points={rendered?.points}
      >
        <p id={descriptionId} className="sr-only">
          {chartTitle}. Numeric training step on the horizontal axis; {scale} vertical scale. Drag
          to zoom, double-click to reset. Use left and right arrows to inspect plotted samples,
          Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values
          break the line; isolated finite measurements are drawn as points. Hover shows sampled
          values, not every raw step.
        </p>
        <div className="metric-chart__canvas" ref={hostRef} aria-hidden="true" />
        {prepared.finiteCount === 0 && (
          <div className="metric-chart__empty">
            <ChartNoAxesCombined size={24} />
            <span>{emptyLabel}</span>
          </div>
        )}
        {loading && (
          <div className="metric-chart__updating">
            <span className="metric-chart__spinner" />
            Updating range…
          </div>
        )}
        {!loading && currentIndex !== null && (
          <div className="metric-chart__tooltip" aria-hidden="true">
            <span>
              {currentValue === null ? 'Gap / excluded at step' : 'Sampled step'}{' '}
              {formatStep(series.x[currentIndex]!)}
            </span>
            <strong>{currentValue === null ? 'Missing / excluded' : String(currentValue)}</strong>
          </div>
        )}
      </div>
      <span className="sr-only" role="status">
        {keyboardAnnouncement}
      </span>
      <div className="metric-chart__axis-label">Training step</div>
      <footer className="metric-chart__footer">
        <span className="metric-chart__render-note">
          <ArrowDownRight size={13} />
          {formatStep(series.renderedCount)} entries / {formatStep(series.rawCount)} unique
          observations
        </span>
        <span className="metric-chart__linear-note">
          {scale === 'log' ? 'Log scale' : 'No smoothing'}
        </span>
      </footer>
      {(series.invalidCount > 0 || series.gapCount > 0) && (
        <p className="metric-chart__warning" role="note">
          <AlertTriangle size={14} />
          <span>
            {[
              series.invalidCount > 0
                ? `${formatStep(series.invalidCount)} non-finite ${series.invalidCount === 1 ? 'measurement' : 'measurements'}`
                : '',
              series.gapCount > 0
                ? `${formatStep(series.gapCount)} step ${series.gapCount === 1 ? 'gap' : 'gaps'}`
                : '',
            ]
              .filter(Boolean)
              .join(' · ')}
            . Lines break at missing data.
          </span>
        </p>
      )}
      {prepared.nonpositiveCount > 0 && (
        <p className="metric-chart__warning" role="note">
          <AlertTriangle size={14} />
          {formatStep(prepared.nonpositiveCount)} plotted zero or negative{' '}
          {prepared.nonpositiveCount === 1 ? 'value is' : 'values are'} excluded from the log scale.
          Switch to linear to inspect them.
        </p>
      )}
      <details
        className="metric-chart__data"
        open={tableOpen}
        onToggle={(event) => setTableOpen(event.currentTarget.open)}
      >
        <summary>
          <Keyboard size={13} />
          Inspect plotted values
        </summary>
        {tableOpen && (
          <div className="metric-chart__table-wrap">
            <p>
              Sampled points around the inspected step. Arrow keys in the chart move the selection.
              Null markers represent missing or excluded values, not observations with value zero.
            </p>
            <table>
              <caption className="sr-only">Plotted {chartTitle.toLowerCase()} values</caption>
              <thead>
                <tr>
                  <th scope="col">Step</th>
                  <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
                {tableIndices.map((index) => (
                  <tr
                    key={`${series.x[index]}-${index}`}
                    aria-current={index === currentIndex ? 'true' : undefined}
                  >
                    <th scope="row">{formatStep(series.x[index]!)}</th>
                    <td>
                      {prepared.values[index] == null
                        ? 'Missing / excluded'
                        : String(prepared.values[index])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rendered && (
              <table className="metric-chart__axis-table">
                <caption>Rendered axis ticks</caption>
                <thead>
                  <tr>
                    <th scope="col">Axis</th>
                    <th scope="col">Numeric value</th>
                    <th scope="col">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {(['x', 'y'] as const).flatMap((axis) =>
                    rendered[axis === 'x' ? 'xTicks' : 'yTicks'].map((tick, index) => (
                      <tr key={`${axis}-${index}`}>
                        <th scope="row">{axis === 'x' ? 'Step' : chartTitle}</th>
                        <td>{String(tick.value)}</td>
                        <td>{tick.label}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </details>
    </section>
  );
}
