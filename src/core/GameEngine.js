import { gameLoop } from './GameLoop';
import { BusinessSystem } from './BusinessSystem';
import { eventBus, EVENTS } from './EventBus';
import { FORCE_SAVE } from '../redux/actionTypes';
import { saveCloseTime } from '../localStorage';

export class GameEngine {
  constructor(store) {
    this.store = store;
    this.businessSystem = new BusinessSystem(store);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.saveUnsubscribe = null;
  }

  init() {
    this.businessSystem.init();
    this.saveUnsubscribe = eventBus.on(EVENTS.SAVE, () => {
      this.store.dispatch({ type: FORCE_SAVE });
    });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    gameLoop.start();
  }

  destroy() {
    gameLoop.stop();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    if (this.saveUnsubscribe) {
      this.saveUnsubscribe();
      this.saveUnsubscribe = null;
    }
    this.businessSystem.destroy();
    eventBus.removeAll();
  }

  _forceSaveAndRecordTime() {
    this.store.dispatch({ type: FORCE_SAVE });
    saveCloseTime();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      gameLoop.pause();
      this._forceSaveAndRecordTime();
    } else {
      this.store.dispatch({ type: FORCE_SAVE });
      gameLoop.resume();
    }
  }

  handleBeforeUnload() {
    this._forceSaveAndRecordTime();
  }
}
