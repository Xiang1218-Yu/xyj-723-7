export function computeEarnings(businesses, options) {
  const { endTime, getStartTime, isManualInProgress } = options;

  let totalEarning = 0;
  const updates = {};
  const details = [];

  businesses.forEach((business) => {
    if (!business.quantityPurchased) return;

    const startTime = getStartTime(business);
    if (startTime == null) return;

    const cycleMs = business.timeTaken * 1000;
    const elapsed = endTime - startTime;

    if (elapsed < cycleMs) return;

    if (business.hasManager) {
      const completedTimes = Math.floor(elapsed / cycleMs);
      const profit = completedTimes * business.profit;
      totalEarning += profit;
      const remainder = elapsed % cycleMs;
      updates[business.id] = endTime - remainder;
      details.push({ businessId: business.id, profit, completedCycles: completedTimes });
    } else {
      if (!isManualInProgress || isManualInProgress(business, startTime)) {
        totalEarning += business.profit;
        updates[business.id] = null;
        details.push({ businessId: business.id, profit: business.profit, completedCycles: 1 });
      }
    }
  });

  return { totalEarning, updates, details };
}
