import {
  INCREASE_BALANCE,
  DECREASSE_BALANCE,
  BUY_BUSINESS,
  SET_LAST_RUN,
  SET_LAST_RUN_AT,
  HIRE_MANAGER,
  SET_AWAY_EARNING,
  CLEAR_AWAY_EARNING,
} from './actionTypes';
import { getCloseTime, saveCloseTime } from '../localStorage';
import { millisecondsToStr } from '../utils/time';
import { objectToList } from '../utils/game';
import { computeEarnings } from '../utils/earnings';

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

export const setLastRun = (businessId) => ({
  type: SET_LAST_RUN,
  payload: { businessId },
});

export const setLastRunAt = (businessId, timestamp) => ({
  type: SET_LAST_RUN_AT,
  payload: { businessId, timestamp },
});

export const hireManager = (manager) => ({
  type: HIRE_MANAGER,
  payload: { manager },
});

export const setAwayEarning = (amount, awayDuration) => ({
  type: SET_AWAY_EARNING,
  payload: { amount, awayDuration },
});

export const clearAwayEarning = () => ({
  type: CLEAR_AWAY_EARNING,
});

export const calculateOfflineEarnings = () => (dispatch, getState) => {
  const now = Date.now();
  const closeTime = getCloseTime();

  if (!closeTime) {
    saveCloseTime();
    return;
  }

  if (now - closeTime < 1000) {
    return;
  }

  const state = getState();
  const businesses = objectToList(state.businesses);

  const { totalEarning, updates } = computeEarnings(businesses, {
    endTime: now,
    getStartTime: (b) => {
      if (!b.lastRun) return null;
      if (b.hasManager) return Math.max(b.lastRun, closeTime);
      return b.lastRun;
    },
    isManualInProgress: (b, startTime) => closeTime - startTime < b.timeTaken * 1000,
  });

  if (totalEarning > 0) {
    Object.entries(updates).forEach(([businessId, timestamp]) => {
      dispatch(setLastRunAt(businessId, timestamp));
    });
    dispatch(increaseBalance(totalEarning));
    dispatch(setAwayEarning(totalEarning, millisecondsToStr(now - closeTime)));
  }

  saveCloseTime();
};
