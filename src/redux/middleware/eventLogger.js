import { eventBus, EVENTS } from '../../core/EventBus';
import { INCREASE_BALANCE, DECREASSE_BALANCE, SET_LAST_RUN, FORCE_SAVE } from '../actionTypes';

const isPlainAction = (action) =>
  action !== null &&
  typeof action === 'object' &&
  typeof action.type === 'string';

const eventLogger = (store) => (next) => (action) => {
  const result = next(action);

  if (!isPlainAction(action)) {
    return result;
  }

  if (action.type === FORCE_SAVE) {
    return result;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('%c[Event]', 'color: #3498db; font-weight: bold;', action.type, action.payload);
  }

  switch (action.type) {
    case INCREASE_BALANCE:
      eventBus.emit(EVENTS.BALANCE_CHANGE, {
        type: 'increase',
        amount: action.payload.amount,
        balance: store.getState().balance.amount,
      });
      break;
    case DECREASSE_BALANCE:
      eventBus.emit(EVENTS.BALANCE_CHANGE, {
        type: 'decrease',
        amount: action.payload.amount,
        balance: store.getState().balance.amount,
      });
      break;
    case SET_LAST_RUN:
      eventBus.emit(EVENTS.BUSINESS_START, {
        businessId: action.payload.businessId,
      });
      break;
    default:
      break;
  }

  return result;
};

export default eventLogger;
