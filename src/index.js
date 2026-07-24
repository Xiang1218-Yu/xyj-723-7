import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { Provider } from 'react-redux';
import store from './redux/store';
import { calculateOfflineEarningsThunk } from './redux/actions';
import { saveCloseTime, clearCloseTime } from './localStorage';
import gameLoop from './core/GameLoop';
import { initBusinessSystem } from './core/BusinessSystem';
import eventBus, { GameEvents } from './core/EventBus';

store.dispatch(calculateOfflineEarningsThunk());

gameLoop.init();
initBusinessSystem(store);
gameLoop.start();

eventBus.on(GameEvents.GAME_PAUSE, () => {
  saveCloseTime();
});
eventBus.on(GameEvents.GAME_RESUME, () => {
  store.dispatch(calculateOfflineEarningsThunk());
  clearCloseTime();
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.register();
