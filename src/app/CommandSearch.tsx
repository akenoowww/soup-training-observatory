import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Command, Search, X } from 'lucide-react';
import { RUNS } from '../data/runs';
import { Status } from '../components/Status';
import { Dialog } from '../components/Dialog';

export function CommandSearch({ onDismiss }: { onDismiss: () => void }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const matches = RUNS.filter((run) =>
    `${run.name} ${run.model} ${run.id}`.toLowerCase().includes(search.toLowerCase()),
  ).slice(0, 8);
  return (
    <Dialog
      className="command-dialog command-modal"
      labelledBy="search-title"
      onDismiss={onDismiss}
    >
      <div className="command-input">
        <Search size={19} />
        <label className="sr-only" id="search-title" htmlFor="run-search">
          Find a training run
        </label>
        <input
          id="run-search"
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, model, or run ID…"
        />
        <button className="icon-button" aria-label="Close search" onClick={onDismiss}>
          <X size={18} />
        </button>
      </div>
      <div className="command-results">
        {matches.map((run) => (
          <button
            key={run.id}
            onClick={() => {
              navigate(`/runs/${run.id}`);
              onDismiss();
            }}
          >
            <span className="run-icon">
              <Activity size={16} />
            </span>
            <span>
              <strong>{run.name}</strong>
              <small>{run.model}</small>
            </span>
            <Status status={run.status} />
          </button>
        ))}
        {!matches.length && (
          <p className="command-empty">No runs match “{search}”. Try another name.</p>
        )}
      </div>
      <div className="command-footer">
        <Command size={12} /> K to toggle <span>ESC to close</span>
      </div>
    </Dialog>
  );
}
