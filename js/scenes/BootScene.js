class BootScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;
        this.enterTime = 0;
        this.canProceed = false;
        this._bgTime = 0;
    }

    enter() {
        this.enterTime = 0;
        this.canProceed = false;
        this._bgTime = 0;
        setTimeout(() => { this.canProceed = true; }, 600);
    }

    update(dt) {
        this.enterTime += dt;
        this._bgTime += dt;
        if (!this.canProceed) return;
        if (this.input.mouseJustClicked
            || this.input.isJustPressed(CONFIG.KEYS.ENTER)
            || this.input.isJustPressed(CONFIG.KEYS.JUMP)
            || this.input.isJustPressed(CONFIG.KEYS.SPACE)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.audio.playBGM('ADVENTURE');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH;
        const h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;

        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a1628');
        grad.addColorStop(1, '#16213e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(79, 172, 254, 0.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
        for (let y = 0; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

        const logo = assets.getSprite('LOGO');
        if (logo && logo.image) {
            const lw = Math.min(560, w * 0.35);
            const lh = lw * (logo.naturalHeight / logo.naturalWidth);
            ctx.drawImage(logo.image, (w-lw)/2, h*0.2, lw, lh);
        } else {
            ctx.fillStyle = '#4facfe';
            ctx.font = 'bold 56px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#4facfe'; ctx.shadowBlur = 30;
            ctx.fillText('卓越工程师大冒险', w/2, h*0.35);
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = '#8ec5fc';
        ctx.font = '22px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('ALPHA VERSION', w/2, h*0.5);

        const a = 0.5 + Math.sin(this.enterTime * 3) * 0.5;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.font = '26px "Courier New"';
        ctx.fillText('点击任意位置 / 按空格 / 按回车 开始', w/2, h*0.72);

        this.particles.render(ctx);
    }
}
