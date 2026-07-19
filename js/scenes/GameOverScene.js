class GameOverScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.assets = window.Game.assets;
        this._time = 0;
        this._data = null;
        this._btnBounds = null;
        this._menuBtnBounds = null;
    }

    enter(data) {
        this._time = 0;
        this._data = data || {};
        this.particles.clear();
    }

    update(dt) {
        this._time += dt;
        this.particles.update(dt);

        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const bw = 240, bh = 80;
        this._btnBounds = { x: w/2 - bw/2, y: h/2 + 120, w: bw, h: bh };
        this._menuBtnBounds = { x: w/2 - bw/2, y: h/2 + 220, w: bw, h: bh };

        const mx = this.input.mouseX, my = this.input.mouseY;
        const clickedRestart = this._isIn(mx, my, this._btnBounds) && this.input.mouseJustClicked;
        const clickedMenu = this._isIn(mx, my, this._menuBtnBounds) && this.input.mouseJustClicked;

        if (clickedRestart || this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.JUMP)) {
            this.audio.playSFX('BUTTON_CLICK');
            if (this._data.level === 'tencent') {
                this.changeScene(CONFIG.SCENES.TENCENT_LOBBY, { gender: this._data.gender });
            } else if (this._data.level === 'xpeng') {
                this.changeScene(CONFIG.SCENES.XPENG_RUN, { gender: this._data.gender });
            } else {
                this.changeScene(CONFIG.SCENES.MAIN_MENU);
            }
        }
        if (clickedMenu || this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }
    }

    _isIn(mx, my, b) {
        return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
    }

    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = this.assets;

        ctx.fillStyle = 'rgba(0,0,0,0.92)';
        ctx.fillRect(0, 0, w, h);

        const box = assets.getSprite('UI_DIALOG_BOX');
        const bw = 650, bh = 460;
        const bx = (w - bw) / 2, by = (h - bh) / 2 - 30;
        if (box && box.image) {
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.drawImage(box.image, bx, by, bw, bh);
            ctx.restore();
        } else {
            ctx.fillStyle = 'rgba(40,10,10,0.95)';
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 4;
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeRect(bx, by, bw, bh);
        }

        ctx.save();
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 56px "Courier New"';
        ctx.textAlign = 'center';
        const shake = Math.sin(this._time * 15) * (this._time < 1 ? 4 : 0);
        ctx.fillText('任务失败', w/2 + shake, by + 100);
        ctx.restore();

        const reason = this._data.reason || 'unknown';
        let failMsg = '任务失败！';
        let reasonMsg = '';
        if (this._data.level === 'xpeng') {
            failMsg = '体力耗尽，充能失败！';
            reasonMsg = reason === 'stamina' ? '体力不足' : reason;
        } else if (this._data.level === 'tencent') {
            if (reason === 'fall') {
                failMsg = '坠入深渊，任务失败！';
                reasonMsg = '掉入了底层缺口';
            } else if (reason === 'virus') {
                failMsg = '被病毒感染，任务失败！';
                reasonMsg = '接触了危险的病毒';
            } else if (reason === 'hazard') {
                failMsg = '触发危险机关，任务失败！';
                reasonMsg = '碰到了致命障碍物';
            } else {
                failMsg = '任务失败！';
                reasonMsg = '未知原因';
            }
        } else {
            failMsg = '任务失败！';
            reasonMsg = reason;
        }
        ctx.fillStyle = '#ff8888';
        ctx.font = '26px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(failMsg, w/2, by + 170);

        ctx.fillStyle = '#ccc';
        ctx.font = '22px "Courier New"';
        if (reasonMsg) {
            ctx.fillText(`原因: ${reasonMsg}`, w/2, by + 220);
        }

        ctx.fillStyle = '#888';
        ctx.font = '20px "Courier New"';
        ctx.fillText('不要灰心，再试一次吧！', w/2, by + 270);

        const restartBtn = assets.getSprite('BTN_RESTART');
        if (restartBtn && restartBtn.image && this._btnBounds) {
            ctx.save();
            ctx.shadowColor = '#ff6666';
            ctx.shadowBlur = 15;
            ctx.drawImage(restartBtn.image, this._btnBounds.x, this._btnBounds.y, this._btnBounds.w, this._btnBounds.h);
            ctx.restore();
        } else {
            ctx.fillStyle = '#ff6666';
            ctx.font = '26px "Courier New"';
            ctx.fillText('重新挑战 (Enter)', w/2, this._btnBounds.y + 50);
        }

        const menuBtn = assets.getSprite('BTN_MENU');
        if (menuBtn && menuBtn.image && this._menuBtnBounds) {
            ctx.drawImage(menuBtn.image, this._menuBtnBounds.x, this._menuBtnBounds.y, this._menuBtnBounds.w, this._menuBtnBounds.h);
        } else {
            ctx.fillStyle = '#888';
            ctx.font = '24px "Courier New"';
            ctx.fillText('返回主菜单 (ESC)', w/2, this._menuBtnBounds.y + 50);
        }

        this.particles.render(ctx);
    }
}
