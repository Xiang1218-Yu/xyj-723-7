// Import the getCloseTime function from the localStorage module
import { getCloseTime } from '../localStorage';

// Import the millisecondsToStr function from the time module
import { millisecondsToStr } from './time';

// This function processes the background calculations for the game state
export const processBackgroundCalculating = state => {
  let earning = 0; // Initialize earning variable to 0
  const now = (new Date()).getTime(); // Get current time
  const closeTime = getCloseTime() || now; // Get the time when the window was last closed or use the current time if it hasn't been closed before

  // Loop through all businesses in the state object
  Object.values(state.businesses).forEach(item => {
    // Calculate earnings for auto-running businesses
    if (item.quantityPurchased && item.hasManager && item.lastRun) {
      const elapsedSeconds = Math.floor((now - item.lastRun)/1000);
      const completedTimes = Math.floor(elapsedSeconds/item.timeTaken);
      earning += completedTimes * item.profit; // Add to earning the profit made by the business in the elapsed time
      // Set new lastRun
      item.lastRun += completedTimes*item.timeTaken*1000;
    }
    // If a business has a manager but has never been run, set lastRun to the current time
    if (item.quantityPurchased && item.hasManager && !item.lastRun) {
      item.lastRun = now;
    }

    // Calculate earnings for businesses that started but didn't complete when the window was last closed
    if (item.quantityPurchased && !item.hasManager && item.lastRun 
      && (closeTime - item.lastRun) < item.timeTaken * 1000)  {
      if ((now - item.lastRun) >= item.timeTaken * 1000) {
        earning += item.profit; // Add to earning the profit made by the business
      }
    }
    state.businesses[item.id] = item; // Update the state with the updated business object
  });
  
  state.balance.amount += earning; // Add the total earnings to the balance of the state object
  
  // Set the awayEarning property to show how much money was earned while the window was closed and how long it was closed for
  state.awayEarning = {
    amount: earning, // Set the amount of money earned while the window was closed
    awayDuration: millisecondsToStr(now - closeTime) // Set the duration the window was closed for
  };
  return state; // Return the updated state object
}

// This function converts an object to a sorted list based on the order property of each object
export const objectToList = object => {
  // Convert the object to an array using Object.values()
  // Sort the array based on the order property of each object
  return Object.values(object).sort((a, b) =>  a.order - b.order);
}
