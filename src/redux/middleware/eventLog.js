// Event-log middleware. Broadcasts every meaningful dispatched action on the
// EventBus (ACTION channel) so features can subscribe to the game's action
// stream without coupling to Redux internals. High-frequency, low-value
// actions flagged with meta.silent (e.g. per-frame production ticks) are
// skipped to keep the stream readable.
import eventBus, { GameEvents } from '../../core/EventBus';

const eventLog = () => next => action => {
  const result = next(action);

  const isSilent = action && action.meta && action.meta.silent;
  if (action && action.type && !isSilent) {
    eventBus.emit(GameEvents.ACTION, {
      type: action.type,
      payload: action.payload,
      timestamp: Date.now(),
    });
  }

  return result;
};

export default eventLog;
