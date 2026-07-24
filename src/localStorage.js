import { processBackgroundCalculating } from './utils/game';

// Loads the saved state from the browser's local storage.
// Returns undefined if the state is not found or there's an error.
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('AdventureCapitalist_State');
    if (serializedState === null) {
      return undefined;
    }
    // Processes the saved state and returns it.
    return processBackgroundCalculating(JSON.parse(serializedState));
  } catch (error) {
    console.warn(error);
    return undefined;
  }
}

// Saves the given state to the browser's local storage.
export const saveState = (state) => {
  try {
    localStorage.setItem('AdventureCapitalist_State', JSON.stringify(state));
  } catch (error) {
    console.warn(error);
  }
}

// Gets the saved close time from the browser's local storage.
// Returns undefined if the time is not found or there's an error.
export const getCloseTime = () => {
  try {
    const time = localStorage.getItem('AdventureCapitalist_CloseTime');
    if (time === null) {
      return undefined;
    }
    // Converts the saved time to a number and returns it.
    return Number(time);
  } catch (error) {
    console.warn(error);
    return undefined;
  }
}

// Saves the current time to the browser's local storage.
export const saveCloseTime = () => {
  try {
    localStorage.setItem('AdventureCapitalist_CloseTime', (new Date().getTime()));
  } catch (error) {
    console.warn(error);
  }
}
