import { round } from '../../utils/number';
import { INCREASE_BALANCE, DECREASSE_BALANCE, COMMIT_PRODUCTION } from "../actionTypes";


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
    case DECREASSE_BALANCE: {
      return {
        amount: round(state.amount - action.payload.amount)
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
