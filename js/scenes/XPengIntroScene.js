class XPengIntroScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.t = 0;
        this.gender = 'male';
    }
    enter(data) {
        this.t = 0;
        this.gender = data?.gender || 'male';
        this.audio.playBGM('XPENG');
    }
    update(dt) {
        this.t += dt;
        const skip = this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.JUMP) ||
                   this.input.isJustPressed(CONFIG.KEYS.SPACE) || this.input.mouseJustClicked;
        if (this.t > 4.5 || skip) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.XPENG_RUN, { gender: this.gender });
        }
        this.particles.update(dt);
        if (Math.random() < 0.6) {
            const py = Math.random() * CONFIG.CANVAS_HEIGHT;
            this.particles.emit(CONFIG.CANVAS_WIDTH + 20, py, {
                count: 1, spreadX: 0, spreadY: 10, life: 0.6, size: 3,
                colors: ['#ff8c00', '#ffa500', '#ffcc00', '#fff'], gravity: 0, shape: 'rect'
            });
        }
    }
    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;
        assets.drawBackground(ctx, 'BG_XPENG_STAGE1', this.t);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);

        const alpha1 = Math.min(1, this.t / 0.8);
        const alpha2 = Math.min(1, Math.max(0, (this.t - 0.8) / 0.6));
        const alpha3 = Math.min(1, Math.max(0, (this.t - 1.6) / 0.6));
        const alpha4 = Math.min(1, Math.max(0, (this.t - 2.8) / 0.5));

        ctx.save();
        ctx.globalAlpha = alpha1;
        ctx.shadowColor = '#ff8c00';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#ff8c00';
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('── 第二关 ──', w/2, h/2 - 160);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha2;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 68px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('小鹏智造工厂', w/2, h/2 - 80);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha3;
        ctx.fillStyle = '#ffddb0';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('小鹏智造工厂的自动化产线突然失控', w/2, h/2 - 30);
        ctx.fillText('充电桩过载，障碍物四处散落', w/2, h/2 + 5);
        ctx.fillText('你需要在自动奔跑中躲避危险，收集电池坚持到终点！', w/2, h/2 + 40);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = Math.min(1, Math.max(0, (this.t - 2.2) / 0.5));
        ctx.fillStyle = '#ffcc88';
        ctx.font = '20px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('空格/↑跳跃  |  S/↓下蹲  |  ←→/AD切换车道', w/2, h/2 + 85);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha4;
        const blink = Math.sin(this.t * 6) > 0 ? 1 : 0.4;
        ctx.fillStyle = `rgba(255,255,255,${blink})`;
        ctx.font = '22px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('按空格/回车开始，或等待自动进入...', w/2, h/2 + 140);
        ctx.restore();

        this.particles.render(ctx);
    }
}
