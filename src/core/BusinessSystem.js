import gameLoop from './GameLoop';
import eventBus, { GameEvents } from './EventBus';
import { calculateTickEarnings } from '../utils/game';
import { startProduction, productionComplete } from '../redux/actions';

class BusinessSystem {
  constructor(store) {
    this.store = store;
    this._unsubscribeLoop = null;
    this._boundTick = this._tick.bind(this);
  }

  start() {
    this._unsubscribeLoop = gameLoop.subscribe(this._boundTick);
    this._autoStartManagers();
  }

  stop() {
    if (this._unsubscribeLoop) {
      this._unsubscribeLoop();
      this._unsubscribeLoop = null;
    }
  }

  _autoStartManagers() {
    const state = this.store.getState();
    Object.values(state.businesses).forEach((business) => {
      if (
        business.quantityPurchased > 0 &&
        business.hasManager &&
        !business.running
      ) {
        this.store.dispatch(startProduction(business.id));
        eventBus.emit(GameEvents.PRODUCTION_START, { businessId: business.id, auto: true });
      }
    });
  }

  _tick(delta, now) {
    const state = this.store.getState();
    const businesses = state.businesses;

    Object.values(businesses).forEach((business) => {
      if (!business.quantityPurchased) return;

      if (!business.running && business.hasManager) {
        this.store.dispatch(startProduction(business.id));
        eventBus.emit(GameEvents.PRODUCTION_START, { businessId: business.id, auto: true });
        return;
      }

      if (business.running && business.lastRun) {
        const result = calculateTickEarnings(business, now);
        if (result.completed) {
          this.store.dispatch(
            productionComplete(
              business.id,
              result.earnings,
              result.newLastRun,
              business.hasManager
            )
          );
        }
      }
    });
  }
}

let businessSystemInstance = null;

export const initBusinessSystem = (store) => {
  if (businessSystemInstance) {
    businessSystemInstance.stop();
  }
  businessSystemInstance = new BusinessSystem(store);
  businessSystemInstance.start();
  return businessSystemInstance;
};

export const getBusinessSystem = () => businessSystemInstance;

export default BusinessSystem;
