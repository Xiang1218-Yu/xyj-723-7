import { applyMiddleware, compose } from 'redux';
import thunk from './thunk';
import auditLog from './auditLog';
import eventLog from './eventLog';
import debouncePersistence from './debouncePersistence';

const middleware = [thunk, auditLog, eventLog, debouncePersistence];

const composeEnhancers =
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));

export default enhancer;
