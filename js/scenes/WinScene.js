class WinScene {
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
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.particles.emitCollect(
                    200 + Math.random() * (CONFIG.CANVAS_WIDTH - 400),
                    200 + Math.random() * 400
                );
            }, i * 80);
        }
    }

    update(dt) {
        this._time += dt;
        this.particles.update(dt);

        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const bw = 240, bh = 80;
        this._btnBounds = { x: w/2 - bw/2, y: h/2 + 160, w: bw, h: bh };
        this._menuBtnBounds = { x: w/2 - bw/2, y: h/2 + 260, w: bw, h: bh };

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

        if (this._data.level === 'tencent') {
            assets.drawBackground(ctx, 'BG_TENCENT_TECH', this._time);
        } else {
            assets.drawBackground(ctx, 'BG_XPENG_STAGE1', this._time);
        }

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, w, h);

        const box = assets.getSprite('UI_DIALOG_BOX');
        const bw = 700, bh = 520;
        const bx = (w - bw) / 2, by = (h - bh) / 2 - 40;
        if (box && box.image) {
            ctx.drawImage(box.image, bx, by, bw, bh);
        } else {
            ctx.fillStyle = 'rgba(10,40,20,0.95)';
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 4;
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeRect(bx, by, bw, bh);
        }

        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 56px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('通关成功！', w/2, by + 90);
        ctx.restore();

        const levelName = this._data.level === 'tencent' ? '腾讯大堂探险' : '小鹏充电站竞速';
        ctx.fillStyle = '#88ccff';
        ctx.font = '28px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(levelName, w/2, by + 150);

        ctx.fillStyle = '#fff';
        ctx.font = '24px "Courier New"';
        const time = this._data.time || 0;
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        ctx.fillText(`用时: ${mins}:${secs.toString().padStart(2,'0')}`, w/2, by + 210);

        if (this._data.level === 'tencent') {
            ctx.fillText(`收集道具: ${this._data.collected || 0}/${this._data.totalProps || 6}`, w/2, by + 250);
        } else {
            ctx.fillText(`收集电池: ${this._data.collected || 0} 个`, w/2, by + 250);
        }

        const rating = this._calcRating();
        ctx.fillStyle = rating.color;
        ctx.font = 'bold 32px "Courier New"';
        ctx.fillText('评价: ' + rating.stars, w/2, by + 310);

        if (this._data.level === 'tencent') {
            const thanks = [
                '🐧 太好了！我的系统恢复正常了！',
                '感谢你找回了所有6个核心模块！',
                '你是一位真正的卓越工程师！'
            ];
            ctx.fillStyle = '#90ee90';
            ctx.font = '18px "Courier New"';
            let ty = by + 360;
            for (const line of thanks) {
                ctx.fillText(line, w/2, ty);
                ty += 24;
            }
        }

        const restartBtn = assets.getSprite('BTN_RESTART');
        if (restartBtn && restartBtn.image && this._btnBounds) {
            const b = this._btnBounds;
            const pulse = 1 + Math.sin(this._time * 4) * 0.03;
            const sw = b.w * pulse, sh = b.h * pulse;
            ctx.save();
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 20;
            ctx.drawImage(restartBtn.image, b.x + (b.w-sw)/2, b.y + (b.h-sh)/2, sw, sh);
            ctx.restore();
        } else {
            ctx.fillStyle = '#4facfe';
            ctx.font = '26px "Courier New"';
            ctx.fillText('再来一次 (Enter)', w/2, this._btnBounds.y + 50);
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

        if (Math.random() < 0.15) {
            this.particles.emitCollect(
                bx + Math.random() * bw,
                by + Math.random() * bh * 0.6
            );
        }
    }

    _calcRating() {
        const collected = this._data.collected || 0;
        const total = this._data.totalProps || 6;
        const ratio = collected / total;
        if (ratio >= 1) return { stars: '★★★', color: '#ffd700' };
        if (ratio >= 0.7) return { stars: '★★☆', color: '#c0c0c0' };
        if (ratio >= 0.4) return { stars: '★☆☆', color: '#cd7f32' };
        return { stars: '☆☆☆', color: '#888' };
    }
}
