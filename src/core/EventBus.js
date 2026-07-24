class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[EventBus] Error in listener for "${event}":`, e);
        }
      });
    }
  }

  removeAll() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  TICK: 'game:tick',
  BUSINESS_COMPLETE: 'business:complete',
  BUSINESS_START: 'business:start',
  BALANCE_CHANGE: 'balance:change',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  SAVE: 'game:save',
  AWAY_EARNINGS: 'game:awayEarnings',
};
