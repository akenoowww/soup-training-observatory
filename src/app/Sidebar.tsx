import { NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, BookOpen, FlaskConical, Layers3, Search, X } from 'lucide-react';

export function Sidebar({
  mobile,
  onSearch,
  onClose,
}: {
  mobile?: boolean;
  onSearch: () => void;
  onClose?: () => void;
}) {
  const location = useLocation();
  return (
    <aside className={`sidebar ${mobile ? 'is-open' : ''}`} aria-label="Workspace">
      <div className="brand-row">
        <NavLink to="/" className="brand" aria-label="Soup home">
          <SoupMark />
          <span>
            soup<span className="brand-period">.</span>
          </span>
        </NavLink>
        {mobile && (
          <button className="icon-button" aria-label="Close navigation" onClick={onClose}>
            <X size={18} />
          </button>
        )}
      </div>
      <div className="workspace-selector">
        <span className="workspace-avatar">O</span>
        <span>
          <strong>Observatory</strong>
          <small>Demo workspace</small>
        </span>
      </div>
      <button
        className="sidebar-search"
        onClick={(event) => {
          event.currentTarget.focus();
          onSearch();
        }}
      >
        <Search size={15} />
        <span>Find a run</span>
        <kbd>⌘ K</kbd>
      </button>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${isActive || location.pathname.startsWith('/runs/') ? 'active' : ''}`
          }
        >
          <Layers3 size={17} />
          <span>Training runs</span>
          <span className="nav-count">20</span>
        </NavLink>
        <NavLink to="/guide" className="nav-item">
          <BookOpen size={17} />
          <span>Field guide</span>
          <ArrowUpRight className="nav-end" size={14} />
        </NavLink>
      </nav>
      <div className="sidebar-project">
        <span className="nav-label">PROJECT</span>
        <span className="project-item">
          <span className="project-dot" /> Foundation models
        </span>
        <small>20 experiments · 3 metrics</small>
      </div>
      <div className="sidebar-bottom">
        <div className="demo-note">
          <FlaskConical size={16} />
          <div>
            <strong>A little room to experiment.</strong>
            <p>Explore synthetic runs. Your production training is untouched.</p>
          </div>
        </div>
        <div className="profile">
          <span className="profile-avatar">SC</span>
          <span>
            <strong>Soup collective</strong>
            <small>Research workspace</small>
          </span>
        </div>
      </div>
    </aside>
  );
}

function SoupMark() {
  return (
    <svg width="29" height="29" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M5 8h14a5 5 0 0 1 0 10h-7a4 4 0 0 0 0 8h14M5 14h14a1 1 0 0 0 0-2H5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
