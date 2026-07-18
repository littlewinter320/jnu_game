// 角色选择场景
class CharacterSelectScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;

        this.selectedGender = 'male';
        this.confirmTimer = 0;
    }

    enter() {
        this.audio.playBGM('MAIN_MENU');
    }

    update(dt) {
        // 左右选择
        if (this.input.isJustPressed(CONFIG.KEYS.LEFT) || this.input.isJustPressed(CONFIG.KEYS.A)) {
            this.selectedGender = 'male';
            this.audio.playSFX('BUTTON_HOVER');
        }
        if (this.input.isJustPressed(CONFIG.KEYS.RIGHT) || this.input.isJustPressed(CONFIG.KEYS.D)) {
            this.selectedGender = 'female';
            this.audio.playSFX('BUTTON_HOVER');
        }

        // 鼠标点击选择
        if (this.input.mouseJustClicked) {
            const midX = CONFIG.CANVAS_WIDTH / 2;
            if (this.input.mouseX < midX) {
                this.selectedGender = 'male';
            } else {
                this.selectedGender = 'female';
            }
            this.audio.playSFX('BUTTON_HOVER');
        }

        // 确认
        if (this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.SPACE)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.LEVEL_SELECT, { gender: this.selectedGender });
        }

        // 返回
        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }
    }

    render() {
        const ctx = this.renderer.ctx;

        // 背景
        const bgImage = this.renderer.images?.BG_CHAR_SELECT;
        if (bgImage) {
            this.renderer.drawImage(bgImage, 0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        } else {
            const gradient = ctx.createLinearGradient(0, 0, CONFIG.CANVAS_WIDTH, 0);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#2a2a4e');
            gradient.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }

        // 标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('选择你的工程师', CONFIG.CANVAS_WIDTH / 2, 100);

        // 左侧 - 男性
        const leftX = CONFIG.CANVAS_WIDTH / 4;
        const rightX = CONFIG.CANVAS_WIDTH * 3 / 4;
        const charY = 300;
        const charSize = 400;

        // 男性框
        const maleSelected = this.selectedGender === 'male';
        this._drawCharacterBox(ctx, leftX - charSize / 2, charY, charSize, charSize, 'male', maleSelected);

        // 女性框
        const femaleSelected = this.selectedGender === 'female';
        this._drawCharacterBox(ctx, rightX - charSize / 2, charY, charSize, charSize, 'female', femaleSelected);

        // 提示
        ctx.fillStyle = '#aaa';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('← → 选择角色  |  空格/回车 确认  |  ESC 返回', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 50);

        // 粒子
        this.particles.render(ctx);
    }

    _drawCharacterBox(ctx, x, y, w, h, gender, selected) {
        ctx.save();
        if (selected) {
            ctx.fillStyle = 'rgba(79, 172, 254, 0.2)';
            ctx.shadowColor = '#4af';
            ctx.shadowBlur = 30;
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(x, y, w, h);
        ctx.restore();

        ctx.strokeStyle = selected ? '#4af' : '#555';
        ctx.lineWidth = selected ? 4 : 2;
        ctx.strokeRect(x, y, w, h);

        const assets = window.Game?.assets;
        const animTime = performance.now() / 200;
        const frameIdx = Math.floor(animTime) % 4;
        if (assets && assets.getAnimInfo(gender, 'idle')) {
            const scale = (w - 100) / 80;
            const drawW = 80 * scale;
            const drawH = 72 * scale;
            const drawX = x + (w - drawW) / 2;
            const drawY = y + (h - drawH) / 2;
            assets.drawCharacter(ctx, gender, 'idle', drawX, drawY, frameIdx, scale);
        } else {
            ctx.fillStyle = gender === 'male' ? '#4af' : '#f4a';
            ctx.fillRect(x + 100, y + 100, w - 200, h - 200);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 48px "Courier New"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(gender === 'male' ? '男' : '女', x + w / 2, y + h / 2);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(gender === 'male' ? '男性工程师' : '女性工程师', x + w / 2, y + h + 40);
    }
}
