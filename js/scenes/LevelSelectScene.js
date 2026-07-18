class LevelSelectScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
    }
    enter() {}
    update(dt) {
        if (this.input.isJustPressed(CONFIG.KEYS.ESC) || this.input.mouseJustClicked) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }
    }
    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        ctx.fillStyle = '#0f1729'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 48px "Courier New"';
        ctx.textAlign = 'center'; ctx.fillText('关卡选择（开发中）', w/2, h/2 - 40);
        ctx.font = '24px "Courier New"'; ctx.fillStyle = '#888';
        ctx.fillText('点击返回主菜单', w/2, h/2 + 40);
    }
}
