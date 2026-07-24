import eventBus, { GameEvents } from '../../core/EventBus';
import {
  INCREASE_BALANCE,
  BUY_BUSINESS,
  HIRE_MANAGER,
  PRODUCTION_COMPLETE,
  START_PRODUCTION,
  SET_AWAY_EARNINGS,
} from '../actionTypes';

const ACTION_TO_EVENT = {
  [INCREASE_BALANCE]: GameEvents.BALANCE_CHANGED,
  [BUY_BUSINESS]: GameEvents.BUSINESS_BOUGHT,
  [HIRE_MANAGER]: GameEvents.MANAGER_HIRED,
  [PRODUCTION_COMPLETE]: GameEvents.PRODUCTION_COMPLETE,
  [START_PRODUCTION]: GameEvents.PRODUCTION_START,
  [SET_AWAY_EARNINGS]: GameEvents.OFFLINE_EARNINGS_CALCULATED,
};

const eventLog = (api) => (next) => (action) => {
  if (typeof action === 'function') {
    return next(action);
  }

  const result = next(action);
  const eventName = ACTION_TO_EVENT[action.type];

  if (eventName) {
    eventBus.emit(eventName, {
      payload: action.payload,
      state: api.getState(),
    });
  }

  return result;
};

export default eventLog;
