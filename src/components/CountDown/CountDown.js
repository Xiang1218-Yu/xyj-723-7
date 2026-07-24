import React from 'react';
import { useGameTick } from '../../hooks/useGameTick';

export function CountDown({ timeTaken, lastRun, running }) {
  useGameTick();

  const timeLeft = calcTimeLeft(timeTaken, lastRun, running);

  return <div className="count-down-timer">{formatTime(timeLeft)}</div>;
}

const calcTimeLeft = (timeTaken, lastRun, running) => {
  const cycleMs = timeTaken;
  if (!running || !lastRun) {
    return cycleMs;
  }
  const elapsed = Date.now() - lastRun;
  const remaining = cycleMs - elapsed;
  return remaining > 0 ? remaining : 0;
};

const formatTime = (timeLeft) => {
  let secondsLeft = Math.ceil(timeLeft / 1000);
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
