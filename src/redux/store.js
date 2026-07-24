import { createStore, applyMiddleware, compose } from "redux";
import rootReducer from "./reducers";
import { loadState } from '../localStorage';
import thunk from './middleware/thunk';
import auditLog from './middleware/auditLog';
import eventLog from './middleware/eventLog';
import debouncePersist from './middleware/debouncePersist';

// Middleware pipeline, assembled in order:
//   thunk           -> unwraps function actions (async / multi-step flows)
//   auditLog        -> records key transactions with balance snapshots
//   eventLog        -> broadcasts the action stream on the EventBus
//   debouncePersist -> coalesces localStorage writes 1.5s after the last action
const middleware = [thunk, auditLog, eventLog, debouncePersist];

// Redux DevTools integration (falls back to plain compose in production /
// when the extension is absent).
const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const store = createStore(
  rootReducer,
  loadState(),
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;
