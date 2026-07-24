import React from 'react';
import { useGameClock } from '../../hooks/useGameClock';
import './Progress.css';

// Presentational progress bar. Its fill is derived every frame from the shared
// game clock and the business's `lastRun` timestamp — no local timer/interval.
// When `lastRun` is falsy the business isn't running, so the bar sits empty.
export function Progress({ timeTaken, lastRun }) {
  const now = useGameClock();

  let width = 0;
  if (lastRun) {
    const pct = (100 * (now - lastRun)) / timeTaken;
    width = Math.min(100, Math.max(0, pct));
  }

  return (
    <div className="progress-bar">
      <span style={{ width: `${width}%` }}></span>
    </div>
  );
}
