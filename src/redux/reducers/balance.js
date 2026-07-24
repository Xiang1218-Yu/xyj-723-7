import { round } from '../../utils/number';
import { INCREASE_BALANCE, DECREASSE_BALANCE, PRODUCTION_COMPLETE, APPLY_OFFLINE_PROGRESS } from '../actionTypes';

const initialState = {
  amount: 0,
};

function balanceReducer(state = initialState, action) {
  switch (action.type) {
    case INCREASE_BALANCE: {
      return {
        amount: round(state.amount + action.payload.amount),
      };
    }
    case DECREASSE_BALANCE: {
      return {
        amount: round(state.amount - action.payload.amount),
      };
    }
    case PRODUCTION_COMPLETE: {
      return {
        amount: round(state.amount + action.payload.earnings),
      };
    }
    case APPLY_OFFLINE_PROGRESS: {
      return {
        amount: round(state.amount + action.payload.earnings),
      };
    }
    default:
      return state;
  }
}

export default balanceReducer;
