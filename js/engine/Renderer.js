// Canvas 2D 渲染器 - 负责画布管理、缩放适配、屏幕震动
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scaleX = 1;
        this.scaleY = 1;
        this.shakeAmount = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        // 设置画布内部分辨率
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        // 响应式缩放
        window.addEventListener('resize', () => this._resize());
        this._resize();
    }

    _resize() {
        const cw = window.innerWidth;
        const ch = window.innerHeight;
        const targetRatio = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
        const windowRatio = cw / ch;

        let width, height;
        if (windowRatio > targetRatio) {
            height = ch;
            width = height * targetRatio;
        } else {
            width = cw;
            height = width / targetRatio;
        }

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = `${(cw - width) / 2}px`;
        this.canvas.style.top = `${(ch - height) / 2}px`;
        this.scaleX = CONFIG.CANVAS_WIDTH / width;
        this.scaleY = CONFIG.CANVAS_HEIGHT / height;
    }

    // 屏幕震动
    shake(amount, duration) {
        this.shakeAmount = amount;
        this.shakeDuration = duration;
        this.shakeTimer = 0;
    }

    // 每帧开始前调用，更新震动偏移
    beginFrame(dt) {
        if (this.shakeTimer < this.shakeDuration) {
            this.shakeTimer += dt;
            const progress = 1 - this.shakeTimer / this.shakeDuration;
            const currentShake = this.shakeAmount * progress;
            this.offsetX = (Math.random() - 0.5) * 2 * currentShake;
            this.offsetY = (Math.random() - 0.5) * 2 * currentShake;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
        this.ctx.setTransform(1, 0, 0, 1, this.offsetX, this.offsetY);
    }

    clear(color = '#000') {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.ctx.setTransform(1, 0, 0, 1, this.offsetX, this.offsetY);
    }

    // 将屏幕坐标转换为画布坐标
    screenToCanvas(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (screenX - rect.left) * this.scaleX,
            y: (screenY - rect.top) * this.scaleY
        };
    }

    // 绘制图片（支持精灵帧）
    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!image) return;
        if (sx !== undefined) {
            this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        } else {
            this.ctx.drawImage(image, dx, dy, dw, dh);
        }
    }

    // 绘制带颜色的矩形（占位/调试用）
    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    // 绘制文字
    drawText(text, x, y, { font = '20px "Courier New"', color = '#fff', align = 'left', baseline = 'top' } = {}) {
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
    }
}
