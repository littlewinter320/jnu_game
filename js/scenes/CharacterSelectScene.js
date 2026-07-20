class CharacterSelectScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;
        this.selectedGender = 'male';
        this._time = 0;
        this._hoverSide = null;
        this._confirmPulse = 0;
    }

    enter(data) {
        this._time = 0;
        this.selectedGender = data?.gender || 'male';
        this.audio.playBGM('MAIN_MENU');
    }

    _getLayout(w, h) {
        const boxW = Math.min(w * 0.33, 480);
        const boxH = Math.min(h * 0.58, 560);
        const gap = w * 0.08;
        const totalW = boxW * 2 + gap;
        const startX = (w - totalW) / 2;
        const topY = 160;
        const safeStartX = Math.max(10, startX);
        const safeRightX = safeStartX + boxW + gap + boxW;
        return {
            leftBox: { x: safeStartX, y: topY, w: boxW, h: boxH },
            rightBox: { x: safeStartX + boxW + gap, y: topY, w: boxW, h: boxH }
        };
    }

    update(dt) {
        this._time += dt;
        this._confirmPulse += dt;

        const assets = window.Game.assets;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const mx = this.input.mouseX, my = this.input.mouseY;

        const { leftBox, rightBox } = this._getLayout(w, h);

        this._hoverSide = null;
        if (this._pointIn(mx, my, leftBox)) this._hoverSide = 'male';
        else if (this._pointIn(mx, my, rightBox)) this._hoverSide = 'female';

        if (this.input.isJustPressed(CONFIG.KEYS.LEFT) || this.input.isJustPressed(CONFIG.KEYS.A)) {
            if (this.selectedGender !== 'male') {
                this.selectedGender = 'male';
                this.audio.playSFX('BUTTON_HOVER');
                this._emitSelectParticles(leftBox.x + leftBox.w/2, leftBox.y + leftBox.h/2);
            }
        }
        if (this.input.isJustPressed(CONFIG.KEYS.RIGHT) || this.input.isJustPressed(CONFIG.KEYS.D)) {
            if (this.selectedGender !== 'female') {
                this.selectedGender = 'female';
                this.audio.playSFX('BUTTON_HOVER');
                this._emitSelectParticles(rightBox.x + rightBox.w/2, rightBox.y + rightBox.h/2);
            }
        }

        if (this.input.mouseJustClicked && this._hoverSide) {
            if (this.selectedGender !== this._hoverSide) {
                this.audio.playSFX('BUTTON_HOVER');
            }
            this.selectedGender = this._hoverSide;
            return;
        }

        // 底部确认按钮点击检测
        const btnW = 330, btnH = 95;
        const btnX = w/2 - btnW/2, btnY = h - 175;
        if (this.input.mouseJustClicked && this._isInBox(mx, my, btnX, btnY, btnW, btnH)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.LEVEL_SELECT, { gender: this.selectedGender });
            return;
        }

        if (this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.JUMP) ||
            this.input.isJustPressed(CONFIG.KEYS.W) || this.input.isJustPressed(CONFIG.KEYS.UP)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.LEVEL_SELECT, { gender: this.selectedGender });
        }

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }

        this.particles.update(dt);
    }

    _pointIn(x, y, b) {
        return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }

    _isInBox(x, y, bx, by, bw, bh) {
        return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
    }

    _emitSelectParticles(x, y) {
        this.particles.emit(x, y, {
            count: 20, spreadX: 200, spreadY: 200, life: 0.6, size: 4,
            colors: ['#4facfe', '#00f2fe', '#fff', '#88ddff'],
            shape: 'star', upwardBias: 80
        });
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;

        assets.drawBackground(ctx, 'BG_CHAR_SELECT', this._time);

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 62px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('选择你的工程师', w/2, 130);
        ctx.restore();

        const { leftBox, rightBox } = this._getLayout(w, h);

        this._drawCharPanel(ctx, leftBox, 'male', this.selectedGender === 'male', this._hoverSide === 'male');
        this._drawCharPanel(ctx, rightBox, 'female', this.selectedGender === 'female', this._hoverSide === 'female');

        const pulseScale = 1 + Math.sin(this._confirmPulse * 4) * 0.04;
        const btnW = 330, btnH = 95;
        const btnX = w/2 - btnW/2, btnY = h - 175;

        // 自绘底部确认按钮
        ctx.save();
        const sw = btnW * pulseScale, sh = btnH * pulseScale;
        const sx = btnX + (btnW - sw)/2, sy = btnY + (btnH - sh)/2;
        
        // 按钮背景渐变
        const grad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
        grad.addColorStop(0, '#4facfe');
        grad.addColorStop(1, '#00f2fe');
        ctx.fillStyle = grad;
        
        // 发光效果
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 30;
        
        // 圆角矩形
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, 16);
        ctx.fill();
        
        // 按钮文字
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('开始冒险', sx + sw/2, sy + sh/2);
        ctx.restore();

        // 操作提示文字
        ctx.fillStyle = '#aaa';
        ctx.font = '22px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('← → / A D 选择角色  |  鼠标点击选择  |  回车/空格/点击按钮 确认  |  ESC 返回', w/2, h - 55);

        this.particles.render(ctx);
    }

    _drawCharPanel(ctx, box, gender, selected, hovered) {
        const assets = window.Game.assets;
        const cx = box.x + box.w/2;
        const cy = box.y + box.h/2;

        ctx.save();
        if (selected) {
            ctx.fillStyle = 'rgba(79, 172, 254, 0.18)';
            ctx.strokeStyle = '#4facfe';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 30;
        } else if (hovered) {
            ctx.fillStyle = 'rgba(79, 172, 254, 0.1)';
            ctx.strokeStyle = 'rgba(79, 172, 254, 0.7)';
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 2;
        }
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, box.w, box.h, 16);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const idleAnim = assets.getAnimInfo(gender, 'idle');
        if (idleAnim) {
            const scale = 2.8;
            const fw = idleAnim.frameWidth * scale;
            const fh = idleAnim.frameHeight * scale;
            const dx = cx - fw/2;
            const dy = cy - fh/2 + 20;
            const frameIdx = Math.floor(this._time * 4) % idleAnim.frames.length;
            assets.drawCharacter(ctx, gender, 'idle', dx, dy, frameIdx, scale);
        }

        ctx.save();
        ctx.fillStyle = selected ? '#4facfe' : '#fff';
        ctx.font = 'bold 44px "Courier New"';
        ctx.textAlign = 'center';
        ctx.shadowColor = selected ? '#4facfe' : '#000';
        ctx.shadowBlur = selected ? 18 : 5;
        ctx.fillText(gender === 'male' ? '男性工程师' : '女性工程师', cx, box.y + box.h - 70);
        ctx.restore();

        if (selected) {
            ctx.save();
            ctx.fillStyle = '#4facfe';
            ctx.font = 'bold 24px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 10;
            ctx.fillText('✓ 已选择', cx, box.y + box.h - 30);
            ctx.restore();
        }
    }
}
