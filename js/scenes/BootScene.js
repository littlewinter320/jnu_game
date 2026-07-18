// 启动场景 - 资源已由AssetLoader预加载完成，等待用户点击进入主菜单
class BootScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;
        this.enterTime = 0;
        this.canProceed = false;
    }

    enter() {
        this.enterTime = 0;
        this.canProceed = false;
        // 延迟一点再允许点击，防止误触
        setTimeout(() => { this.canProceed = true; }, 500);
    }

    update(dt) {
        this.enterTime += dt;

        if (!this.canProceed) return;

        if (this.input.mouseJustClicked
            || this.input.isJustPressed(CONFIG.KEYS.ENTER)
            || this.input.isJustPressed(CONFIG.KEYS.JUMP)
            || this.input.isJustPressed(CONFIG.KEYS.SPACE)
            || (this.input.touches && this.input.touches.length > 0)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }

        // 按键导航
        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            // 无操作
        }
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH;
        const h = CONFIG.CANVAS_HEIGHT;

        // 渐变背景
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a1628');
        grad.addColorStop(1, '#16213e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 网格
        ctx.strokeStyle = 'rgba(79, 172, 254, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 80) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 80) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Logo 或 标题
        const logoImg = this.renderer.images?.LOGO || (window.Game && window.Game.assets ? window.Game.assets.getSprite('LOGO')?.image : null);
        if (logoImg) {
            const logoW = Math.min(800, w * 0.5);
            const logoH = logoW * (logoImg.height / logoImg.width);
            ctx.drawImage(logoImg, (w - logoW) / 2, h * 0.25, logoW, logoH);
        } else {
            ctx.fillStyle = '#4facfe';
            ctx.font = 'bold 64px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 30;
            ctx.fillText('卓越工程师的大冒险', w / 2, h * 0.35);
            ctx.shadowBlur = 0;
        }

        // 闪烁提示文字
        const alpha = 0.5 + Math.sin(this.enterTime * 3) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = '28px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('点击任意位置 / 按空格 / 按回车 开始游戏', w / 2, h * 0.7);

        // 粒子
        this.particles.render(ctx);
    }
}
