import { eventBus, EVENTS } from './EventBus';
import { increaseBalance, setLastRun, setLastRunAt } from '../redux/actions';
import { objectToList } from '../utils/game';
import { computeEarnings } from '../utils/earnings';

export class BusinessSystem {
  constructor(store) {
    this.store = store;
    this.unsubscribeTick = null;
  }

  init() {
    this.unsubscribeTick = eventBus.on(EVENTS.TICK, ({ currentTime }) => {
      this.tick(currentTime);
    });
  }

  destroy() {
    if (this.unsubscribeTick) {
      this.unsubscribeTick();
      this.unsubscribeTick = null;
    }
  }

  tick(now) {
    let businesses = objectToList(this.store.getState().businesses);

    businesses.forEach((business) => {
      if (!business.quantityPurchased) return;
      if (business.hasManager && !business.lastRun) {
        this.store.dispatch(setLastRun(business.id));
      }
    });

    businesses = objectToList(this.store.getState().businesses);

    const { totalEarning, updates, details } = computeEarnings(businesses, {
      endTime: now,
      getStartTime: (b) => b.lastRun,
      isManualInProgress: () => true,
    });

    if (totalEarning > 0) {
      this.store.dispatch(increaseBalance(totalEarning));
    }

    Object.entries(updates).forEach(([businessId, newLastRun]) => {
      this.store.dispatch(setLastRunAt(businessId, newLastRun));
    });

    details.forEach(({ businessId, profit, completedCycles }) => {
      eventBus.emit(EVENTS.BUSINESS_COMPLETE, { businessId, profit, completedCycles });
    });
  }
}
