import { Component, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="fatal-state">
          <TriangleAlert size={36} />
          <h1>Something interrupted the workspace</h1>
          <p>Reload to restart the data worker and open your runs again.</p>
          <button className="button button--primary" onClick={() => window.location.reload()}>
            Reload workspace
          </button>
        </main>
      );
    return this.props.children;
  }
}
