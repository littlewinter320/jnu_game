class MainMenuScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;
        this._time = 0;
        this._buttons = [];
        this._hoverIdx = -1;
        this._showHelp = false;
        this._showCredits = false;
        this._showEndConfirm = false;
        this._pulse = 0;
        this._bgOffset = 0;
        this._particlesEmit = 0;
    }

    enter() {
        this._time = 0;
        this._showHelp = false;
        this._showCredits = false;
        this._showEndConfirm = false;
        this._bgOffset = 0;
        this._layoutButtons();
        this.audio.playBGM('ADVENTURE');
        this.particles.clear();
    }

    _layoutButtons() {
        const cx = CONFIG.CANVAS_WIDTH / 2;
        const startY = 500;
        const gap = 24;
        const bw = 380, bh = 102;
        const labels = [
            { key: 'BTN_START', scene: CONFIG.SCENES.CHARACTER_SELECT },
            { key: 'BTN_HELP', action: 'help' },
            { key: 'BTN_CREDITS', action: 'credits' },
            { key: 'BTN_END', action: 'end' }
        ];
        this._buttons = labels.map((b, i) => ({
            ...b,
            x: cx - bw/2,
            y: startY + i * (bh + gap),
            w: bw, h: bh,
            scale: 1
        }));
        this._settingsBtn = { x: CONFIG.CANVAS_WIDTH - 200, y: 35, w: 180, h: 55 };
    }

    update(dt) {
        this._time += dt;
        this._pulse += dt;
        this._bgOffset += dt * 30;
        this._particlesEmit += dt;

        if (this._particlesEmit > 0.15) {
            this._particlesEmit = 0;
            const colors = ['#4facfe', '#00f2fe', '#7c3aed', '#a855f7'];
            this.particles.emit(
                Math.random() * CONFIG.CANVAS_WIDTH,
                CONFIG.CANVAS_HEIGHT + 20,
                {
                    count: 1,
                    spreadX: 200,
                    spreadY: -50,
                    vyMin: -120, vyMax: -200,
                    vxMin: -40, vxMax: 40,
                    life: 4 + Math.random() * 3,
                    size: 2 + Math.random() * 4,
                    colors: colors,
                    shape: 'circle',
                    gravityY: -20
                }
            );
        }

        this.particles.update(dt);

        if (this._showHelp || this._showCredits || this._showEndConfirm) {
            if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
                this.audio.playSFX('BUTTON_CLICK');
                this._showHelp = false;
                this._showCredits = false;
                this._showEndConfirm = false;
                return;
            }
            if (this.input.mouseJustClicked) {
                const mx = this.input.mouseX, my = this.input.mouseY;
                const inDialog = this._isInBox(mx, my,
                    CONFIG.CANVAS_WIDTH/2 - 320,
                    CONFIG.CANVAS_HEIGHT/2 - 220,
                    640, 440);
                if (!inDialog) {
                    this.audio.playSFX('BUTTON_CLICK');
                    this._showHelp = false;
                    this._showCredits = false;
                    this._showEndConfirm = false;
                    return;
                }
                const closeBtn = { x: CONFIG.CANVAS_WIDTH/2 + 240, y: CONFIG.CANVAS_HEIGHT/2 - 220, w: 50, h: 50 };
                if (this._isInBox(mx, my, closeBtn.x, closeBtn.y, closeBtn.w, closeBtn.h)) {
                    this.audio.playSFX('BUTTON_CLICK');
                    this._showHelp = false;
                    this._showCredits = false;
                    this._showEndConfirm = false;
                    return;
                }
            }
            return;
        }

        const mx = this.input.mouseX, my = this.input.mouseY;
        const clicked = this.input.mouseJustClicked;
        this._hoverIdx = -1;
        for (let i = 0; i < this._buttons.length; i++) {
            const b = this._buttons[i];
            const over = this._isInBox(mx, my, b.x, b.y, b.w, b.h);
            if (over) {
                this._hoverIdx = i;
                b.scale = Math.min(b.scale + dt * 10, CONFIG.UI.BUTTON_HOVER_SCALE);
                if (clicked) {
                    this.audio.playSFX('BUTTON_CLICK');
                    if (b.scene) this.changeScene(b.scene);
                    else if (b.action === 'help') this._showHelp = true;
                    else if (b.action === 'credits') this._showCredits = true;
                    else if (b.action === 'end') this._showEndConfirm = true;
                }
            } else {
                b.scale = Math.max(b.scale - dt * 10, 1.0);
            }
        }
    }

    _isInBox(mx, my, x, y, w, h) {
        return mx >= x && mx <= x + w && my >= y && my <= y + h;
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;

        this._drawSeamlessBg(ctx, w, h, assets);

        this.particles.render(ctx);

        const logo = assets.getSprite('LOGO');
        if (logo && logo.image) {
            const lw = 660, lh = 240;
            const logoY = 80 + Math.sin(this._time * 2) * 6;
            ctx.save();
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 50;
            ctx.drawImage(logo.image, (w-lw)/2, logoY, lw, lh);
            ctx.restore();
        } else {
            ctx.fillStyle = '#4facfe';
            ctx.font = 'bold 78px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#4facfe'; ctx.shadowBlur = 35;
            ctx.fillText('卓越工程师大冒险', w/2, 220);
            ctx.shadowBlur = 0;
        }

        for (let i = 0; i < this._buttons.length; i++) {
            const b = this._buttons[i];
            const img = assets.getSprite(b.key);
            if (img && img.image) {
                const sw = b.w * b.scale;
                const sh = b.h * b.scale;
                const sx = b.x + (b.w - sw)/2;
                const sy = b.y + (b.h - sh)/2;
                if (this._hoverIdx === i) {
                    ctx.save();
                    ctx.shadowColor = '#4facfe';
                    ctx.shadowBlur = 30;
                }
                ctx.drawImage(img.image, sx, sy, sw, sh);
                if (this._hoverIdx === i) ctx.restore();
            } else {
                ctx.fillStyle = '#4facfe';
                ctx.fillRect(b.x, b.y, b.w, b.h);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 28px "Courier New"';
                ctx.textAlign = 'center';
                const labels = ['开始游戏', '操作说明', '制作人员', '结束游戏'];
                ctx.fillText(labels[i], b.x + b.w/2, b.y + b.h/2 + 10);
            }
        }

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '18px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('v1.0 Alpha Demo  |  卓越工程师培养计划', w/2, h - 35);

        if (this._showHelp) this._renderHelpDialog();
        if (this._showCredits) this._renderCreditsDialog();
        if (this._showEndConfirm) this._renderEndDialog();
    }

    _drawSeamlessBg(ctx, w, h, assets) {
        assets.drawBackground(ctx, 'BG_MAIN_MENU', this._time);

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(7,13,26,0.4)');
        gradient.addColorStop(0.5, 'rgba(10,25,50,0.3)');
        gradient.addColorStop(1, 'rgba(15,40,75,0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.globalAlpha = 0.05;
        const gridSize = 80;
        const offX = this._bgOffset * 0.3 % gridSize;
        const offY = this._bgOffset * 0.15 % gridSize;
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 1;
        for (let x = -gridSize + offX; x < w + gridSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = -gridSize + offY; y < h + gridSize; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        for (let i = 0; i < 5; i++) {
            const px = ((i * 300 + this._bgOffset * 0.8) % (w + 400)) - 200;
            const py = 100 + i * 120 + Math.sin(this._time + i) * 30;
            const size = 50 + i * 18;
            const alpha = 0.1 + Math.sin(this._time * 0.5 + i) * 0.05;
            ctx.globalAlpha = alpha;
            const g = ctx.createRadialGradient(px, py, 0, px, py, size);
            g.addColorStop(0, '#4facfe');
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    _renderPanel(bx, by, bw, bh) {
        const ctx = this.renderer.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 35;
        ctx.fillStyle = 'rgba(8, 18, 40, 0.96)';
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 18);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(79,172,254,0.3)';
        ctx.lineWidth = 1;
        for (let ly = by + 70; ly < by + bh - 25; ly += 32) {
            ctx.beginPath();
            ctx.moveTo(bx + 35, ly);
            ctx.lineTo(bx + bw - 35, ly);
            ctx.stroke();
        }

        const cx = bx + bw - 30;
        const cy = by + 30;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,80,80,0.85)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx + 8, cy + 8);
        ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx - 8, cy + 8);
        ctx.stroke();

        ctx.restore();
    }

    _renderHelpDialog() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const bw = 720, bh = 500;
        const bx = (w - bw) / 2, by = (h - bh) / 2;

        this._renderPanel(bx, by, bw, bh);

        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 38px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('📖 操作说明', w/2, by + 60);

        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'left';
        const helpLines = [
            { text: '▸ 移动控制', color: '#ffd700', y: by + 110 },
            { text: '  ← → / A D  →  左右移动', color: '#ffffff', y: by + 150 },
            { text: '  空格 / W / ↑  →  跳跃（支持二段跳）', color: '#ffffff', y: by + 190 },
            { text: '  ↓ / S  →  下蹲穿越低矮通道', color: '#ffffff', y: by + 230 },
            { text: '  ESC  →  返回主菜单', color: '#ffffff', y: by + 270 },
            { text: '', color: '#fff', y: by + 300 },
            { text: '▸ 关卡目标', color: '#ffd700', y: by + 330 },
            { text: '  【腾讯大堂】收集6个模块修复企鹅，回到企鹅旁完成', color: '#90ee90', y: by + 370 },
            { text: '  【小鹏充电桩】自动奔跑，躲避障碍坚持120秒', color: '#90ee90', y: by + 410 },
            { text: '', color: '#fff', y: by + 440 },
            { text: '💡 提示：病毒会追踪你，红色电缆碰到即死，注意躲避！', color: '#ff6b6b', y: by + 475 }
        ];

        for (const line of helpLines) {
            ctx.fillStyle = line.color;
            ctx.fillText(line.text, bx + 55, line.y);
        }
    }

    _renderCreditsDialog() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const bw = 640, bh = 440;
        const bx = (w - bw) / 2, by = (h - bh) / 2;

        this._renderPanel(bx, by, bw, bh);

        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 38px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('👥 制作人员', w/2, by + 55);

        ctx.font = '22px "Courier New"';
        ctx.textAlign = 'center';
        const credits = [
            { text: '卓越工程师大冒险', color: '#ffd700', y: by + 95, size: 26 },
            { text: '─────────────────────', color: '#4facfe', y: by + 130, size: 18 },
            { text: '制作人', color: '#aaaacc', y: by + 175, size: 20 },
            { text: '李钢宝乐德', color: '#ffffff', y: by + 210, size: 24 },
            { text: '美术', color: '#aaaacc', y: by + 255, size: 20 },
            { text: '许铭睿  吴安懒  王再亮', color: '#ffffff', y: by + 290, size: 22 },
            { text: '音乐', color: '#aaaacc', y: by + 335, size: 20 },
            { text: '叶昱翔', color: '#ffffff', y: by + 370, size: 24 }
        ];

        for (const line of credits) {
            ctx.fillStyle = line.color;
            ctx.font = `${line.size}px "Courier New"`;
            ctx.fillText(line.text, w/2, line.y);
        }
    }

    _renderEndDialog() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const bw = 580, bh = 340;
        const bx = (w - bw) / 2, by = (h - bh) / 2;

        this._renderPanel(bx, by, bw, bh);

        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 38px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('🚪 结束游戏', w/2, by + 65);

        ctx.fillStyle = '#ddd';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('确定要结束游戏吗？', w/2, by + 140);
        ctx.fillText('感谢你的游玩！', w/2, by + 185);

        const btnW = 180, btnH = 65;
        const btnY = by + bh - 100;

        const yesX = bx + 70;
        ctx.save();
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(255,80,80,0.9)';
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(yesX, btnY, btnW, btnH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 26px "Courier New"';
        ctx.fillText('确定退出', yesX + btnW/2, btnY + 42);
        ctx.restore();

        const noX = bx + bw - btnW - 70;
        ctx.save();
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(79,172,254,0.9)';
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(noX, btnY, btnW, btnH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillText('继续游玩', noX + btnW/2, btnY + 42);
        ctx.restore();

        const mx = this.input.mouseX, my = this.input.mouseY;
        if (this.input.mouseJustClicked) {
            if (this._isInBox(mx, my, yesX, btnY, btnW, btnH)) {
                try { window.close(); } catch(e) {}
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a1628;color:#4facfe;font-family:Courier New,sans-serif;font-size:32px;text-align:center;">感谢游玩！<br>你可以关闭此页面了。</div>';
            } else if (this._isInBox(mx, my, noX, btnY, btnW, btnH) ||
                       !this._isInBox(mx, my, bx, by, bw, bh)) {
                this.audio.playSFX('BUTTON_CLICK');
                this._showEndConfirm = false;
            }
        }
    }
}
