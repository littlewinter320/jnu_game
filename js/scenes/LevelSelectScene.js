class LevelSelectScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;
        this.selectedLevel = 0;
        this._time = 0;
        this._hoverIdx = -1;
        this.gender = 'male';
    }

    enter(data) {
        this._time = 0;
        this.gender = data?.gender || 'male';
        this.selectedLevel = 0;
    }

    update(dt) {
        this._time += dt;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const mx = this.input.mouseX, my = this.input.mouseY;
        const assets = window.Game.assets;

        const cardW = 460, cardH = 640;
        const cardY = h/2 - cardH/2 + 10;
        const gap = 80;
        const totalW = cardW * 2 + gap;
        const startX = (w - totalW) / 2;
        const tencentX = startX;
        const xpengX = startX + cardW + gap;

        this._hoverIdx = -1;
        if (this._pointIn(mx, my, {x:tencentX, y:cardY, w:cardW, h:cardH})) this._hoverIdx = 0;
        else if (this._pointIn(mx, my, {x:xpengX, y:cardY, w:cardW, h:cardH})) this._hoverIdx = 1;

        if (this.input.isJustPressed(CONFIG.KEYS.LEFT) || this.input.isJustPressed(CONFIG.KEYS.A)) {
            this.selectedLevel = 0;
            this.audio.playSFX('BUTTON_HOVER');
        }
        if (this.input.isJustPressed(CONFIG.KEYS.RIGHT) || this.input.isJustPressed(CONFIG.KEYS.D)) {
            this.selectedLevel = 1;
            this.audio.playSFX('BUTTON_HOVER');
        }

        if (this.input.mouseJustClicked && this._hoverIdx >= 0) {
            this.selectedLevel = this._hoverIdx;
            this.audio.playSFX('BUTTON_CLICK');
            this._enterLevel();
        }

        if (this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.JUMP) ||
            this.input.isJustPressed(CONFIG.KEYS.W) || this.input.isJustPressed(CONFIG.KEYS.UP)) {
            this.audio.playSFX('BUTTON_CLICK');
            this._enterLevel();
        }

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.CHARACTER_SELECT, { gender: this.gender });
        }

        this.particles.update(dt);

        if (Math.random() < 0.3) {
            const px = Math.random() * w;
            const py = Math.random() * h * 0.8;
            this.particles.emit(px, py, {
                count: 1, spreadX: 0, spreadY: 0, life: 1.5, size: 2,
                colors: ['rgba(79,172,254,0.3)', 'rgba(0,242,254,0.2)'],
                gravity: -30, shape: 'circle'
            });
        }
    }

    _enterLevel() {
        if (this.selectedLevel === 0) {
            this.changeScene(CONFIG.SCENES.TENCENT_INTRO, { gender: this.gender });
        } else {
            this.changeScene(CONFIG.SCENES.XPENG_INTRO, { gender: this.gender });
        }
    }

    _pointIn(x, y, b) {
        return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;

        assets.drawBackground(ctx, 'BG_LEVEL_SELECT', this._time);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 62px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('选择关卡', w/2, 120);
        ctx.restore();

        const cardW = 460, cardH = 640;
        const cardY = h/2 - cardH/2 + 10;
        const gap = 80;
        const totalW = cardW * 2 + gap;
        const startX = (w - totalW) / 2;
        const tencentX = startX;
        const xpengX = startX + cardW + gap;

        this._drawLevelCard(ctx, tencentX, cardY, cardW, cardH, 'tencent', 0);
        this._drawLevelCard(ctx, xpengX, cardY, cardW, cardH, 'xpeng', 1);

        ctx.fillStyle = '#bbb';
        ctx.font = '26px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('← → 选择  |  空格/回车 进入  |  ESC 返回', w/2, h - 50);

        this.particles.render(ctx);
    }

    _drawLevelCard(ctx, x, y, w, h, type, idx) {
        const assets = window.Game.assets;
        const selected = this.selectedLevel === idx;
        const hovered = this._hoverIdx === idx;
        const pulse = Math.sin(this._time * 2 + idx) * 0.02;

        const cardKey = type === 'tencent' ? 'UI_CARD_TENCENT' : 'UI_CARD_XPENG';
        const cardSprite = assets.getSprite(cardKey);

        ctx.save();
        let drawW = w, drawH = h;
        let drawX = x, drawY = y;
        if (selected) {
            const s = 1.06 + pulse;
            drawW = w * s; drawH = h * s;
            drawX = x - (drawW - w)/2; drawY = y - (drawH - h)/2;
            ctx.shadowColor = type === 'tencent' ? '#4facfe' : '#ff8c00';
            ctx.shadowBlur = 40;
        } else if (hovered) {
            const s = 1.03;
            drawW = w * s; drawH = h * s;
            drawX = x - (drawW - w)/2; drawY = y - (drawH - h)/2;
            ctx.shadowColor = type === 'tencent' ? 'rgba(79,172,254,0.5)' : 'rgba(255,140,0,0.5)';
            ctx.shadowBlur = 25;
        }

        if (cardSprite && cardSprite.image) {
            ctx.drawImage(cardSprite.image, drawX, drawY, drawW, drawH);
        } else {
            ctx.fillStyle = type === 'tencent' ? 'rgba(30,60,120,0.9)' : 'rgba(60,30,20,0.9)';
            ctx.fillRect(drawX, drawY, drawW, drawH);
            ctx.strokeStyle = selected ? (type === 'tencent' ? '#4facfe' : '#ff8c00') : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = selected ? 4 : 2;
            ctx.strokeRect(drawX, drawY, drawW, drawH);
        }

        ctx.fillStyle = selected ? '#fff' : 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 42px "Courier New"';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillText(type === 'tencent' ? '腾讯滨海大厦' : '小鹏智造工厂', x + w/2, y + h - 100);

        ctx.font = '24px "Courier New"';
        ctx.fillStyle = selected ? (type === 'tencent' ? '#aaddff' : '#ffcc88') : 'rgba(255,255,255,0.7)';
        ctx.fillText(type === 'tencent' ? '横版平台冒险' : '自动跑酷生存', x + w/2, y + h - 60);

        if (selected) {
            ctx.fillStyle = type === 'tencent' ? '#4facfe' : '#ff8c00';
            ctx.font = 'bold 26px "Courier New"';
            ctx.fillText('▼ 已选择 ▼', x + w/2, y + h - 20);
        }
        ctx.restore();
    }
}
