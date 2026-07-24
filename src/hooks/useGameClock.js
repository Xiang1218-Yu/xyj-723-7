import { useEffect, useState } from 'react';
import eventBus, { GameEvents } from '../core/EventBus';

// Subscribes a component to the shared game clock. Every animation frame the
// BusinessSystem emits a TICK, and this hook re-renders the component with the
// latest timestamp. This replaces the per-component setInterval timers that
// used to drive progress bars and countdowns — there is now a single clock.
export function useGameClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const unsubscribe = eventBus.on(GameEvents.TICK, ({ now }) => setNow(now));
    return unsubscribe;
  }, []);

  return now;
}
