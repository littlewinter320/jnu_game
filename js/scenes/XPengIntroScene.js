class XPengIntroScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.t = 0;
    }
    enter() { this.t = 0; }
    update(dt) {
        this.t += dt;
        if (this.t > 3 || this.input.mouseJustClicked || this.input.isJustPressed(CONFIG.KEYS.ENTER)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }
    }
    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        ctx.fillStyle = '#1a2332'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = '#ff6b35'; ctx.font = 'bold 56px "Courier New"';
        ctx.textAlign = 'center'; ctx.fillText('第二站：小鹏汽车', w/2, h/2 - 40);
        ctx.fillStyle = '#fff'; ctx.font = '28px "Courier New"';
        ctx.fillText('（开发中）点击跳过', w/2, h/2 + 40);
    }
}
