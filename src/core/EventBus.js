class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (payload) => {
      this.off(event, wrapper);
      callback(payload);
    };
    return this.on(event, wrapper);
  }

  off(event, callback) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this._listeners.delete(event);
      }
    }
  }

  emit(event, payload) {
    const set = this._listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[EventBus] listener error for "${event}":`, err);
        }
      });
    }
  }

  clear() {
    this._listeners.clear();
  }
}

const eventBus = new EventBus();

export const GameEvents = {
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_TICK: 'game:tick',
  PRODUCTION_START: 'production:start',
  PRODUCTION_COMPLETE: 'production:complete',
  AUTOSAVE: 'game:autosave',
  OFFLINE_EARNINGS_CALCULATED: 'earnings:offline',
  BALANCE_CHANGED: 'balance:changed',
  BUSINESS_BOUGHT: 'business:bought',
  MANAGER_HIRED: 'manager:hired',
};

export default eventBus;
