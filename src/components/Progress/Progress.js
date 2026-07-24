import React, { useEffect, useState } from 'react';
import { eventBus, EVENTS } from '../../core/EventBus';
import './Progress.css';

export function Progress({ lastRun, timeTaken }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      if (!lastRun) {
        setWidth(0);
        return;
      }
      const now = Date.now();
      const elapsed = now - lastRun;
      const pct = Math.min(100, (elapsed / timeTaken) * 100);
      setWidth(`${pct}%`);
    };

    updateProgress();

    const unsubscribe = eventBus.on(EVENTS.TICK, updateProgress);
    return unsubscribe;
  }, [lastRun, timeTaken]);

  useEffect(() => {
    if (!lastRun) {
      setWidth(0);
    }
  }, [lastRun]);

  return (
    <div className="progress-bar">
      <span style={{ width }}></span>
    </div>
  );
}
