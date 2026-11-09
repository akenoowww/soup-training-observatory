import { useEffect, useState } from 'react';

const STORAGE_KEY = 'soup:saved-runs';

export function parseSavedRuns(value: string | null): string[] {
  if (value === null) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === 'string')) {
    throw new Error('Saved runs must be an array of run identifiers.');
  }
  return [...new Set(parsed)];
}

function readSavedRuns(): string[] {
  try {
    return parseSavedRuns(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/** Browser storage is optional; a blocked or malformed store cannot crash a run. */
export function useSavedRun(runId: string) {
  const [saved, setSaved] = useState(() => readSavedRuns().includes(runId));
  useEffect(() => {
    const update = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        setSaved(readSavedRuns().includes(runId));
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [runId]);

  function toggleSaved(): string {
    try {
      let reset = false;
      let ids: string[];
      try {
        ids = parseSavedRuns(localStorage.getItem(STORAGE_KEY));
      } catch {
        ids = [];
        reset = true;
      }
      const nextSaved = !ids.includes(runId);
      const next = nextSaved ? [...ids, runId] : ids.filter((id) => id !== runId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(nextSaved);
      if (reset)
        return 'Saved runs were reset because browser storage was invalid. This run is now saved.';
      return nextSaved ? 'Run saved in this browser.' : 'Run removed from saved runs.';
    } catch {
      return 'Your browser could not save this run.';
    }
  }
  return { saved, toggleSaved };
}
