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

    update(dt) {
        this._time += dt;
        this._confirmPulse += dt;

        const assets = window.Game.assets;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const mx = this.input.mouseX, my = this.input.mouseY;

        const leftBox = { x: w * 0.15, y: 200, w: w * 0.3, h: h * 0.6 };
        const rightBox = { x: w * 0.55, y: 200, w: w * 0.3, h: h * 0.6 };

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

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 52px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('选择你的工程师', w/2, 120);
        ctx.restore();

        const leftBox = { x: w * 0.15, y: 200, w: w * 0.3, h: h * 0.6 };
        const rightBox = { x: w * 0.55, y: 200, w: w * 0.3, h: h * 0.6 };

        this._drawCharPanel(ctx, leftBox, 'male', this.selectedGender === 'male', this._hoverSide === 'male');
        this._drawCharPanel(ctx, rightBox, 'female', this.selectedGender === 'female', this._hoverSide === 'female');

        const pulseScale = 1 + Math.sin(this._confirmPulse * 4) * 0.04;
        const btnW = 280, btnH = 80;
        const btnX = w/2 - btnW/2, btnY = h - 160;

        ctx.save();
        const startSprite = assets.getSprite('BTN_START');
        if (startSprite && startSprite.image) {
            const sw = btnW * pulseScale, sh = btnH * pulseScale;
            const sx = btnX + (btnW - sw)/2, sy = btnY + (btnH - sh)/2;
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 20;
            ctx.drawImage(startSprite.image, sx, sy, sw, sh);
        }
        ctx.restore();

        ctx.fillStyle = '#aaa';
        ctx.font = '22px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('← → / A D 选择  |  空格/回车 确认  |  ESC 返回', w/2, h - 50);

        this.particles.render(ctx);
    }

    _drawCharPanel(ctx, box, gender, selected, hovered) {
        const assets = window.Game.assets;
        const cx = box.x + box.w/2;
        const cy = box.y + box.h/2;

        ctx.save();
        if (selected) {
            ctx.fillStyle = 'rgba(79, 172, 254, 0.15)';
            ctx.strokeStyle = '#4facfe';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 25;
        } else if (hovered) {
            ctx.fillStyle = 'rgba(79, 172, 254, 0.08)';
            ctx.strokeStyle = 'rgba(79, 172, 254, 0.6)';
            ctx.lineWidth = 2;
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
        }
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeRect(box.x, box.y, box.w, box.h);
        ctx.restore();

        const genderKey = gender === 'male' ? 'UI_GENDER_MALE' : 'UI_GENDER_FEMALE';
        const genderSprite = assets.getSprite(genderKey);
        const portraitKey = gender === 'male' ? 'CHAR_PORTRAIT_MALE' : 'CHAR_PORTRAIT_FEMALE';

        const idleAnim = assets.getAnimInfo(gender, 'idle');
        if (idleAnim) {
            const scale = 1.8;
            const fw = idleAnim.frameWidth * scale;
            const fh = idleAnim.frameHeight * scale;
            const dx = cx - fw/2;
            const dy = cy - fh/2 + 20;
            const frameIdx = Math.floor(this._time * 4) % idleAnim.frames.length;
            assets.drawCharacter(ctx, gender, 'idle', dx, dy, frameIdx, scale);
        }

        ctx.save();
        ctx.fillStyle = selected ? '#4facfe' : '#fff';
        ctx.font = 'bold 34px "Courier New"';
        ctx.textAlign = 'center';
        ctx.shadowColor = selected ? '#4facfe' : '#000';
        ctx.shadowBlur = selected ? 15 : 4;
        ctx.fillText(gender === 'male' ? '男性工程师' : '女性工程师', cx, box.y + box.h - 60);
        ctx.restore();

        if (selected) {
            ctx.save();
            ctx.fillStyle = '#4facfe';
            ctx.font = 'bold 20px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('✓ 已选择', cx, box.y + box.h - 25);
            ctx.restore();
        }
    }
}
