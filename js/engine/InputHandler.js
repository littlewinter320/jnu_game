// 输入管理 - 键盘 + 触摸
class InputHandler {
    constructor(canvas) {
        this.keys = {};          // 当前按下的键
        this.justPressed = {};   // 本帧刚按下的键
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseClicked = false;
        this.mouseJustClicked = false;

        // 触摸状态
        this.touches = [];

        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));
        canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        canvas.addEventListener('mouseup', () => this._onMouseUp());

        // 触摸事件
        canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this._onTouchEnd(e));

        // 移动端虚拟按钮
        this._initMobileButtons();
    }

    _onKeyDown(e) {
        const code = e.code;
        if (!this.keys[code]) {
            this.justPressed[code] = true;
        }
        this.keys[code] = true;
        // 阻止方向键和空格滚动页面
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
            e.preventDefault();
        }
    }

    _onKeyUp(e) {
        this.keys[e.code] = false;
    }

    _onMouseMove(e) {
        const rect = e.target.getBoundingClientRect();
        this.mouseX = (e.clientX - rect.left) * (CONFIG.CANVAS_WIDTH / rect.width);
        this.mouseY = (e.clientY - rect.top) * (CONFIG.CANVAS_HEIGHT / rect.height);
    }

    _onMouseDown(e) {
        this.mouseClicked = true;
        this.mouseJustClicked = true;
        this._onMouseMove(e);
    }

    _onMouseUp() {
        this.mouseClicked = false;
    }

    _onTouchStart(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            const rect = e.target.getBoundingClientRect();
            const x = (touch.clientX - rect.left) * (CONFIG.CANVAS_WIDTH / rect.width);
            const y = (touch.clientY - rect.top) * (CONFIG.CANVAS_HEIGHT / rect.height);
            this.touches.push({ id: touch.identifier, x, y });
        }
        // 触摸视为点击
        if (e.touches.length > 0) {
            const rect = e.target.getBoundingClientRect();
            this.mouseX = (e.touches[0].clientX - rect.left) * (CONFIG.CANVAS_WIDTH / rect.width);
            this.mouseY = (e.touches[0].clientY - rect.top) * (CONFIG.CANVAS_HEIGHT / rect.height);
            this.mouseClicked = true;
            this.mouseJustClicked = true;
        }
    }

    _onTouchMove(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            const t = this.touches.find(t => t.id === touch.identifier);
            if (t) {
                const rect = e.target.getBoundingClientRect();
                t.x = (touch.clientX - rect.left) * (CONFIG.CANVAS_WIDTH / rect.width);
                t.y = (touch.clientY - rect.top) * (CONFIG.CANVAS_HEIGHT / rect.height);
            }
        }
        if (e.touches.length > 0) {
            const rect = e.target.getBoundingClientRect();
            this.mouseX = (e.touches[0].clientX - rect.left) * (CONFIG.CANVAS_WIDTH / rect.width);
            this.mouseY = (e.touches[0].clientY - rect.top) * (CONFIG.CANVAS_HEIGHT / rect.height);
        }
    }

    _onTouchEnd(e) {
        for (const touch of e.changedTouches) {
            this.touches = this.touches.filter(t => t.id !== touch.identifier);
        }
        if (e.touches.length === 0) {
            this.mouseClicked = false;
        }
    }

    _initMobileButtons() {
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            const keyCode = btn.dataset.key;
            if (!keyCode) return;

            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.keys[keyCode]) {
                    this.justPressed[keyCode] = true;
                }
                this.keys[keyCode] = true;
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.keys[keyCode] = false;
            });
        });
    }

    // 判断某键是否正在按住
    isDown(code) {
        return !!this.keys[code];
    }

    // 判断某键是否本帧刚按下（只触发一次）
    isJustPressed(code) {
        return !!this.justPressed[code];
    }

    // 每帧结束时调用，清除单帧输入状态
    endFrame() {
        this.justPressed = {};
        this.mouseJustClicked = false;
    }
}
