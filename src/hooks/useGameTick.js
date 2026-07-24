import { useState, useEffect } from 'react';
import gameLoop from '../core/GameLoop';

export function useGameTick() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = gameLoop.subscribe(() => {
      setTick((t) => (t + 1) % 1000000);
    });
    return unsubscribe;
  }, []);
}
