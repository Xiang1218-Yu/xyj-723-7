import { createStore, applyMiddleware, compose } from "redux";
import rootReducer from "./reducers";
import thunk from "./middleware/thunk";
import auditLogger from "./middleware/auditLogger";
import eventLogger from "./middleware/eventLogger";
import persistence from "./middleware/persistence";
import { loadState } from '../localStorage';

const composeEnhancers =
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const middlewares = [thunk, auditLogger, eventLogger, persistence];

const store = createStore(
  rootReducer,
  loadState(),
  composeEnhancers(applyMiddleware(...middlewares))
);

export default store;
