import eventBus, { GameEvents } from './EventBus';

const MAX_DELTA = 1000;

class GameLoop {
  constructor() {
    this._running = false;
    this._paused = false;
    this._rafId = null;
    this._lastTime = 0;
    this._listeners = new Set();
    this._boundTick = this._tick.bind(this);
    this._onVisibilityChange = this._handleVisibilityChange.bind(this);
    this._boundOnUnload = this._handleUnload.bind(this);
  }

  init() {
    document.addEventListener('visibilitychange', this._onVisibilityChange);
    window.addEventListener('beforeunload', this._boundOnUnload);
    eventBus.emit(GameEvents.GAME_START);
  }

  destroy() {
    this.stop();
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    window.removeEventListener('beforeunload', this._boundOnUnload);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._boundTick);
  }

  stop() {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  pause() {
    if (!this._running || this._paused) return;
    this._paused = true;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    eventBus.emit(GameEvents.GAME_PAUSE, { time: Date.now() });
  }

  resume() {
    if (!this._running || !this._paused) return;
    this._paused = false;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._boundTick);
    eventBus.emit(GameEvents.GAME_RESUME, { time: Date.now() });
  }

  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  get isPaused() {
    return this._paused;
  }

  get isRunning() {
    return this._running && !this._paused;
  }

  _handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  _handleUnload() {
    eventBus.emit(GameEvents.GAME_PAUSE, { time: Date.now(), unload: true });
  }

  _tick(timestamp) {
    if (!this._running || this._paused) return;

    let delta = timestamp - this._lastTime;
    this._lastTime = timestamp;

    if (delta > MAX_DELTA) {
      delta = MAX_DELTA;
    }

    const now = Date.now();
    this._listeners.forEach((cb) => {
      try {
        cb(delta, now);
      } catch (err) {
        console.error('[GameLoop] listener error:', err);
      }
    });

    eventBus.emit(GameEvents.GAME_TICK, { delta, now });

    this._rafId = requestAnimationFrame(this._boundTick);
  }
}

const gameLoop = new GameLoop();

export default gameLoop;
