// Debounced persistence middleware. Instead of writing to localStorage on
// every single dispatch (the old store.subscribe behaviour), it coalesces
// writes and flushes 1.5s after the last state-changing action. Actions that
// opt out with meta.persist === false (e.g. per-frame production ticks) don't
// schedule a write — durability for those is covered by the BusinessSystem's
// 5s autosave. Emits SAVED on the EventBus after each flush.
import eventBus, { GameEvents } from '../../core/EventBus';
import { saveState } from '../../localStorage';

const DEBOUNCE_MS = 1500;

const debouncePersist = ({ getState }) => {
  let timer = null;

  const flush = () => {
    timer = null;
    saveState(getState());
    eventBus.emit(GameEvents.SAVED, { now: Date.now() });
  };

  return next => action => {
    const result = next(action);

    const skipPersist = action && action.meta && action.meta.persist === false;
    if (!skipPersist) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(flush, DEBOUNCE_MS);
    }

    return result;
  };
};

export default debouncePersist;
