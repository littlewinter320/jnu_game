class MainMenuScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;
        this._time = 0;
        this._buttons = [];
        this._hoverIdx = -1;
        this._showHelp = false;
        this._showEndConfirm = false;
        this._pulse = 0;
    }

    enter() {
        this._time = 0;
        this._showHelp = false;
        this._showEndConfirm = false;
        this._layoutButtons();
        this.audio.playBGM('ADVENTURE');
    }

    _layoutButtons() {
        const cx = CONFIG.CANVAS_WIDTH / 2;
        const startY = 480;
        const gap = 20;
        const bw = 320, bh = 86;
        const labels = [
            { key: 'BTN_START', scene: CONFIG.SCENES.CHARACTER_SELECT },
            { key: 'BTN_HELP', action: 'help' },
            { key: 'BTN_CREDITS', scene: CONFIG.SCENES.CREDITS },
            { key: 'BTN_END', action: 'end' }
        ];
        this._buttons = labels.map((b, i) => ({
            ...b,
            x: cx - bw/2,
            y: startY + i * (bh + gap),
            w: bw, h: bh,
            scale: 1
        }));
        this._settingsBtn = { x: CONFIG.CANVAS_WIDTH - 180, y: 30, w: 160, h: 47 };
    }

    update(dt) {
        this._time += dt;
        this._pulse += dt;

        if (this._showHelp || this._showEndConfirm) {
            if (this.input.isJustPressed(CONFIG.KEYS.ESC) || this.input.mouseJustClicked) {
                const mx = this.input.mouseX, my = this.input.mouseY;
                if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
                    this.audio.playSFX('BUTTON_CLICK');
                    this._showHelp = false;
                    this._showEndConfirm = false;
                    return;
                }
                if (this._isInBox(mx, my, CONFIG.CANVAS_WIDTH/2 - 130, CONFIG.CANVAS_HEIGHT/2 + 80, 120, 50) ||
                    !this._isInBox(mx, my, CONFIG.CANVAS_WIDTH/2 - 300, CONFIG.CANVAS_HEIGHT/2 - 180, 600, 350)) {
                    this.audio.playSFX('BUTTON_CLICK');
                    this._showHelp = false;
                    this._showEndConfirm = false;
                    return;
                }
            }
            return;
        }

        const mx = this.input.mouseX, my = this.input.mouseY;
        this._hoverIdx = -1;
        for (let i = 0; i < this._buttons.length; i++) {
            const b = this._buttons[i];
            const over = this._isInBox(mx, my, b.x, b.y, b.w, b.h);
            if (over) {
                this._hoverIdx = i;
                b.scale = Math.min(b.scale + dt * 5, CONFIG.UI.BUTTON_HOVER_SCALE);
                if (this.input.mouseJustClicked) {
                    this.audio.playSFX('BUTTON_CLICK');
                    if (b.scene) this.changeScene(b.scene);
                    else if (b.action === 'help') this._showHelp = true;
                    else if (b.action === 'end') this._showEndConfirm = true;
                }
            } else {
                b.scale = Math.max(b.scale - dt * 5, 1.0);
            }
        }

        if (this._isInBox(mx, my, this._settingsBtn.x, this._settingsBtn.y, this._settingsBtn.w, this._settingsBtn.h)) {
            if (this.input.mouseJustClicked) this.audio.playSFX('BUTTON_CLICK');
        }

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.audio.playSFX('BUTTON_CLICK');
        }
    }

    _isInBox(mx, my, x, y, w, h) {
        return mx >= x && mx <= x + w && my >= y && my <= y + h;
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;

        assets.drawBackground(ctx, 'BG_MAIN_MENU', this._time);

        const logo = assets.getSprite('LOGO');
        if (logo && logo.image) {
            const lw = 560, lh = 200;
            ctx.drawImage(logo.image, (w-lw)/2, 100, lw, lh);
        } else {
            ctx.fillStyle = '#4facfe';
            ctx.font = 'bold 64px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#4facfe'; ctx.shadowBlur = 30;
            ctx.fillText('卓越工程师大冒险', w/2, 200);
            ctx.shadowBlur = 0;
        }

        for (let i = 0; i < this._buttons.length; i++) {
            const b = this._buttons[i];
            const img = assets.getSprite(b.key);
            if (img && img.image) {
                const sw = b.w * b.scale;
                const sh = b.h * b.scale;
                const sx = b.x + (b.w - sw)/2;
                const sy = b.y + (b.h - sh)/2;
                if (this._hoverIdx === i) {
                    ctx.save();
                    ctx.shadowColor = '#4facfe';
                    ctx.shadowBlur = 20;
                }
                ctx.drawImage(img.image, sx, sy, sw, sh);
                if (this._hoverIdx === i) ctx.restore();
            }
        }

        const sbtn = assets.getSprite('BTN_SETTINGS');
        if (sbtn && sbtn.image) {
            ctx.globalAlpha = 0.6;
            ctx.drawImage(sbtn.image, this._settingsBtn.x, this._settingsBtn.y, this._settingsBtn.w, this._settingsBtn.h);
            ctx.globalAlpha = 1;
        }

        if (this._showHelp) this._renderDialog(
            '操作说明',
            [
                '← → / A D ： 左右移动',
                '空格 / W / ↑ ： 跳跃（支持二段跳）',
                '↓ / S / C ： 下蹲',
                'ESC ： 暂停游戏',
                '',
                '【腾讯大堂】收集6个事业群道具修复企鹅即可通关',
                '【小鹏充电桩】自动奔跑，躲避障碍收集电池坚持120秒',
                '',
                '点击任意处或按ESC关闭'
            ]
        );

        if (this._showEndConfirm) this._renderDialog(
            '感谢游玩',
            [
                '感谢游玩《卓越工程师大冒险》！',
                'Alpha版本演示到此结束。',
                '',
                '点击任意处或按ESC返回'
            ]
        );
    }

    _renderDialog(title, lines) {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);

        const box = assets.getSprite('UI_DIALOG_BOX');
        const bw = 600, bh = 370;
        const bx = (w - bw) / 2, by = (h - bh) / 2;
        if (box && box.image) {
            ctx.drawImage(box.image, bx, by, bw, bh);
        } else {
            ctx.fillStyle = 'rgba(20,40,80,0.95)';
            ctx.strokeStyle = '#4facfe';
            ctx.lineWidth = 3;
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeRect(bx, by, bw, bh);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(title, w/2, by + 55);

        ctx.font = '18px "Courier New"';
        ctx.fillStyle = '#cde';
        lines.forEach((line, i) => {
            ctx.fillText(line, w/2, by + 100 + i * 32);
        });
    }
}
