import businessesData from './data/businesses';

const STATE_KEY = 'AdventureCapitalist_State';
const CLOSE_TIME_KEY = 'AdventureCapitalist_CloseTime';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    const parsed = JSON.parse(serializedState);
    return normalizeState(parsed);
  } catch (error) {
    console.warn('[localStorage] loadState failed:', error);
    return undefined;
  }
};

const normalizeState = (state) => {
  if (!state) return state;

  if (state.businesses) {
    const merged = {};
    Object.keys(businessesData).forEach((key) => {
      const saved = state.businesses[key] || {};
      merged[key] = {
        ...businessesData[key],
        ...saved,
        running: saved.running ?? false,
        lastRun: saved.lastRun ?? null,
      };
    });
    state.businesses = merged;
  }

  if (state.awayEarning) {
    state.awayEarning = { amount: 0, awayDuration: '' };
  }

  return state;
};

export const saveState = (state) => {
  try {
    const serializable = {
      balance: state.balance,
      businesses: state.businesses,
      managers: state.managers,
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.warn('[localStorage] saveState failed:', error);
  }
};

export const getCloseTime = () => {
  try {
    const time = localStorage.getItem(CLOSE_TIME_KEY);
    if (time === null) {
      return undefined;
    }
    return Number(time);
  } catch (error) {
    console.warn('[localStorage] getCloseTime failed:', error);
    return undefined;
  }
};

export const saveCloseTime = () => {
  try {
    localStorage.setItem(CLOSE_TIME_KEY, String(Date.now()));
  } catch (error) {
    console.warn('[localStorage] saveCloseTime failed:', error);
  }
};

export const clearCloseTime = () => {
  try {
    localStorage.removeItem(CLOSE_TIME_KEY);
  } catch (error) {
    console.warn('[localStorage] clearCloseTime failed:', error);
  }
};
