import React from 'react';
import { useGameClock } from '../../hooks/useGameClock';

// Presentational countdown. Time remaining is derived every frame from the
// shared game clock and the business's `lastRun` timestamp — no local timer.
// When idle (no lastRun) it shows the full cycle duration.
export function CountDown({ timeTaken, lastRun }) {
  const now = useGameClock();

  let timeLeft = timeTaken;
  if (lastRun) {
    timeLeft = Math.max(0, timeTaken - (now - lastRun));
  }

  return (
    <div className="count-down-timer">
      {formatTime(timeLeft)}
    </div>
  );
}

const formatTime = (timeLeft) => {
  let secondsLeft = Math.ceil(timeLeft/1000);
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft %= 3600;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');
}
