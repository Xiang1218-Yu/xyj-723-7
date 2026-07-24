import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { Provider } from "react-redux";
import store from "./redux/store";
import { saveCloseTime } from './localStorage';
import { calculateOfflineEarnings } from './redux/actions';
import businessSystem from './core/BusinessSystem';

// Compute offline (away) earnings through the standard Redux data flow, then
// hand control to the unified game loop (requestAnimationFrame + 5s autosave +
// visibilitychange pause/resume).
store.dispatch(calculateOfflineEarnings());
businessSystem.start(store);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// On a real page close, snapshot the state and close time so the next launch's
// offline calculation is accurate.
window.addEventListener('unload', () => {
  businessSystem.stop();
  saveCloseTime();
});

serviceWorker.register();
