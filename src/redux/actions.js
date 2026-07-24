import {
  INCREASE_BALANCE,
  DECREASSE_BALANCE,
  BUY_BUSINESS,
  START_PRODUCTION,
  PRODUCTION_COMPLETE,
  HIRE_MANAGER,
  SET_AWAY_EARNINGS,
  CLEAR_AWAY_EARNINGS,
  APPLY_OFFLINE_PROGRESS,
} from './actionTypes';
import { getCloseTime } from '../localStorage';
import { calculateOfflineEarnings } from '../utils/game';

export const increaseBalance = (amount) => ({
  type: INCREASE_BALANCE,
  payload: { amount },
});

export const decreaseBalance = (amount) => ({
  type: DECREASSE_BALANCE,
  payload: { amount },
});

export const buyBusiness = (businessId, qty) => ({
  type: BUY_BUSINESS,
  payload: { businessId, qty },
});

export const startProduction = (businessId) => ({
  type: START_PRODUCTION,
  payload: { businessId, time: Date.now() },
});

export const productionComplete = (businessId, earnings, newLastRun, hasManager) => ({
  type: PRODUCTION_COMPLETE,
  payload: { businessId, earnings, newLastRun, hasManager, time: Date.now() },
});

export const hireManager = (manager) => ({
  type: HIRE_MANAGER,
  payload: { manager },
});

export const setAwayEarnings = (amount, awayDuration) => ({
  type: SET_AWAY_EARNINGS,
  payload: { amount, awayDuration },
});

export const clearAwayEarnings = () => ({
  type: CLEAR_AWAY_EARNINGS,
});

export const applyOfflineProgress = (updatedBusinesses, earnings) => ({
  type: APPLY_OFFLINE_PROGRESS,
  payload: { updatedBusinesses, earnings },
});

export const buyBusinessWithFunds = (businessId, qty = 1) => (dispatch, getState) => {
  const state = getState();
  const business = state.businesses[businessId];
  if (!business) return false;

  const cost = Math.round(business.price * qty * 100) / 100;

  if (state.balance.amount >= cost) {
    dispatch(buyBusiness(businessId, qty));
    dispatch(decreaseBalance(cost));
    return true;
  }
  return false;
};

export const hireManagerWithFunds = (manager) => (dispatch, getState) => {
  const state = getState();
  if (manager.price <= state.balance.amount && !state.managers[manager.id]?.hired) {
    dispatch(hireManager(manager));
    return true;
  }
  return false;
};

export const calculateOfflineEarningsThunk = () => (dispatch, getState) => {
  const state = getState();
  const now = Date.now();
  const closeTime = getCloseTime();

  if (!closeTime) {
    return null;
  }

  const elapsed = now - closeTime;
  if (elapsed < 1000) {
    return null;
  }

  const { earnings, awayDuration, updatedBusinesses } = calculateOfflineEarnings(
    state,
    closeTime,
    now
  );

  if (earnings > 0) {
    dispatch(applyOfflineProgress(updatedBusinesses, earnings));
    dispatch(setAwayEarnings(earnings, awayDuration));
  } else {
    Object.values(updatedBusinesses).forEach((b) => {
      if (b.hasManager && b.lastRun && !state.businesses[b.id].running) {
        dispatch({ type: START_PRODUCTION, payload: { businessId: b.id, time: now } });
      }
    });
  }

  return { earnings, awayDuration };
};

export const dismissAwayEarnings = () => (dispatch) => {
  dispatch(clearAwayEarnings());
};
