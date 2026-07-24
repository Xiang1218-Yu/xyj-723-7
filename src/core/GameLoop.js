import { eventBus, EVENTS } from './EventBus';

const SAVE_INTERVAL = 5000;

class GameLoop {
  constructor() {
    this.rafId = null;
    this.lastFramePerf = 0;
    this.timeOrigin = 0;
    this.running = false;
    this.paused = false;
    this.lastSaveWallTime = 0;
    this.tick = this.tick.bind(this);
  }

  _perfToWall(perfNow) {
    return perfNow + this.timeOrigin;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    const nowPerf = performance.now();
    this.timeOrigin = Date.now() - nowPerf;
    this.lastFramePerf = nowPerf;
    this.lastSaveWallTime = this._perfToWall(nowPerf);
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    eventBus.emit(EVENTS.GAME_PAUSE);
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    const nowPerf = performance.now();
    this.timeOrigin = Date.now() - nowPerf;
    this.lastFramePerf = nowPerf;
    this.lastSaveWallTime = this._perfToWall(nowPerf);
    eventBus.emit(EVENTS.GAME_RESUME);
    this.rafId = requestAnimationFrame(this.tick);
  }

  tick(perfNow) {
    if (!this.running) return;
    if (this.paused) return;

    const deltaTime = perfNow - this.lastFramePerf;
    this.lastFramePerf = perfNow;
    const now = this._perfToWall(perfNow);

    eventBus.emit(EVENTS.TICK, { deltaTime, currentTime: now });

    if (now - this.lastSaveWallTime >= SAVE_INTERVAL) {
      this.lastSaveWallTime = now;
      eventBus.emit(EVENTS.SAVE, { currentTime: now });
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  isRunning() {
    return this.running;
  }

  isPaused() {
    return this.paused;
  }
}

export const gameLoop = new GameLoop();
