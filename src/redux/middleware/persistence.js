import { saveState } from '../../localStorage';
import { FORCE_SAVE } from '../actionTypes';

const DEBOUNCE_MS = 1500;

let debounceTimer = null;

const isPlainAction = (action) =>
  action !== null &&
  typeof action === 'object' &&
  typeof action.type === 'string';

const flushSave = (store) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  try {
    saveState(store.getState());
  } catch (e) {
    console.warn('[Persistence] Save failed:', e);
  }
};

const persistence = (store) => (next) => (action) => {
  const result = next(action);

  if (!isPlainAction(action)) {
    return result;
  }

  if (action.type === FORCE_SAVE) {
    flushSave(store);
    return result;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    flushSave(store);
  }, DEBOUNCE_MS);

  return result;
};

persistence.immediateSave = (store) => {
  flushSave(store);
};

export default persistence;
