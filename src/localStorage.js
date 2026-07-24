const STATE_KEY = 'AdventureCapitalist_State';
const CLOSE_TIME_KEY = 'AdventureCapitalist_CloseTime';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.warn('[localStorage] loadState failed:', error);
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STATE_KEY, serializedState);
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
