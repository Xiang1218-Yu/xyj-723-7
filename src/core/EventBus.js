// A tiny synchronous publish/subscribe bus used across the game.
// It replaces the scattered per-component timers/callbacks with a single
// place to broadcast game-wide events (frame ticks, audit records, action
// log entries, save notifications, ...).

// Well-known event names. Using constants avoids typos across the codebase.
export const GameEvents = {
  TICK: 'tick',            // emitted every animation frame with the frame timestamp
  ACTION: 'action',        // emitted for every dispatched redux action (event log)
  AUDIT: 'audit',          // emitted for key transactions (audit log)
  SAVED: 'saved',          // emitted whenever the state is persisted
  PAUSED: 'paused',        // emitted when the game loop pauses (tab hidden)
  RESUMED: 'resumed',      // emitted when the game loop resumes (tab visible)
};

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  // Subscribe to an event. Returns an unsubscribe function.
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(event, payload) {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }
    // Iterate over a copy so handlers can unsubscribe during emission.
    [...handlers].forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.warn(`EventBus handler for "${event}" failed`, error);
      }
    });
  }
}

// Single shared instance for the whole app.
const eventBus = new EventBus();

export default eventBus;
