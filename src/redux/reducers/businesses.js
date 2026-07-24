// Reducer function for managing the state of businesses
import { BUY_BUSINESS, HIRE_MANAGER, SET_LAST_RUN } from "../actionTypes";
import businesses from '../../data/businesses';
import { round } from '../../utils/number';

// Set the initial state to the data fetched from the server
const initialState = businesses;

// Constants used in calculating the new state
const PROFIT_FROM_PRICE = 0.3;
const PRICE_GAIN = 1.1;

export default function(state = initialState, action) {
switch (action.type) {
// Case for buying a business
case BUY_BUSINESS: {
const businessId = action.payload.businessId;
const business = state[businessId];
const qty = action.payload.qty;
const price = round(business.price * PRICE_GAIN * qty);
const profit = round(business.profit + business.price * qty * PROFIT_FROM_PRICE);
return {
...state,
[businessId]: {
...business,
quantityPurchased: business.quantityPurchased + qty,
price,
profit,
}
};
}
// Case for setting the last run of a business
case SET_LAST_RUN:
const business = state[action.payload.businessId];
return {
  ...state,
  [business.id]: {
    ...business,
    lastRun: (new Date()).getTime()
  }
}
// Case for hiring a manager for a business
case HIRE_MANAGER: {
const business = state[action.payload.manager.businessId];
return {
  ...state,
  [business.id]: {
    ...business,
    hasManager: true
  }
}
}
// Default case for returning the current state if the action is not recognized
default:
return state;

}
}