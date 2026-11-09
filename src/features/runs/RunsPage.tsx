import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Layers3,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { RUNS } from '../../data/runs';
import type { RunSummary } from '../../domain/types';
import { Status } from '../../components/Status';
import { compact, duration, metricNumber, number, utcDate } from '../../shared/format';

type Sort = 'recent' | 'loss' | 'steps' | 'name';
export function RunsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const status = params.get('status') ?? 'all';
  const sort = (params.get('sort') ?? 'recent') as Sort;
  const update = (key: string, value: string) =>
    setParams((old) => {
      const next = new URLSearchParams(old);
      if (!value || value === 'all' || (key === 'sort' && value === 'recent')) next.delete(key);
      else next.set(key, value);
      return next;
    });
  const filtered = useMemo(
    () =>
      RUNS.filter(
        (run) =>
          (status === 'all' || run.status === status) &&
          `${run.name} ${run.model} ${run.dataset} ${run.tags.join(' ')}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ).sort((a, b) =>
        sort === 'loss'
          ? (a.loss ?? Infinity) - (b.loss ?? Infinity)
          : sort === 'steps'
            ? b.steps - a.steps
            : sort === 'name'
              ? a.name.localeCompare(b.name)
              : Date.parse(b.startedAt) - Date.parse(a.startedAt),
      ),
    [search, status, sort],
  );
  const counts = {
    running: RUNS.filter((r) => r.status === 'running').length,
    completed: RUNS.filter((r) => r.status === 'completed').length,
    issues: RUNS.filter((r) => r.issueCount > 0).length,
  };
  return (
    <div className="page runs-page">
      <div className="page-eyebrow">
        <span className="eyebrow-dot" /> THE EXPERIMENT LOG
      </div>
      <div className="page-heading">
        <div>
          <h1>Every run. A clearer picture.</h1>
          <p>Your training experiments, with the whole story left in.</p>
        </div>
        <Link className="button button--primary" to={`/runs/${RUNS[0].id}`}>
          Explore a run <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="overview-grid">
        <Overview
          label="Total experiments"
          value="20"
          hint="Foundation models"
          icon={<Layers3 size={17} />}
        />
        <Overview
          label="Running in snapshot"
          value={String(counts.running).padStart(2, '0')}
          hint="Frozen synthetic snapshot"
          icon={<Activity size={17} />}
          tone="green"
        />
        <Overview
          label="Completed"
          value={String(counts.completed).padStart(2, '0')}
          hint="Finished in snapshot"
          icon={<Check size={17} />}
          tone="blue"
        />
        <Overview
          label="Runs with data issues"
          value={String(counts.issues).padStart(2, '0')}
          hint="Worth a closer look"
          icon={<CircleAlert size={17} />}
          tone="yellow"
        />
      </div>
      <div className="section-heading">
        <div className="section-title">
          <h2>Training runs</h2>
          <span className="count-chip">20</span>
        </div>
        <span className="section-caption">Good decisions start with honest data.</span>
      </div>
      <div className="run-browser">
        <div className="browser-toolbar">
          <div className="filter-tabs" role="group" aria-label="Filter runs by status">
            {[
              ['all', 'All runs'],
              ['running', 'Running'],
              ['completed', 'Completed'],
              ['failed', 'Failed'],
              ['stopped', 'Stopped'],
            ].map(([value, label]) => (
              <button
                className={status === value ? 'selected' : ''}
                key={value}
                onClick={() => update('status', value)}
              >
                {label}
                {value === 'all' && <span>{RUNS.length}</span>}
              </button>
            ))}
          </div>
          <div className="table-controls">
            <div className="table-search">
              <Search size={15} />
              <label className="sr-only" htmlFor="filter-runs">
                Search runs
              </label>
              <input
                id="filter-runs"
                placeholder="Search runs…"
                value={search}
                onChange={(e) => update('q', e.target.value)}
              />
              {search && (
                <button
                  aria-label="Clear search"
                  className="icon-button"
                  onClick={() => update('q', '')}
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <label className="sort-control">
              <ArrowDownWideNarrow size={15} />
              <span className="sr-only">Sort runs</span>
              <select
                aria-label="Sort runs"
                value={sort}
                onChange={(e) => update('sort', e.target.value)}
              >
                <option value="recent">Most recent</option>
                <option value="loss">Lowest loss</option>
                <option value="steps">Most steps</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>
        <div className="table-scroll">
          <table className="runs-table">
            <thead>
              <tr>
                <th scope="col">Run name</th>
                <th scope="col">Status</th>
                <th scope="col">Loss</th>
                <th scope="col">Training steps</th>
                <th scope="col">Duration</th>
                <th scope="col">
                  Started at <span className="utc-label">UTC</span>
                </th>
                <th scope="col">
                  <span className="sr-only">Data issues</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((run) => (
                <RunRow key={run.id} run={run} />
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="empty-state">
            <div className="empty-icon">
              <SlidersHorizontal size={26} />
            </div>
            <h3>No runs in this view</h3>
            <p>Try a different search or clear your filters.</p>
            <button className="button" onClick={() => setParams({})}>
              Clear filters
            </button>
          </div>
        )}
        <div className="table-footer">
          <span>
            Showing <strong>{filtered.length}</strong> of <strong>{RUNS.length}</strong> experiments
          </span>
          <span>
            All timestamps in UTC <span className="small-dot" /> Deterministic demo
          </span>
        </div>
      </div>
      <div className="insight-banner">
        <div className="insight-icon">
          <Activity size={21} />
        </div>
        <div>
          <h3>One million points. One spike. Nothing swept away.</h3>
          <p>Open the large-series run to see why a smooth chart isn’t always an honest one.</p>
        </div>
        <Link to={`/runs/${RUNS[0].id}`}>
          Investigate the signal <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
function Overview({
  label,
  value,
  hint,
  icon,
  tone = '',
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className={`overview-card ${tone}`}>
      <div className="overview-label">
        <span>{label}</span>
        {icon}
      </div>
      <div className="overview-value">
        {value}
        <span className="overview-dash" />
      </div>
      <div className="overview-hint">
        <span className="small-dot" />
        {hint}
      </div>
    </div>
  );
}
function RunRow({ run }: { run: RunSummary }) {
  return (
    <tr>
      <td>
        <Link className="run-name" to={`/runs/${run.id}`}>
          <span className={`run-icon ${run.status}`}>
            <Activity size={17} />
          </span>
          <span>
            <strong>{run.name}</strong>
            <small>
              {run.model} <span className="small-dot" aria-hidden="true" /> {run.dataset}
            </small>
          </span>
          <ArrowUpRight className="row-arrow" size={14} />
        </Link>
      </td>
      <td>
        <Status status={run.status} />
      </td>
      <td className="number-cell">
        <span className={run.loss === null ? 'muted' : ''}>{metricNumber(run.loss)}</span>
      </td>
      <td>
        <div className="step-cell">
          <span className="number-cell">
            {compact(run.steps)}
            <small> / {compact(run.maxSteps)}</small>
          </span>
          <span className="progress-track">
            <span
              style={{
                width: `${Math.min(100, (run.steps / run.maxSteps) * 100)}%`,
              }}
            />
          </span>
        </div>
      </td>
      <td className="number-cell muted">{duration(run.durationSeconds)}</td>
      <td className="date-cell" title={utcDate(run.startedAt)}>
        {utcDate(run.startedAt).replace(' UTC', '')}
      </td>
      <td>
        {run.issueCount > 0 ? (
          <Link
            to={`/runs/${run.id}?tab=quality`}
            className="issue-pill"
            aria-label={`${number(run.issueCount)} data issues in ${run.name}`}
          >
            <CircleAlert size={12} />
            {run.issueCount}
          </Link>
        ) : (
          <span className="no-issues" title="No injected data issues">
            —
          </span>
        )}
      </td>
    </tr>
  );
}
