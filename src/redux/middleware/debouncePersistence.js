import { saveState } from '../../localStorage';
import eventBus, { GameEvents } from '../../core/EventBus';
import gameLoop from '../../core/GameLoop';

const DEBOUNCE_MS = 1500;
const AUTOSAVE_INTERVAL = 5000;

const debouncePersistence = (api) => {
  let debounceTimer = null;
  let autosaveAccumulator = 0;
  let unsubscribeLoop = null;

  const flushNow = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    try {
      saveState(api.getState());
      eventBus.emit(GameEvents.AUTOSAVE, { time: Date.now() });
    } catch (err) {
      console.warn('[DebouncePersistence] save failed:', err);
    }
  };

  const scheduleSave = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(flushNow, DEBOUNCE_MS);
  };

  const stop = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (unsubscribeLoop) {
      unsubscribeLoop();
      unsubscribeLoop = null;
    }
  };

  unsubscribeLoop = gameLoop.subscribe((delta) => {
    autosaveAccumulator += delta;
    if (autosaveAccumulator >= AUTOSAVE_INTERVAL) {
      autosaveAccumulator = 0;
      flushNow();
    }
  });

  eventBus.on(GameEvents.GAME_PAUSE, () => {
    autosaveAccumulator = 0;
    flushNow();
  });

  if (typeof window !== 'undefined') {
    window.__gameFlushSave = flushNow;
    window.__gameStopPersistence = stop;
  }

  const middleware = (next) => (action) => {
    if (typeof action === 'function') {
      return next(action);
    }

    if (action.type === 'FLUSH_SAVE') {
      flushNow();
      return;
    }

    const result = next(action);
    scheduleSave();
    return result;
  };

  middleware.stop = stop;
  middleware.flush = flushNow;
  return middleware;
};

export default debouncePersistence;
