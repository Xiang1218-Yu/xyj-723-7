// Unified production logic shared by the live game loop and the offline
// (away) earnings calculation. Both paths ask the same question: "given a
// business, its last run timestamp and a target time, how many production
// cycles completed and how much did they earn?" — keeping a single
// implementation guarantees online and offline income never diverge.

// Computes completed cycles + earnings for a single business between
// `fromTime` (its lastRun) and `toTime`.
//
// - Managed businesses run continuously, so they complete a cycle every
//   `timeTaken` seconds and immediately restart.
// - Unmanaged businesses run a single cycle after being started manually and
//   then stop until clicked again.
//
// Returns { earning, newLastRun, completed } where `completed` is the number
// of finished cycles (0 or more). `newLastRun` is the advanced timestamp the
// caller should store back on the business.
export const computeBusinessProduction = (business, fromTime, toTime) => {
  const result = { earning: 0, newLastRun: business.lastRun, completed: 0 };

  if (!business.quantityPurchased || !business.lastRun) {
    return result;
  }

  const cycleMs = business.timeTaken * 1000;
  const elapsed = toTime - fromTime;
  if (elapsed < cycleMs) {
    return result;
  }

  if (business.hasManager) {
    // Managed: as many whole cycles as fit into the elapsed window.
    const completed = Math.floor(elapsed / cycleMs);
    result.completed = completed;
    result.earning = completed * business.profit;
    result.newLastRun = fromTime + completed * cycleMs;
  } else {
    // Unmanaged: at most one cycle then it idles.
    result.completed = 1;
    result.earning = business.profit;
    result.newLastRun = fromTime + cycleMs;
  }

  return result;
};

// Applies production for every business in a businesses map up to `toTime`.
// Each business is measured from its own `lastRun`. Returns
// { businesses, earning } with an updated (immutable) businesses map and the
// total earning. Managed businesses whose lastRun is missing are seeded to
// `toTime` so their clock starts now.
export const applyProduction = (businesses, toTime) => {
  let totalEarning = 0;
  let changed = false;
  const next = {};

  Object.values(businesses).forEach(business => {
    let updated = business;

    if (business.quantityPurchased && business.hasManager && !business.lastRun) {
      updated = { ...business, lastRun: toTime };
      changed = true;
    } else if (business.lastRun) {
      const { earning, newLastRun, completed } = computeBusinessProduction(
        business,
        business.lastRun,
        toTime
      );
      if (completed > 0) {
        totalEarning += earning;
        changed = true;
        updated = {
          ...business,
          lastRun: business.hasManager ? newLastRun : null,
        };
      }
    }

    next[business.id] = updated;
  });

  return { businesses: next, earning: totalEarning, changed };
};
