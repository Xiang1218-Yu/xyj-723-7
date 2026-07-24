import { millisecondsToStr } from './time';

export const calculateProductionCycles = (business, fromTime, toTime) => {
  if (!business.quantityPurchased || !business.lastRun) {
    return { completedCycles: 0, earnings: 0, newLastRun: business.lastRun, remainderRunning: false };
  }

  const cycleMs = business.timeTaken * 1000;
  const startTime = Math.max(business.lastRun, fromTime);
  const elapsed = Math.max(0, toTime - startTime);
  const completedCycles = Math.floor(elapsed / cycleMs);
  const earnings = completedCycles * business.profit;
  const newLastRun = business.lastRun + completedCycles * cycleMs;
  const remainderRunning = (toTime - newLastRun) > 0 && elapsed >= 0;

  return { completedCycles, earnings, newLastRun, remainderRunning };
};

export const calculateOfflineEarnings = (state, closeTime, now = Date.now()) => {
  let totalEarnings = 0;
  const updatedBusinesses = { ...state.businesses };

  Object.values(state.businesses).forEach((item) => {
    const business = { ...item };
    const cycleMs = business.timeTaken * 1000;

    if (business.quantityPurchased && business.hasManager && business.lastRun) {
      const { completedCycles, earnings, newLastRun, remainderRunning } =
        calculateProductionCycles(business, closeTime, now);
      totalEarnings += earnings;
      business.lastRun = newLastRun;
      if (!remainderRunning && completedCycles === 0) {
        business.lastRun = now;
      }
      business.running = true;
    } else if (business.quantityPurchased && business.hasManager && !business.lastRun) {
      business.lastRun = now;
      business.running = true;
    } else if (
      business.quantityPurchased &&
      !business.hasManager &&
      business.running &&
      business.lastRun &&
      (closeTime - business.lastRun) < cycleMs
    ) {
      if ((now - business.lastRun) >= cycleMs) {
        totalEarnings += business.profit;
        business.running = false;
      }
    }

    updatedBusinesses[business.id] = business;
  });

  return {
    earnings: totalEarnings,
    awayDuration: millisecondsToStr(now - (closeTime || now)),
    updatedBusinesses,
  };
};

export const calculateTickEarnings = (business, now) => {
  if (!business.running || !business.lastRun || !business.quantityPurchased) {
    return { earnings: 0, completed: false, newLastRun: business.lastRun };
  }

  const cycleMs = business.timeTaken * 1000;
  const elapsed = now - business.lastRun;

  if (elapsed < cycleMs) {
    return { earnings: 0, completed: false, newLastRun: business.lastRun };
  }

  const completedCycles = Math.floor(elapsed / cycleMs);
  const earnings = completedCycles * business.profit;
  const newLastRun = business.lastRun + completedCycles * cycleMs;

  return { earnings, completed: true, completedCycles, newLastRun };
};

export const objectToList = (object) => {
  return Object.values(object).sort((a, b) => a.order - b.order);
};
