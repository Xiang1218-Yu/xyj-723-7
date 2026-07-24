import { round } from '../../utils/number';
import {
  INCREASE_BALANCE,
  DECREASE_BALANCE,
  BUY_BUSINESS,
  HIRE_MANAGER,
  COMMIT_PRODUCTION,
} from "../actionTypes";


const initialState = {
  amount: 0
};

export default function balance(state = initialState, action) {
  switch (action.type) {
    case INCREASE_BALANCE: {
      return {
        amount: round(state.amount + action.payload.amount)
      };
    }
    case DECREASE_BALANCE: {
      return {
        amount: round(state.amount - action.payload.amount)
      };
    }
    // Buying a business deducts its price atomically alongside the businesses
    // reducer growing the quantity — a single action keeps both slices in sync.
    case BUY_BUSINESS: {
      return {
        amount: round(state.amount - action.payload.price)
      };
    }
    // Hiring a manager deducts the manager's price atomically alongside the
    // managers reducer flagging it as hired.
    case HIRE_MANAGER: {
      return {
        amount: round(state.amount - action.payload.manager.price)
      };
    }
    // Production earnings (online loop, resume, and offline calc) are credited
    // here so balance updates stay part of the standard Redux data flow.
    case COMMIT_PRODUCTION: {
      if (!action.payload.earning) {
        return state;
      }
      return {
        amount: round(state.amount + action.payload.earning)
      };
    }
    default:
      return state;
  }
}
