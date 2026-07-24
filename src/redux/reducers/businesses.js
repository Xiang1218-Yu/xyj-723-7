import { BUY_BUSINESS, HIRE_MANAGER, START_PRODUCTION, PRODUCTION_COMPLETE, APPLY_OFFLINE_PROGRESS } from '../actionTypes';
import businesses from '../../data/businesses';
import { round } from '../../utils/number';

const initialState = businesses;

const PROFIT_FROM_PRICE = 0.3;
const PRICE_GAIN = 1.1;

function businessesReducer(state = initialState, action) {
  switch (action.type) {
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
        },
      };
    }

    case START_PRODUCTION: {
      const business = state[action.payload.businessId];
      if (!business) return state;
      return {
        ...state,
        [business.id]: {
          ...business,
          running: true,
          lastRun: action.payload.time,
        },
      };
    }

    case PRODUCTION_COMPLETE: {
      const business = state[action.payload.businessId];
      if (!business) return state;
      const { newLastRun, hasManager } = action.payload;
      return {
        ...state,
        [business.id]: {
          ...business,
          running: hasManager,
          lastRun: hasManager ? newLastRun : business.lastRun,
        },
      };
    }

    case HIRE_MANAGER: {
      const business = state[action.payload.manager.businessId];
      return {
        ...state,
        [business.id]: {
          ...business,
          hasManager: true,
        },
      };
    }

    case APPLY_OFFLINE_PROGRESS: {
      return {
        ...state,
        ...action.payload.updatedBusinesses,
      };
    }

    default:
      return state;
  }
}

export default businessesReducer;
