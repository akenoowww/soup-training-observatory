import { Link } from 'react-router-dom';
import { Activity, ArrowRight, CircleAlert, Database, Keyboard, Layers3 } from 'lucide-react';
export function GuidePage() {
  return (
    <div className="page guide-page">
      <div className="page-eyebrow">
        <span className="eyebrow-dot" /> THE FIELD GUIDE
      </div>
      <h1>Look closer. Keep the signal.</h1>
      <p className="guide-intro">
        A training run is an expensive question. Here’s what these charts can help you answer, and
        where their limits are.
      </p>
      <div className="guide-grid">
        {[
          {
            icon: <Activity />,
            title: 'The spike survives the overview',
            text: 'The source series is grouped into step buckets. First, last, minimum, and maximum observations are retained per bucket, in source-step order. A one-point spike stays visible at every range that contains it. Zoom to investigate the surrounding signal.',
          },
          {
            icon: <CircleAlert />,
            title: 'A missing value is not zero',
            text: 'NaN and Infinity produce breaks in the line. Missing training steps also produce a break. Values are never silently interpolated. The Data quality tab explains the anomalies recorded in each run.',
          },
          {
            icon: <Layers3 />,
            title: 'Order is recovered. History is disclosed.',
            text: 'Steps are sorted numerically. If observations share a step, the last received observation wins; the duplicate count remains visible. No smoothing is applied, because a smooth line can hide divergence.',
          },
          {
            icon: <Database />,
            title: 'A snapshot, not a live service',
            text: 'All 20 runs are generated deterministically in your browser. Status describes the synthetic snapshot. Reloading refreshes the local view; it does not contact a training cluster or advance a real job. Export view downloads sampled points, not the raw series.',
          },
          {
            icon: <Activity />,
            title: 'A logarithm has a boundary',
            text: 'Logarithmic charts omit zero and negative values and report the excluded count. Those observations remain in linear mode. Axes use training steps, not dates. All dates elsewhere are explicitly displayed in UTC.',
          },
          {
            icon: <Keyboard />,
            title: 'There’s more than one way to zoom',
            text: 'Drag a region on any chart to zoom all three metrics. Use the zoom buttons or enter an exact step range without a mouse. Focus a chart and use arrow keys to inspect sampled points. Press Command or Control + K to find a run. Escape closes search.',
          },
        ].map((card) => (
          <article className="guide-card" key={card.title}>
            <span className="guide-icon">{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
      <div className="guide-end">
        <p>The chart is evidence. The decision is yours.</p>
        <Link className="button button--primary" to="/runs/run-001">
          Explore the million-point run <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
