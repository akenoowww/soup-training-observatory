import { useEffect, useRef, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, BookOpen, Command, FlaskConical, Layers3, Menu, Search, X } from 'lucide-react';
import { RunsPage } from '../features/runs/RunsPage';
import { RunDetailPage } from '../features/run-detail/RunDetailPage';
import { GuidePage } from '../features/runs/GuidePage';
import { RUNS } from '../data/runs';
import { Status } from '../components/Status';

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(value => !value); }
      if (event.key === 'Escape') { setSearchOpen(false); setMobileOpen(false); }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  useEffect(() => {
    if (!searchOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    searchRef.current?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, [searchOpen]);
  const matches = RUNS.filter(run => `${run.name} ${run.model} ${run.id}`.toLowerCase().includes(search.toLowerCase())).slice(0, 8);
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
      <NavLink to="/" className="brand" aria-label="Soup home"><SoupMark/><span>soup<span className="brand-period">.</span></span></NavLink>
      <div className="workspace-selector"><span className="workspace-avatar">O</span><span><strong>Observatory</strong><small>Demo workspace</small></span></div>
      <button className="sidebar-search" onClick={() => setSearchOpen(true)}><Search size={15}/><span>Find a run</span><kbd>⌘ K</kbd></button>
      <p className="nav-label">WORKSPACE</p>
      <nav><NavLink to="/" end className={({isActive}) => `nav-item ${isActive || location.pathname.startsWith('/runs/') ? 'active' : ''}`}><Layers3 size={17}/><span>Training runs</span><span className="nav-count">20</span></NavLink><NavLink to="/guide" className="nav-item"><BookOpen size={17}/><span>Field guide</span><ArrowUpRight className="nav-end" size={14}/></NavLink></nav>
      <div className="sidebar-project"><span className="nav-label">PROJECT</span><span className="project-item"><span className="project-dot"/> Foundation models</span><small>20 experiments · 3 metrics</small></div>
      <div className="sidebar-bottom"><div className="demo-note"><FlaskConical size={16}/><div><strong>A little room to experiment.</strong><p>Explore synthetic runs. Your production training is untouched.</p></div></div><div className="profile"><span className="profile-avatar">SC</span><span><strong>Soup collective</strong><small>Research workspace</small></span></div></div>
    </aside>
    <div className="app-body"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><span className="topbar-project">Foundation models</span><span className="slash">/</span><span>{location.pathname === '/guide' ? 'Field guide' : 'Training runs'}</span></div><div className="topbar-right"><span className="demo-badge"><span/>Synthetic data</span><span className="topbar-separator"/><button className="icon-button" aria-label="Search runs" onClick={() => setSearchOpen(true)}><Search size={17}/></button><span className="mini-avatar">SC</span></div></header>
      <main id="main" tabIndex={-1}><Routes><Route path="/" element={<RunsPage/>}/><Route path="/runs/:runId" element={<RunDetailPage/>}/><Route path="/guide" element={<GuidePage/>}/><Route path="*" element={<div className="empty-state"><h1>This page wandered off</h1><p>Return to your training runs to pick up where you left off.</p><NavLink className="button button--primary" to="/">Back to runs</NavLink></div>}/></Routes></main>
      <footer className="app-footer"><span><Activity size={13}/> Built for the signal, including the noise.</span><span>SOUP OBSERVATORY <span className="footer-version">/ 1.0</span></span></footer>
    </div>
    {searchOpen && <div className="modal-backdrop" onClick={() => setSearchOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="search-title" className="command-dialog" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Tab'){const items=e.currentTarget.querySelectorAll<HTMLElement>('button,input'); const first=items[0],last=items[items.length-1]; if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}><div className="command-input"><Search size={19}/><label className="sr-only" id="search-title" htmlFor="run-search">Find a training run</label><input id="run-search" ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, model, or run ID…"/><button className="icon-button" aria-label="Close search" onClick={()=>setSearchOpen(false)}><X size={18}/></button></div><div className="command-results">{matches.map(run=><button key={run.id} onClick={()=>{navigate(`/runs/${run.id}`);setSearchOpen(false);setSearch('');}}><span className="run-icon"><Activity size={16}/></span><span><strong>{run.name}</strong><small>{run.model}</small></span><Status status={run.status}/></button>)}{!matches.length&&<p className="command-empty">No runs match “{search}”. Try another name.</p>}</div><div className="command-footer"><Command size={12}/> K to toggle <span>ESC to close</span></div></section></div>}
  </div>;
}
function SoupMark(){return <svg width="29" height="29" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 8h14a5 5 0 0 1 0 10h-7a4 4 0 0 0 0 8h14M5 14h14a1 1 0 0 0 0-2H5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;}
