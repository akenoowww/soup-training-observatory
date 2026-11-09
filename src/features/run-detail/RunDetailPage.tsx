import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Database,
  RefreshCw,
  TriangleAlert,
  X,
} from 'lucide-react';
import { RUNS } from '../../data/runs';
import { Status } from '../../components/Status';
import { compact, duration, metricNumber, number, utcDate } from '../../shared/format';
import { useSavedRun } from '../../shared/useSavedRun';
import { RunConfigurationPanel, RunQualityPanel } from './RunInfoPanels';
import { RunMetricsPanel } from './RunMetricsPanel';
import { constrainRange, parseRunView, zoomRange, type ChartScale, type RunTab } from './run-view';
import { useRunView } from './useRunView';
import type { Range, RunDetail } from '../../domain/types';

const TABS: readonly { value: RunTab; label: string }[] = [
  { value: 'metrics', label: 'Metrics' },
  { value: 'quality', label: 'Data quality' },
  { value: 'config', label: 'Run details' },
];

export function RunDetailPage() {
  const { runId = '' } = useParams();
  // Identity changes discard the observer's previous-data placeholder immediately.
  return <RunDetailView key={runId} runId={runId} />;
}

function RunDetailView({ runId }: { runId: string }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const run = RUNS.find((item) => item.id === runId);
  const requested = parseRunView(params, run?.steps ?? 0);
  const { query, container, data, displayedViewport, updating, ready } = useRunView(
    runId,
    requested.range,
    !!run,
  );
  const { saved, toggleSaved } = useSavedRun(runId);
  const [notice, setNotice] = useState('');

  function setRange(next?: Range) {
    const range = constrainRange(next, run?.steps ?? 0);
    setParams(
      (previous) => {
        const result = new URLSearchParams(previous);
        if (range) {
          result.set('min', String(range.min));
          result.set('max', String(range.max));
        } else {
          result.delete('min');
          result.delete('max');
        }
        return result;
      },
      { replace: true },
    );
  }

  function setTab(tab: RunTab) {
    setParams((previous) => {
      const result = new URLSearchParams(previous);
      if (tab === 'metrics') result.delete('tab');
      else result.set('tab', tab);
      return result;
    });
  }

  function setScale(scale: ChartScale) {
    setParams(
      (previous) => {
        const result = new URLSearchParams(previous);
        if (scale === 'log') result.set('scale', 'log');
        else result.delete('scale');
        return result;
      },
      { replace: true },
    );
  }

  function zoom(factor: number) {
    if (!data || !displayedViewport || updating) return;
    setRange(zoomRange(displayedViewport, data.metrics.loss.domain, factor));
  }

  function exportCsv() {
    if (!data || updating || query.isError) return;
    downloadSampledCsv(data);
    setNotice(
      'Sampled viewport exported. Blank values represent gaps; this is not the raw dataset.',
    );
  }

  if (!run)
    return (
      <div className="page empty-state">
        <TriangleAlert size={32} />
        <h1>Run not found</h1>
        <p>This run isn’t part of the workspace. Choose one from the experiment list.</p>
        <Link to="/" className="button button--primary">
          Back to training runs
        </Link>
      </div>
    );

  const index = RUNS.findIndex((item) => item.id === runId);
  // No metadata fallback: a full-run latest value is not a selected-range value.
  const latestAvailable = !!data && !updating && !query.isError;
  const latest = latestAvailable ? data.metrics.loss.latest : null;
  const latestCaption = query.isError
    ? 'Selected values unavailable'
    : updating
      ? 'Updating selected range…'
      : requested.range
        ? 'In selected range'
        : 'Latest recorded value';

  return (
    <div className="page detail-page" ref={container} data-run-id={runId} data-ready={ready}>
      <div className="detail-breadcrumb">
        <Link to="/">Training runs</Link>
        <ChevronRight size={13} />
        <span>{run.id}</span>
        <div className="run-pagination">
          <button
            className="icon-button"
            aria-label="Previous run"
            disabled={index === 0}
            onClick={() => navigate(`/runs/${RUNS[index - 1]!.id}`)}
          >
            <ArrowLeft size={15} />
          </button>
          <span>{index + 1} / 20</span>
          <button
            className="icon-button"
            aria-label="Next run"
            disabled={index === RUNS.length - 1}
            onClick={() => navigate(`/runs/${RUNS[index + 1]!.id}`)}
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <div className="page-heading detail-heading">
        <div>
          <div className="run-title-line">
            <h1>{run.name}</h1>
            <Status status={run.status} />
          </div>
          <div className="run-subtitle">
            <span>{run.model}</span>
            <span className="small-dot" />
            <span>{run.dataset}</span>
            <span className="small-dot" />
            <span>{utcDate(run.startedAt)}</span>
          </div>
        </div>
        <div className="heading-actions">
          <button
            className={`button icon-save ${saved ? 'is-saved' : ''}`}
            aria-label={saved ? 'Unsave run' : 'Save run'}
            aria-pressed={saved}
            onClick={() => setNotice(toggleSaved())}
          >
            <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button
            className="button"
            disabled={!data || updating || query.isError}
            onClick={exportCsv}
          >
            <ArrowDownToLine size={15} />
            Export view
          </button>
          <button
            className="button button--primary"
            disabled={updating}
            onClick={() => query.refetch()}
          >
            <RefreshCw size={15} className={updating ? 'spin' : ''} />
            Reload snapshot
          </button>
        </div>
      </div>
      <div className="run-tags">
        {run.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
        <span className="tag-outline">
          <Database size={11} />
          {compact(run.pointCount)} source points
        </span>
      </div>
      {requested.invalidRange && (
        <div className="chart-input-warning" role="alert">
          <TriangleAlert size={16} />
          <span>
            The requested step range is outside this run. Showing the full recorded range.
          </span>
          <button className="text-button" onClick={() => setRange()}>
            Reset range
          </button>
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          <Check size={15} />
          {notice}
          <button
            className="icon-button"
            onClick={() => setNotice('')}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="overview-grid detail-stats">
        <DetailStat
          label="Latest loss"
          value={metricNumber(latest)}
          unavailable={latest === null}
          icon={<Activity size={15} />}
        >
          <span className="stat-caption">
            {latestCaption}
            {latestAvailable && (
              <>
                <span className="small-dot" />
                Unsmoothed
              </>
            )}
          </span>
        </DetailStat>
        <DetailStat label="Training steps" value={number(run.steps)} icon={<Database size={15} />}>
          <span className="stat-caption">of {number(run.maxSteps)} planned steps</span>
        </DetailStat>
        <DetailStat
          label="Run duration"
          value={duration(run.durationSeconds)}
          icon={<Clock3 size={15} />}
        >
          <span className="stat-caption">At the recorded snapshot</span>
        </DetailStat>
        <DetailStat
          label="Quality findings"
          value={String(data?.issues.length ?? run.issueCount).padStart(2, '0')}
          icon={<TriangleAlert size={15} />}
          tone="yellow"
        >
          <button className="text-button" onClick={() => setTab('quality')}>
            Inspect data quality <ArrowRight size={12} />
          </button>
        </DetailStat>
      </div>
      <div className="detail-tabs" role="tablist" aria-label="Run views">
        {TABS.map(({ value, label }) => (
          <button
            role="tab"
            id={`tab-${value}`}
            aria-controls={`panel-${value}`}
            aria-selected={requested.tab === value}
            tabIndex={requested.tab === value ? 0 : -1}
            key={value}
            onClick={() => setTab(value)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const currentIndex = TABS.findIndex((tab) => tab.value === value);
              const nextIndex =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? TABS.length - 1
                    : (currentIndex + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) %
                      TABS.length;
              const next = TABS[nextIndex]!.value;
              setTab(next);
              document.getElementById(`tab-${next}`)?.focus();
            }}
          >
            {label}
            {value === 'quality' && !!data?.issues.length && (
              <span className="count-chip">{data.issues.length}</span>
            )}
          </button>
        ))}
        <div className="tabs-meta">
          <span className="small-dot" />
          Snapshot · not streaming
        </div>
      </div>
      {query.isError ? (
        <RunLoadError retry={() => query.refetch()} />
      ) : !data ? (
        <RunLoadingState />
      ) : (
        displayedViewport && (
          <section
            role="tabpanel"
            id={`panel-${requested.tab}`}
            aria-labelledby={`tab-${requested.tab}`}
          >
            {requested.tab === 'metrics' && (
              <RunMetricsPanel
                data={data}
                displayedViewport={displayedViewport}
                requestedRange={requested.range}
                scale={requested.scale}
                updating={updating}
                onRangeChange={setRange}
                onScaleChange={setScale}
                onZoom={zoom}
              />
            )}
            {requested.tab === 'quality' && <RunQualityPanel data={data} />}
            {requested.tab === 'config' && <RunConfigurationPanel data={data} />}
          </section>
        )
      )}
    </div>
  );
}

function DetailStat({
  label,
  value,
  children,
  icon,
  tone = '',
  unavailable = false,
}: {
  label: string;
  value: string;
  children: ReactNode;
  icon: ReactNode;
  tone?: string;
  unavailable?: boolean;
}) {
  return (
    <div className={`overview-card ${tone}`}>
      <div className="overview-label">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`detail-stat-value ${unavailable ? 'is-unavailable' : ''}`}>{value}</div>
      {children}
    </div>
  );
}

function RunLoadError({ retry }: { retry: () => void }) {
  return (
    <div className="error-state" role="alert">
      <TriangleAlert size={30} />
      <h2>We couldn’t load this run</h2>
      <p>The data worker couldn’t complete the request. Reload the snapshot to try again.</p>
      <button className="button button--primary" onClick={retry}>
        Try again <RefreshCw size={15} />
      </button>
      <Link to="/">Back to all runs</Link>
    </div>
  );
}

function RunLoadingState() {
  return (
    <div className="loading-state" role="status" aria-label="Loading run metrics">
      <div className="loading-caption">
        <RefreshCw size={16} className="spin" />
        Preparing training metrics…
      </div>
      <div className="skeleton-chart" />
      <div className="aux-grid">
        <div className="skeleton-chart small" />
        <div className="skeleton-chart small" />
      </div>
    </div>
  );
}

function downloadSampledCsv(data: RunDetail) {
  const rows = ['metric,step,value'];
  for (const [metric, series] of Object.entries(data.metrics)) {
    series.x.forEach((step, index) => rows.push(`${metric},${step},${series.y[index] ?? ''}`));
  }
  const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.run.id}-sampled-viewport.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
