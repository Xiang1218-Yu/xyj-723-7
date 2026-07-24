import {
  INCREASE_BALANCE,
  DECREASE_BALANCE,
  BUY_BUSINESS,
  SET_LAST_RUN,
  HIRE_MANAGER,
  COMMIT_PRODUCTION,
  SET_AWAY_EARNING,
} from './actionTypes';
import { applyProduction } from '../core/production';
import { getCloseTime } from '../localStorage';
import { millisecondsToStr } from '../utils/time';

export const increaseBalance = amount => ({
  type: INCREASE_BALANCE,
  payload: {
    amount
  }
});

export const decreaseBalance = amount => ({
  type: DECREASE_BALANCE,
  payload: {
    amount
  }
});

// Buying a business is a single atomic action: the businesses reducer grows
// the quantity while the balance reducer deducts `price` from the same action,
// so there is never an intermediate state where the business is bought but the
// money hasn't been spent (or vice versa).
export const buyBusiness = (businessId, qty, price) => ({
  type: BUY_BUSINESS,
  meta: { audit: true },
  payload: {
    businessId,
    qty,
    price
  }
});

// Stamp the start time in the action creator (not the reducer) so it uses the
// same Date.now() clock source as the unified game loop / production logic,
// keeping reducers pure and avoiding clock-source drift between the manual
// start time and the loop that measures progress against it.
export const setLastRun = (businessId, at = Date.now()) => ({
  type: SET_LAST_RUN,
  payload: {
    businessId,
    at
  }
});

// Hiring a manager is likewise atomic: the managers reducer flags the manager
// as hired while the balance reducer deducts the manager's price from the same
// action.
export const hireManager = (manager) => ({
  type: HIRE_MANAGER,
  meta: { audit: true },
  payload: {
    manager
  }
});

// Low-level action carrying the result of a production step. `meta.silent`
// tells the logging middleware to ignore the high-frequency frame updates,
// and `meta.persist: false` keeps per-frame ticks from thrashing storage
// (the 5s autosave / debounced persistence handle durability instead).
export const commitProduction = (businesses, earning) => ({
  type: COMMIT_PRODUCTION,
  meta: { silent: true, persist: false },
  payload: { businesses, earning }
});

export const setAwayEarning = (amount, awayDuration) => ({
  type: SET_AWAY_EARNING,
  payload: { amount, awayDuration }
});

// Thunk: advance production up to `now` using the shared production logic and
// commit the result through the normal Redux data flow. Called every frame by
// the BusinessSystem loop as well as on resume from background.
export const applyTick = (now = Date.now()) => (dispatch, getState) => {
  const { businesses } = getState();
  const { businesses: nextBusinesses, earning, changed } =
    applyProduction(businesses, now);

  if (!changed) {
    return; // Nothing completed this frame — avoid a pointless dispatch.
  }
  dispatch(commitProduction(nextBusinesses, earning));
};

// Thunk: compute offline (away) earnings the standard Redux way instead of
// mutating state synchronously inside loadState. Reuses the same production
// logic as the live loop, then records the away summary for the modal.
export const calculateOfflineEarnings = () => (dispatch, getState) => {
  const now = Date.now();
  const closeTime = getCloseTime() || now;
  const { businesses } = getState();

  const { businesses: nextBusinesses, earning, changed } =
    applyProduction(businesses, now);

  if (changed) {
    dispatch(commitProduction(nextBusinesses, earning));
  }
  dispatch(setAwayEarning(earning, millisecondsToStr(now - closeTime)));
};
