// Audit-log middleware. Records key financial transactions (buying a business,
// hiring a manager — anything flagged with meta.audit) together with a
// before/after balance snapshot, and broadcasts them on the EventBus so other
// systems (analytics, anti-cheat, UI toasts) can react. Purely observational:
// it never blocks or mutates the action.
import eventBus, { GameEvents } from '../../core/EventBus';

const auditLog = ({ getState }) => next => action => {
  const isAudited = action && action.meta && action.meta.audit;
  const balanceBefore = isAudited ? getState().balance.amount : undefined;

  const result = next(action);

  if (isAudited) {
    const record = {
      type: action.type,
      payload: action.payload,
      balanceBefore,
      balanceAfter: getState().balance.amount,
      timestamp: Date.now(),
    };
    eventBus.emit(GameEvents.AUDIT, record);
    if (process.env.NODE_ENV !== 'production') {
      console.info('[audit]', record);
    }
  }

  return result;
};

export default auditLog;
