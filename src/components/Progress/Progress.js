import React from 'react';
import { useGameTick } from '../../hooks/useGameTick';
import './Progress.css';

export function Progress({ timeTaken, lastRun, running }) {
  useGameTick();

  const width = calcWidth(timeTaken, lastRun, running);

  return (
    <div className="progress-bar">
      <span style={{ width }}></span>
    </div>
  );
}

const calcWidth = (timeTaken, lastRun, running) => {
  if (!running || !lastRun) {
    return '0%';
  }
  const elapsed = Date.now() - lastRun;
  const ratio = Math.min(1, elapsed / timeTaken);
  return `${ratio * 100}%`;
};
