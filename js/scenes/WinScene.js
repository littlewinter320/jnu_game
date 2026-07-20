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
        const dialogW = 800, dialogH = 760;
        const dialogY = (h - dialogH) / 2 - 20;
        const bw = 280, bh = 70;
        this._btnBounds = { x: w/2 - bw/2, y: dialogY + dialogH - 160, w: bw, h: bh };
        this._menuBtnBounds = { x: w/2 - bw/2, y: dialogY + dialogH - 75, w: bw, h: bh };

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
            const endBg = assets.getSprite('BG_XPENG_ENDING');
            if (endBg && endBg.image) {
                ctx.drawImage(endBg.image, 0, 0, w, h);
            } else {
                const gradient = ctx.createLinearGradient(0, 0, 0, h);
                gradient.addColorStop(0, '#0a2040');
                gradient.addColorStop(0.5, '#1a4080');
                gradient.addColorStop(1, '#0a3060');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
            }
        }

        const bw = 800, bh = 760;
        const bx = (w - bw) / 2, by = (h - bh) / 2 - 20;

        // 绘制背景遮罩
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, w, h);

        // 绘制金色对话框（在遮罩之上）
        const r = 18;
        ctx.save();
        ctx.shadowColor = '#ffd700';
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
        // 填充完全不透明的深蓝灰色背景（更亮以便文字清晰）
        ctx.fillStyle = '#2a3d6b';
        ctx.fill();
        // 绘制金色边框
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // 关闭按钮
        const cx = bx + bw - 30;
        const cy = by + 30;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,80,80,0.95)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx + 8, cy + 8);
        ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx - 8, cy + 8);
        ctx.stroke();

        // 标题文字 - 增加亮度和阴影
        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffed4e';
        ctx.font = 'bold 72px "Courier New"';
        ctx.textAlign = 'center';
        if (this._data.level === 'xpeng') {
            ctx.fillText('🏆 成功逃离！', w/2, by + 110);
        } else {
            ctx.fillText('通关成功！', w/2, by + 110);
        }
        ctx.restore();

        // 关卡名称
        const levelName = this._data.level === 'tencent' ? '腾讯大堂探险' : '小鹏充电站竞速';
        ctx.save();
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#aaddff';
        ctx.font = 'bold 36px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(levelName, w/2, by + 180);
        ctx.restore();

        // 时间信息
        ctx.save();
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Courier New"';
        const time = this._data.time || 0;
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        ctx.fillText(`用时: ${mins}:${secs.toString().padStart(2,'0')}`, w/2, by + 240);
        ctx.restore();

        // 收集信息
        ctx.save();
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Courier New"';
        if (this._data.level === 'tencent') {
            ctx.fillText(`收集道具: ${this._data.collected || 0}/${this._data.totalProps || 6}`, w/2, by + 290);
        } else {
            ctx.fillText(`收集电池: ${this._data.collected || 0} 个`, w/2, by + 290);
        }
        ctx.restore();

        // 评价
        const rating = this._calcRating();
        ctx.save();
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 10;
        ctx.fillStyle = rating.color;
        ctx.font = 'bold 44px "Courier New"';
        ctx.fillText('评价: ' + rating.stars, w/2, by + 360);
        ctx.restore();

        // 故事文字
        if (this._data.level === 'tencent') {
            const thanks = [
                '🐧 太好了！我的系统恢复正常了！',
                '感谢你找回了所有6个核心模块！',
                '企鹅被修复了，它告诉你腾讯大楼的系统已经恢复正常',
                '作为感谢，企鹅送给你一份特殊的工程师认证徽章',
                '两个关卡都完成了，你成为了真正的卓越工程师！'
            ];
            ctx.save();
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#b0ffb0';
            ctx.font = 'bold 24px "Courier New"';
            let ty = by + 410;
            for (const line of thanks) {
                ctx.fillText(line, w/2, ty);
                ty += 34;
            }
            ctx.restore();
        } else if (this._data.level === 'xpeng') {
            const story = [
                '你成功驾驶小鹏汽车逃离了充电站！',
                '出色的驾驶技术证明了你是真正的卓越工程师！',
                '未来的科技之路，由你领航！'
            ];
            ctx.save();
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#aaddff';
            ctx.font = 'bold 24px "Courier New"';
            let ty = by + 410;
            for (const line of story) {
                ctx.fillText(line, w/2, ty);
                ty += 34;
            }
            ctx.restore();
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
            ctx.font = '28px "Courier New"';
            ctx.fillText('再来一次 (Enter)', w/2, this._btnBounds.y + 50);
        }

        const menuBtn = assets.getSprite('BTN_MENU');
        if (menuBtn && menuBtn.image && this._menuBtnBounds) {
            ctx.drawImage(menuBtn.image, this._menuBtnBounds.x, this._menuBtnBounds.y, this._menuBtnBounds.w, this._menuBtnBounds.h);
        } else {
            ctx.fillStyle = '#888';
            ctx.font = '26px "Courier New"';
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
        if (this._data.level === 'xpeng') {
            if (ratio >= 0.8) return { stars: '★★★', color: '#ffd700' };
            if (ratio >= 0.5) return { stars: '★★☆', color: '#c0c0c0' };
            return { stars: '★☆☆', color: '#cd7f32' };
        }
        if (ratio >= 1) return { stars: '★★★', color: '#ffd700' };
        if (ratio >= 0.7) return { stars: '★★☆', color: '#c0c0c0' };
        if (ratio >= 0.4) return { stars: '★☆☆', color: '#cd7f32' };
        return { stars: '☆☆☆', color: '#888' };
    }
}
