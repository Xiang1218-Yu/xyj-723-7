import { BUY_BUSINESS, HIRE_MANAGER, INCREASE_BALANCE, DECREASSE_BALANCE, PRODUCTION_COMPLETE } from '../actionTypes';

const CRITICAL_ACTIONS = new Set([
  BUY_BUSINESS,
  HIRE_MANAGER,
  INCREASE_BALANCE,
  DECREASSE_BALANCE,
  PRODUCTION_COMPLETE,
]);

const auditLog = (api) => (next) => (action) => {
  if (typeof action === 'function') {
    return next(action);
  }

  if (CRITICAL_ACTIONS.has(action.type)) {
    const before = api.getState();
    const balanceBefore = before.balance ? before.balance.amount : 0;
    const result = next(action);
    const after = api.getState();
    const balanceAfter = after.balance ? after.balance.amount : 0;

    const entry = {
      timestamp: new Date().toISOString(),
      action: action.type,
      payload: action.payload,
      balanceBefore,
      balanceAfter,
      delta: balanceAfter - balanceBefore,
    };

    try {
      const history = JSON.parse(localStorage.getItem('AdventureCapitalist_AuditLog') || '[]');
      history.push(entry);
      if (history.length > 200) {
        history.splice(0, history.length - 200);
      }
      localStorage.setItem('AdventureCapitalist_AuditLog', JSON.stringify(history));
    } catch (e) {
      // ignore quota errors
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[AuditLog]', entry);
    }

    return result;
  }

  return next(action);
};

export default auditLog;
