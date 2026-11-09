import { Check, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RunDetail } from '../../domain/types';
import { duration, number, utcDate } from '../../shared/format';

export function RunQualityPanel({ data }: { data: RunDetail }) {
  return (
    <div className="quality-panel">
      <div className="panel-heading">
        <div className="section-title">
          <h2>The data behind the line</h2>
          <span className="count-chip">{data.issues.length} findings</span>
        </div>
        <p>Data issues stay visible. They are never repaired into an apparently healthy run.</p>
      </div>
      {data.issues.length ? (
        data.issues.map((issue, index) => (
          <article className="quality-item" key={`${issue.kind}-${index}`}>
            <span className="quality-item-icon">
              <TriangleAlert size={18} />
            </span>
            <div>
              <h3>{issue.kind.replace(/[-_]/g, ' ')}</h3>
              <p>{issue.message}</p>
            </div>
            <span className="quality-count">{number(issue.count)} affected</span>
          </article>
        ))
      ) : (
        <div className="quality-clean">
          <Check size={21} />
          <div>
            <h3>No injected data-quality issues detected</h3>
            <p>The synthetic run contains finite values and ordered, unique steps.</p>
          </div>
        </div>
      )}
      <div className="quality-method">
        <Info size={18} />
        <p>
          Steps are sorted before plotting. For duplicate steps, the last received observation wins.
          Non-finite values and absent steps create explicit line breaks. Extrema are preserved
          independently for each metric; the line is never smoothed.
        </p>
      </div>
    </div>
  );
}

export function RunConfigurationPanel({ data }: { data: RunDetail }) {
  const { run } = data;
  const fields: [string, ReactNode][] = [
    ['Run ID', run.id],
    ['Model', run.model],
    ['Dataset', run.dataset],
    ['Source observations', number(run.pointCount)],
    ['Planned steps', number(run.maxSteps)],
    ['Started at', utcDate(run.startedAt)],
    ['Duration', duration(run.durationSeconds)],
    ['Data source', 'Deterministic synthetic fixture'],
    [
      'Source snapshot at',
      <time dateTime={data.source.recordedAt} title={data.source.recordedAt}>
        {utcDate(data.source.recordedAt)}
      </time>,
    ],
    ['Fixture revision', data.source.revision],
    [
      'View prepared at',
      <time dateTime={data.fetchedAt} title={data.fetchedAt}>
        {utcDate(data.fetchedAt)}
      </time>,
    ],
    ['Freshness meaning', 'Preparation time is not a newer training observation'],
    ['Update mode', 'Static snapshot; reload does not advance training'],
  ];
  return (
    <div className="config-panel">
      <div className="panel-heading">
        <h2>Run details</h2>
        <p>The recorded configuration of this synthetic experiment.</p>
      </div>
      <dl>
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
