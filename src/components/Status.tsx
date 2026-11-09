import type { RunStatus } from '../domain/types';
const labels: Record<RunStatus, string> = { running: 'Running', completed: 'Completed', failed: 'Failed', stopped: 'Stopped' };
export function Status({ status }: { status: RunStatus }) {
  return <span className={`status status--${status}`}><span aria-hidden="true" />{labels[status]}</span>;
}
