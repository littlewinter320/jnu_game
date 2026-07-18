// 主菜单场景
class MainMenuScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;

        this.buttons = [];
        this.selectedButton = 0;
        this.hoverParticleTimer = 0;
    }

    enter() {
        this.audio.playBGM('MAIN_MENU');

        // 创建按钮
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const startY = 600;
        const buttonWidth = 400;
        const buttonHeight = 80;
        const gap = 30;

        this.buttons = [
            { text: '开始游戏', x: centerX - buttonWidth / 2, y: startY, w: buttonWidth, h: buttonHeight, action: 'start' },
            { text: '操作说明', x: centerX - buttonWidth / 2, y: startY + buttonHeight + gap, w: buttonWidth, h: buttonHeight, action: 'help' },
            { text: '制作人员', x: centerX - buttonWidth / 2, y: startY + (buttonHeight + gap) * 2, w: buttonWidth, h: buttonHeight, action: 'credits' },
            { text: '设置', x: centerX - buttonWidth / 2, y: startY + (buttonHeight + gap) * 3, w: buttonWidth, h: buttonHeight, action: 'settings' }
        ];
    }

    update(dt) {
        // 鼠标悬停检测
        let hoveredIndex = -1;
        for (let i = 0; i < this.buttons.length; i++) {
            const btn = this.buttons[i];
            if (CollisionSystem.pointInRect(this.input.mouseX, this.input.mouseY, btn)) {
                hoveredIndex = i;
                break;
            }
        }

        // 悬停粒子效果
        if (hoveredIndex >= 0) {
            this.hoverParticleTimer += dt;
            if (this.hoverParticleTimer > 0.1) {
                this.hoverParticleTimer = 0;
                const btn = this.buttons[hoveredIndex];
                this.particles.emit(btn.x + Math.random() * btn.w, btn.y + Math.random() * btn.h, {
                    count: 2,
                    color: '#4af',
                    speedMin: 20, speedMax: 50,
                    sizeMin: 2, sizeMax: 4,
                    lifeMin: 0.3, lifeMax: 0.6,
                    shape: 'circle'
                });
            }
        }

        // 点击检测
        if (this.input.mouseJustClicked && hoveredIndex >= 0) {
            this.audio.playSFX('BUTTON_CLICK');
            const action = this.buttons[hoveredIndex].action;
            switch (action) {
                case 'start':
                    this.changeScene('characterSelect');
                    break;
                case 'help':
                    // TODO: 显示操作说明
                    break;
                case 'credits':
                    // TODO: 显示制作人员
                    break;
                case 'settings':
                    // TODO: 显示设置
                    break;
            }
        }

        // 键盘导航
        if (this.input.isJustPressed(CONFIG.KEYS.UP)) {
            this.selectedButton = (this.selectedButton - 1 + this.buttons.length) % this.buttons.length;
            this.audio.playSFX('BUTTON_HOVER');
        }
        if (this.input.isJustPressed(CONFIG.KEYS.DOWN)) {
            this.selectedButton = (this.selectedButton + 1) % this.buttons.length;
            this.audio.playSFX('BUTTON_HOVER');
        }
        if (this.input.isJustPressed(CONFIG.KEYS.ENTER)) {
            this.audio.playSFX('BUTTON_CLICK');
            const action = this.buttons[this.selectedButton].action;
            if (action === 'start') {
                this.changeScene('characterSelect');
            }
        }
    }

    render() {
        const ctx = this.renderer.ctx;

        // 背景
        const bgImage = this.renderer.images?.BG_MAIN;
        if (bgImage) {
            this.renderer.drawImage(bgImage, 0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        } else {
            // 渐变背景
            const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }

        // Logo
        const logoImage = this.renderer.images?.LOGO;
        if (logoImage) {
            const logoWidth = 800;
            const logoHeight = logoWidth * (logoImage.height / logoImage.width);
            const logoX = (CONFIG.CANVAS_WIDTH - logoWidth) / 2;
            const logoY = 200;
            this.renderer.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
        } else {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 60px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('卓越工程师的大冒险', CONFIG.CANVAS_WIDTH / 2, 300);
        }

        // 按钮
        for (let i = 0; i < this.buttons.length; i++) {
            const btn = this.buttons[i];
            const isHovered = CollisionSystem.pointInRect(this.input.mouseX, this.input.mouseY, btn);
            const isSelected = i === this.selectedButton;

            // 按钮背景
            if (isHovered || isSelected) {
                ctx.fillStyle = 'rgba(79, 172, 254, 0.3)';
                ctx.shadowColor = '#4af';
                ctx.shadowBlur = 20;
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 0;
            }
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

            // 按钮边框
            ctx.strokeStyle = isHovered || isSelected ? '#4af' : '#666';
            ctx.lineWidth = 3;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

            // 按钮文字
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px "Courier New"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2);

            ctx.shadowBlur = 0;
        }

        // 粒子
        this.particles.render(ctx);
    }
}
