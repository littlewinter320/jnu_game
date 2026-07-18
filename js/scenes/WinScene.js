class WinScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
    }
    enter() {}
    update(dt) {
        if (this.input.mouseJustClicked || this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }
    }
    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        ctx.fillStyle = '#0a3d0a'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 64px "Courier New"';
        ctx.textAlign = 'center'; ctx.fillText('🎉 通关成功！', w/2, h/2 - 40);
        ctx.fillStyle = '#fff'; ctx.font = '24px "Courier New"';
        ctx.fillText('点击或按 ESC 返回主菜单', w/2, h/2 + 40);
    }
}
