import React, { useEffect, useState } from 'react';
import { eventBus, EVENTS } from '../../core/EventBus';

export function CountDown({ lastRun, timeTaken }) {
  const [timeLeft, setTimeLeft] = useState(timeTaken);

  useEffect(() => {
    const updateCountdown = () => {
      if (!lastRun) {
        setTimeLeft(timeTaken);
        return;
      }
      const now = Date.now();
      const elapsed = now - lastRun;
      const remaining = Math.max(0, timeTaken - elapsed);
      setTimeLeft(remaining);
    };

    updateCountdown();

    const unsubscribe = eventBus.on(EVENTS.TICK, updateCountdown);
    return unsubscribe;
  }, [lastRun, timeTaken]);

  useEffect(() => {
    if (!lastRun) {
      setTimeLeft(timeTaken);
    }
  }, [lastRun, timeTaken]);

  return <div className="count-down-timer">{formatTime(timeLeft)}</div>;
}

const formatTime = (ms) => {
  let secondsLeft = Math.ceil(ms / 1000);
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft %= 3600;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return (
    String(hours).padStart(2, '0') +
    ':' +
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds).padStart(2, '0')
  );
};
