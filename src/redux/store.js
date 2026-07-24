import { createStore } from 'redux';
import rootReducer from './reducers';
import enhancer from './middleware';
import { loadState } from '../localStorage';

const persistedState = loadState();

const store = createStore(rootReducer, persistedState, enhancer);

export default store;
