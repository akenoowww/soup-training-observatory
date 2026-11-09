import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Expand, Info, ZoomIn, ZoomOut } from 'lucide-react';
import type { Range, RunDetail } from '../../domain/types';
import { MetricChart } from '../charts/MetricChart';
import { number } from '../../shared/format';
import type { ChartScale } from './run-view';

interface Props {
  data: RunDetail;
  displayedViewport: Range;
  requestedRange?: Range;
  scale: ChartScale;
  updating: boolean;
  onRangeChange: (range?: Range) => void;
  onScaleChange: (scale: ChartScale) => void;
  onZoom: (factor: number) => void;
}

export function RunMetricsPanel({
  data,
  displayedViewport,
  requestedRange,
  scale,
  updating,
  onRangeChange,
  onScaleChange,
  onZoom,
}: Props) {
  const [rangeError, setRangeError] = useState<{ scope: string; message: string }>();
  const domain = data.metrics.loss.domain;
  const rangeKey = `${requestedRange?.min ?? domain.min}:${requestedRange?.max ?? domain.max}`;
  const loss = data.metrics.loss;
  function applyRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const from = String(form.get('from') ?? '').trim();
    const to = String(form.get('to') ?? '').trim();
    const min = from === '' ? NaN : Number(from);
    const max = to === '' ? NaN : Number(to);
    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min < domain.min ||
      max > domain.max ||
      min >= max
    ) {
      setRangeError({
        scope: rangeKey,
        message: `Choose steps between ${domain.min} and ${domain.max}, with start before end.`,
      });
      return;
    }
    setRangeError(undefined);
    onRangeChange({ min, max });
  }
  function resetRange() {
    setRangeError(undefined);
    onRangeChange();
  }
  return (
    <>
      <div className="chart-toolbar">
        <div className="chart-toolbar-left">
          <span className="section-eyebrow">TRAINING METRICS</span>
          <span className="chart-raw-label">Extrema preserved · no smoothing</span>
        </div>
        <div className="chart-options">
          <label className="scale-picker">
            <span>Scale</span>
            <select
              aria-label="Chart scale"
              value={scale}
              disabled={updating}
              onChange={(event) => onScaleChange(event.target.value as ChartScale)}
            >
              <option value="linear">Linear</option>
              <option value="log">Logarithmic</option>
            </select>
          </label>
          <span className="toolbar-divider" />
          <button
            className="icon-button"
            aria-label="Zoom in"
            disabled={updating || displayedViewport.max - displayedViewport.min <= 1}
            onClick={() => onZoom(0.5)}
          >
            <ZoomIn size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Zoom out"
            disabled={updating || !requestedRange}
            onClick={() => onZoom(2)}
          >
            <ZoomOut size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Reset zoom"
            disabled={updating || !requestedRange}
            onClick={resetRange}
          >
            <Expand size={16} />
          </button>
        </div>
      </div>
      {updating && (
        <span className="sr-only" role="status">
          Updating selected range. Previous charts are covered while the new values load.
        </span>
      )}
      {data.run.id === 'run-001' && !requestedRange && (
        <div className="data-callout">
          <span className="callout-symbol">↗</span>
          <span>
            <strong>A spike worth noticing.</strong> Loss reaches 9.4 at step 500,000. The
            full-range chart preserves it.
          </span>
          <button disabled={updating} onClick={() => onRangeChange({ min: 490_000, max: 510_000 })}>
            Inspect spike <ArrowRight size={13} />
          </button>
        </div>
      )}
      <div className={updating ? 'charts-updating' : ''} aria-busy={updating}>
        <MetricChart
          metric="loss"
          series={loss}
          title="Training loss"
          color="#65D6AD"
          range={displayedViewport}
          onRangeChange={onRangeChange}
          scale={scale}
          loading={updating}
        />
        <div className="aux-grid">
          <MetricChart
            metric="lr"
            series={data.metrics.lr}
            title="Learning rate"
            color="#62B0E8"
            range={displayedViewport}
            onRangeChange={onRangeChange}
            scale={scale}
            loading={updating}
          />
          <MetricChart
            metric="grad_norm"
            series={data.metrics.grad_norm}
            title="Gradient norm"
            color="#CFBCF2"
            range={displayedViewport}
            onRangeChange={onRangeChange}
            scale={scale}
            loading={updating}
          />
        </div>
      </div>
      <form key={rangeKey} className="range-form" onSubmit={applyRange}>
        <span>Step range</span>
        <label>
          <span className="sr-only">Start step</span>
          <input
            key={`from-${requestedRange?.min}`}
            name="from"
            aria-label="Start step"
            type="number"
            step="any"
            min={domain.min}
            max={domain.max}
            defaultValue={requestedRange?.min ?? domain.min}
            disabled={updating}
            required
          />
        </label>
        <span>—</span>
        <label>
          <span className="sr-only">End step</span>
          <input
            key={`to-${requestedRange?.max}`}
            name="to"
            aria-label="End step"
            type="number"
            step="any"
            min={domain.min}
            max={domain.max}
            defaultValue={requestedRange?.max ?? domain.max}
            disabled={updating}
            required
          />
        </label>
        <button className="button button--small" type="submit" disabled={updating}>
          Apply range
        </button>
        <button className="text-button" type="button" disabled={updating} onClick={resetRange}>
          Reset
        </button>
        <span className="range-hint">Drag a chart to zoom. All charts stay in step.</span>
      </form>
      {rangeError?.scope === rangeKey && (
        <p role="alert" className="form-error">
          {rangeError.message}
        </p>
      )}
      <div className="chart-footnote">
        <Info size={15} />
        <p>
          Showing {number(loss.renderedCount)} retained loss entries from {number(loss.rawCount)}{' '}
          unique observations in view. Entries can include gap markers. Minimum and maximum values
          are retained in each bucket. Missing and non-finite values break the line.
        </p>
        <Link to="/guide">
          How to read this <ChevronRight size={13} />
        </Link>
      </div>
    </>
  );
}
