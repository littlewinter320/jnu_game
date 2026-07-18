// 主游戏循环 - 使用 requestAnimationFrame
class GameLoop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.running = false;
        this.lastTime = 0;
        this.rafId = null;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this._loop(this.lastTime);
    }

    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    _loop(currentTime) {
        if (!this.running) return;
        this.rafId = requestAnimationFrame((t) => this._loop(t));

        // 计算 dt（秒），上限 0.1 秒防止跳帧
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.updateFn(dt);
        this.renderFn();
    }
}
