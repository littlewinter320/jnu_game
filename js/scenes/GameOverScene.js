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

        const bw = 650, bh = 460;
        const bx = (w - bw) / 2, by = (h - bh) / 2 - 30;

        // 绘制背景遮罩
        ctx.fillStyle = 'rgba(0,0,0,0.92)';
        ctx.fillRect(0, 0, w, h);

        // 绘制红色对话框（在遮罩之上）
        const r = 18;
        ctx.save();
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 35;
        // 手动绘制圆角矩形路径
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
        ctx.lineTo(bx + r, by + bh);
        ctx.arcTo(bx, by + bh, bx, by + bh - r, r);
        ctx.lineTo(bx, by + r);
        ctx.arcTo(bx, by, bx + r, by, r);
        ctx.closePath();
        // 填充完全不透明的深红灰色背景（更亮以便文字清晰）
        ctx.fillStyle = '#4a2020';
        ctx.fill();
        // 绘制红色边框
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // 关闭按钮
        const cx = bx + bw - 30;
        const cy = by + 30;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,80,80,0.85)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx + 8, cy + 8);
        ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx - 8, cy + 8);
        ctx.stroke();

        // 标题文字
        ctx.save();
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ff6666';
        ctx.font = 'bold 64px "Courier New"';
        ctx.textAlign = 'center';
        const shake = Math.sin(this._time * 15) * (this._time < 1 ? 4 : 0);
        ctx.fillText('任务失败', w/2 + shake, by + 110);
        ctx.restore();

        const reason = this._data.reason || 'unknown';
        let failMsg = '任务失败！';
        let reasonMsg = '';
        if (this._data.level === 'xpeng') {
            if (reason === 'stamina') {
                failMsg = '体力耗尽，充能失败！';
                reasonMsg = '体力不足';
            } else if (reason === 'missed_xpeng') {
                failMsg = '错过了救援车辆！';
                reasonMsg = '没有切换到正确车道';
            } else {
                failMsg = '充能挑战失败！';
                reasonMsg = '碰到了障碍物';
            }
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

        // 失败描述文字
        ctx.save();
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffaaaa';
        ctx.font = 'bold 30px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(failMsg, w/2, by + 180);
        ctx.restore();

        // 原因文字
        ctx.save();
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#dddddd';
        ctx.font = 'bold 26px "Courier New"';
        ctx.textAlign = 'center';
        if (reasonMsg) {
            ctx.fillText(`原因: ${reasonMsg}`, w/2, by + 230);
        }
        ctx.restore();

        // 鼓励文字
        ctx.save();
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#bbbbbb';
        ctx.font = 'bold 24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('不要灰心，再试一次吧！', w/2, by + 285);
        ctx.restore();

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
