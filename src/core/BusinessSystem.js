// BusinessSystem is the single game loop for the whole app. It replaces the
// per-component setInterval timers with one requestAnimationFrame driver that:
//   * emits a TICK event every frame so the UI (progress bars, countdowns)
//     can animate off a shared clock instead of their own timers;
//   * advances production through Redux on every frame (the reducer only
//     changes state when a cycle actually completes, so most frames are free);
//   * autosaves the state every 5 seconds via the EventBus;
//   * pauses on `visibilitychange` when the tab is hidden and resumes when it
//     becomes visible again — the resume path reuses the very same production
//     logic to award the time spent in the background.

import eventBus, { GameEvents } from './EventBus';
import { applyTick } from '../redux/actions';
import { saveState, saveCloseTime } from '../localStorage';

const AUTOSAVE_INTERVAL = 5000; // 5 seconds

class BusinessSystem {
  constructor() {
    this.store = null;
    this.rafId = null;
    this.running = false;
    this.lastSaveAt = 0;
    // Bound handlers so we can add/remove the same references.
    this.onFrame = this.onFrame.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  // Boot the loop against a redux store. Safe to call once at startup.
  start(store) {
    if (this.running) {
      return;
    }
    this.store = store;
    this.running = true;
    this.lastSaveAt = Date.now();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.scheduleFrame();
  }

  // Tear everything down (used on unload / tests).
  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  scheduleFrame() {
    this.rafId = requestAnimationFrame(this.onFrame);
  }

  onFrame() {
    if (!this.running) {
      return;
    }
    const now = Date.now();

    // Advance production. The reducer is a no-op unless a cycle completed,
    // so dispatching every frame stays cheap while keeping balance exact.
    this.store.dispatch(applyTick(now));

    // Broadcast the shared clock so UI components can redraw.
    eventBus.emit(GameEvents.TICK, { now });

    // Autosave on a fixed cadence, independent of the debounced persistence
    // middleware (which handles action-driven saves).
    if (now - this.lastSaveAt >= AUTOSAVE_INTERVAL) {
      this.persist(now);
    }

    this.scheduleFrame();
  }

  persist(now = Date.now()) {
    saveState(this.store.getState());
    this.lastSaveAt = now;
    eventBus.emit(GameEvents.SAVED, { now });
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    if (!this.running) {
      return;
    }
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    // Persist a snapshot + close time so a real page close is covered by the
    // same offline calculation.
    this.persist();
    saveCloseTime();
    eventBus.emit(GameEvents.PAUSED, { now: Date.now() });
  }

  resume() {
    if (this.running || !this.store) {
      return;
    }
    this.running = true;
    this.lastSaveAt = Date.now();
    // The first applyTick catches balance up for the whole hidden period,
    // reusing the identical production logic used online and offline.
    this.store.dispatch(applyTick(Date.now()));
    eventBus.emit(GameEvents.RESUMED, { now: Date.now() });
    this.scheduleFrame();
  }
}

// Single shared instance.
const businessSystem = new BusinessSystem();

export default businessSystem;
