class TencentIntroScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.t = 0;
        this.gender = 'male';
    }
    enter(data) {
        this.t = 0;
        this.gender = data?.gender || 'male';
        this.audio.playBGM('TENCENT');
    }
    update(dt) {
        this.t += dt;
        const skip = this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.JUMP) ||
                   this.input.isJustPressed(CONFIG.KEYS.SPACE) || this.input.mouseJustClicked;
        if (this.t > 4.5 || skip) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.TENCENT_LOBBY, { gender: this.gender });
        }
        this.particles.update(dt);
        if (Math.random() < 0.5) {
            const px = Math.random() * CONFIG.CANVAS_WIDTH;
            this.particles.emit(px, -10, {
                count: 1, spreadX: 20, spreadY: 0, life: 2, size: 3,
                colors: ['#4facfe', '#00f2fe', '#88ddff'], gravity: 80, shape: 'circle'
            });
        }
    }
    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;
        assets.drawBackground(ctx, 'BG_TENCENT_LOBBY', this.t);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, w, h);

        const alpha1 = Math.min(1, this.t / 0.8);
        const alpha2 = Math.min(1, Math.max(0, (this.t - 0.8) / 0.6));
        const alpha3 = Math.min(1, Math.max(0, (this.t - 1.6) / 0.6));
        const alpha4 = Math.min(1, Math.max(0, (this.t - 2.8) / 0.5));

        ctx.save();
        ctx.globalAlpha = alpha1;
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('── 第一关 ──', w/2, h/2 - 160);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha2;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 68px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('腾讯滨海大厦', w/2, h/2 - 80);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha3;
        ctx.fillStyle = '#cce7ff';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('2025年，腾讯滨海大厦的核心系统突发故障', w/2, h/2 - 30);
        ctx.fillText('六大事业群的数据模块散落各处', w/2, h/2 + 5);
        ctx.fillText('作为卓越工程师，你需要收集所有道具修复系统！', w/2, h/2 + 40);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = Math.min(1, Math.max(0, (this.t - 2.2) / 0.5));
        ctx.fillStyle = '#88ccff';
        ctx.font = '20px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('WASD/方向键移动  |  空格跳跃  |  S键下蹲', w/2, h/2 + 85);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha4;
        const blink = Math.sin(this.t * 6) > 0 ? 1 : 0.4;
        ctx.fillStyle = `rgba(255,255,255,${blink})`;
        ctx.font = '22px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('按空格/回车开始，或等待自动进入...', w/2, h/2 + 120);
        ctx.restore();

        this.particles.render(ctx);
    }
}
