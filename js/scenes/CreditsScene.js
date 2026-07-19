class CreditsScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;
        this._time = 0;
        this._animTime = 0;
        this._btnBounds = null;
    }

    enter() {
        this._time = 0;
        this._animTime = 0;
    }

    update(dt) {
        this._time += dt;
        this._animTime += dt;

        const mx = this.input.mouseX, my = this.input.mouseY;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const bw = 200, bh = 70;
        this._btnBounds = { x: w/2 - bw/2, y: h/2 + 180, w: bw, h: bh };

        const clicked = this._isIn(mx, my, this._btnBounds) && this.input.mouseJustClicked;
        const escOrSpace = this.input.isJustPressed(CONFIG.KEYS.ESC) || this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.JUMP);

        if (clicked || escOrSpace) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }
    }

    _isIn(mx, my, b) {
        return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;

        assets.drawBackground(ctx, 'BG_MAIN_MENU', this._time);

        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, w, h);

        const box = assets.getSprite('UI_DIALOG_BOX');
        const bw = 600, bh = 500;
        const bx = (w - bw) / 2, by = (h - bh) / 2 - 30;
        if (box && box.image) {
            ctx.drawImage(box.image, bx, by, bw, bh);
        } else {
            ctx.fillStyle = 'rgba(15,30,60,0.95)';
            ctx.strokeStyle = '#4facfe';
            ctx.lineWidth = 3;
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeRect(bx, by, bw, bh);
        }

        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 40px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('制作人员', w/2, by + 80);
        ctx.restore();

        const lines = [
            { text: '制作人：李钢宝乐德', color: '#4facfe', delay: 0.3 },
            { text: '', color: '#888', delay: 0.6 },
            { text: '美术：许铭睿', color: '#f4a460', delay: 0.9 },
            { text: '      吴安懒', color: '#f4a460', delay: 1.1 },
            { text: '      王再亮', color: '#f4a460', delay: 1.3 },
            { text: '', color: '#888', delay: 1.6 },
            { text: '音乐：叶昱翔', color: '#90ee90', delay: 1.9 },
        ];

        ctx.font = '26px "Courier New"';
        ctx.textAlign = 'center';
        lines.forEach((line, i) => {
            const alpha = Math.min(1, Math.max(0, (this._animTime - line.delay) / 0.4));
            ctx.globalAlpha = alpha;
            ctx.fillStyle = line.color;
            ctx.fillText(line.text, w/2, by + 150 + i * 38);
        });
        ctx.globalAlpha = 1;

        const btn = assets.getSprite('BTN_MENU');
        if (btn && btn.image && this._btnBounds) {
            const b = this._btnBounds;
            const pulse = 1 + Math.sin(this._time * 3) * 0.03;
            const sw = b.w * pulse, sh = b.h * pulse;
            const sx = b.x + (b.w - sw)/2, sy = b.y + (b.h - sh)/2;
            ctx.save();
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 15;
            ctx.drawImage(btn.image, sx, sy, sw, sh);
            ctx.restore();
        } else {
            ctx.fillStyle = '#4facfe';
            ctx.font = '24px "Courier New"';
            ctx.fillText('返回主菜单', w/2, by + bh - 50);
        }

        ctx.font = '16px "Courier New"';
        ctx.fillStyle = '#888';
        ctx.fillText('按 ESC 或 空格 或 点击按钮返回', w/2, h - 40);
    }
}
