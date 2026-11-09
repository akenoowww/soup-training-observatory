import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Activity, Menu, Search } from 'lucide-react';
import { RunsPage } from '../features/runs/RunsPage';
import { RunDetailPage } from '../features/run-detail/RunDetailPage';
import { GuidePage } from '../features/runs/GuidePage';
import { Dialog } from '../components/Dialog';
import { useMediaQuery } from '../shared/useMediaQuery';
import { Sidebar } from './Sidebar';
import { CommandSearch } from './CommandSearch';

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobile = useMediaQuery('(max-width: 760px)');
  const location = useLocation();
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMobileOpen(false);
        setSearchOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  function openSearch() {
    setMobileOpen(false);
    setSearchOpen(true);
  }
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById('main');
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      {!mobile && <Sidebar onSearch={openSearch} />}
      {mobile && mobileOpen && (
        <Dialog
          className="mobile-navigation"
          label="Main navigation"
          onDismiss={() => setMobileOpen(false)}
        >
          <Sidebar mobile onSearch={openSearch} onClose={() => setMobileOpen(false)} />
        </Dialog>
      )}
      <div className="app-body">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
              onClick={(event) => {
                event.currentTarget.focus();
                setMobileOpen(true);
              }}
            >
              <Menu size={20} />
            </button>
            <span className="topbar-project">Foundation models</span>
            <span className="slash">/</span>
            <span>{location.pathname === '/guide' ? 'Field guide' : 'Training runs'}</span>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span />
              Synthetic data
            </span>
            <span className="topbar-separator" />
            <button
              className="icon-button"
              aria-label="Search runs"
              aria-haspopup="dialog"
              onClick={(event) => {
                event.currentTarget.focus();
                openSearch();
              }}
            >
              <Search size={17} />
            </button>
            <span className="mini-avatar">SC</span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<RunsPage />} />
            <Route path="/runs/:runId" element={<RunDetailPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h1>This page wandered off</h1>
                  <p>Return to your training runs to pick up where you left off.</p>
                  <NavLink className="button button--primary" to="/">
                    Back to runs
                  </NavLink>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>
            <Activity size={13} /> Built for the signal, including the noise.
          </span>
          <span>
            SOUP OBSERVATORY <span className="footer-version">/ 1.0</span>
          </span>
        </footer>
      </div>
      {searchOpen && <CommandSearch onDismiss={() => setSearchOpen(false)} />}
    </div>
  );
}
