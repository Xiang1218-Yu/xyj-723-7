import {
  INCREASE_BALANCE,
  DECREASSE_BALANCE,
  BUY_BUSINESS,
  HIRE_MANAGER,
} from '../actionTypes';

const AUDIT_KEY_ACTIONS = new Set([
  INCREASE_BALANCE,
  DECREASSE_BALANCE,
  BUY_BUSINESS,
  HIRE_MANAGER,
]);

const isPlainAction = (action) =>
  action !== null &&
  typeof action === 'object' &&
  typeof action.type === 'string';

const auditLogger = (store) => (next) => (action) => {
  if (!isPlainAction(action) || !AUDIT_KEY_ACTIONS.has(action.type)) {
    return next(action);
  }

  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  const logEntry = {
    timestamp: new Date().toISOString(),
    action: action.type,
    payload: action.payload,
    prevBalance: prevState.balance.amount,
    newBalance: nextState.balance.amount,
  };

  try {
    const logs = JSON.parse(localStorage.getItem('AdventureCapitalist_AuditLog') || '[]');
    logs.push(logEntry);
    if (logs.length > 500) {
      logs.splice(0, logs.length - 500);
    }
    localStorage.setItem('AdventureCapitalist_AuditLog', JSON.stringify(logs));
  } catch (e) {
    console.warn('[AuditLogger] Failed to persist audit log:', e);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('%c[Audit]', 'color: #e74c3c; font-weight: bold;', logEntry);
  }

  return result;
};

export default auditLogger;
