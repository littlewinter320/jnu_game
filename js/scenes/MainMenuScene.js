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
        const startY = 480;
        const gap = 20;
        const bw = 320, bh = 86;
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
        this._settingsBtn = { x: CONFIG.CANVAS_WIDTH - 180, y: 30, w: 160, h: 47 };
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
        this._hoverIdx = -1;
        for (let i = 0; i < this._buttons.length; i++) {
            const b = this._buttons[i];
            const over = this._isInBox(mx, my, b.x, b.y, b.w, b.h);
            if (over) {
                this._hoverIdx = i;
                b.scale = Math.min(b.scale + dt * 5, CONFIG.UI.BUTTON_HOVER_SCALE);
                if (this.input.mouseJustClicked) {
                    this.audio.playSFX('BUTTON_CLICK');
                    if (b.scene) this.changeScene(b.scene);
                    else if (b.action === 'help') this._showHelp = true;
                    else if (b.action === 'credits') this._showCredits = true;
                    else if (b.action === 'end') this._showEndConfirm = true;
                }
            } else {
                b.scale = Math.max(b.scale - dt * 5, 1.0);
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
            const lw = 560, lh = 200;
            const logoY = 100 + Math.sin(this._time * 2) * 5;
            ctx.save();
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 40;
            ctx.drawImage(logo.image, (w-lw)/2, logoY, lw, lh);
            ctx.restore();
        } else {
            ctx.fillStyle = '#4facfe';
            ctx.font = 'bold 64px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#4facfe'; ctx.shadowBlur = 30;
            ctx.fillText('卓越工程师大冒险', w/2, 200);
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
                    ctx.shadowBlur = 25;
                }
                ctx.drawImage(img.image, sx, sy, sw, sh);
                if (this._hoverIdx === i) ctx.restore();
            } else {
                ctx.fillStyle = '#4facfe';
                ctx.fillRect(b.x, b.y, b.w, b.h);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px "Courier New"';
                ctx.textAlign = 'center';
                const labels = ['开始游戏', '操作说明', '制作人员', '结束游戏'];
                ctx.fillText(labels[i], b.x + b.w/2, b.y + b.h/2 + 8);
            }
        }

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '16px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('v1.0 Alpha Demo  |  卓越工程师培养计划', w/2, h - 30);

        if (this._showHelp) this._renderHelpDialog();
        if (this._showCredits) this._renderCreditsDialog();
        if (this._showEndConfirm) this._renderEndDialog();
    }

    _drawSeamlessBg(ctx, w, h, assets) {
        const bgEntry = assets.getSprite('BG_MAIN_MENU');

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#070d1a');
        gradient.addColorStop(0.3, '#0f1f3a');
        gradient.addColorStop(0.6, '#162d52');
        gradient.addColorStop(1, '#1a3a6c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.globalAlpha = 0.15;
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

        if (bgEntry && bgEntry.image && !bgEntry.placeholder) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            const bgW = bgEntry.naturalWidth;
            const bgH = bgEntry.naturalHeight;
            const scale = Math.max(w / bgW, h / bgH) * 1.2;
            const dw = bgW * scale;
            const dh = bgH * scale;
            const scrollX = -(this._bgOffset * 0.5) % dw;
            for (let x = scrollX - dw; x < w + dw; x += dw) {
                ctx.drawImage(bgEntry.image, x, (h - dh) / 2, dw, dh);
            }
            ctx.restore();
        }

        ctx.save();
        for (let i = 0; i < 5; i++) {
            const px = ((i * 300 + this._bgOffset * 0.8) % (w + 400)) - 200;
            const py = 100 + i * 120 + Math.sin(this._time + i) * 30;
            const size = 40 + i * 15;
            const alpha = 0.08 + Math.sin(this._time * 0.5 + i) * 0.04;
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
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(8, 18, 40, 0.96)';
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 16);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(79,172,254,0.3)';
        ctx.lineWidth = 1;
        for (let ly = by + 60; ly < by + bh - 20; ly += 28) {
            ctx.beginPath();
            ctx.moveTo(bx + 30, ly);
            ctx.lineTo(bx + bw - 30, ly);
            ctx.stroke();
        }

        const cx = bx + bw - 25;
        const cy = by + 25;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,80,80,0.8)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 7); ctx.lineTo(cx + 7, cy + 7);
        ctx.moveTo(cx + 7, cy - 7); ctx.lineTo(cx - 7, cy + 7);
        ctx.stroke();

        ctx.restore();
    }

    _renderHelpDialog() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const bw = 640, bh = 440;
        const bx = (w - bw) / 2, by = (h - bh) / 2;

        this._renderPanel(bx, by, bw, bh);

        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('📖 操作说明', w/2, by + 50);

        ctx.font = '20px "Courier New"';
        ctx.textAlign = 'left';
        const helpLines = [
            { text: '▸ 移动控制', color: '#ffd700', y: by + 90 },
            { text: '  ← → / A D  →  左右移动', color: '#ffffff', y: by + 120 },
            { text: '  空格 / W / ↑  →  跳跃（支持二段跳）', color: '#ffffff', y: by + 150 },
            { text: '  ↓ / S  →  下蹲穿越低矮通道', color: '#ffffff', y: by + 180 },
            { text: '  ESC  →  返回主菜单', color: '#ffffff', y: by + 210 },
            { text: '', color: '#fff', y: by + 240 },
            { text: '▸ 关卡目标', color: '#ffd700', y: by + 270 },
            { text: '  【腾讯大堂】收集6个模块修复企鹅，回到企鹅旁完成', color: '#90ee90', y: by + 300 },
            { text: '  【小鹏充电桩】自动奔跑，躲避障碍坚持120秒', color: '#90ee90', y: by + 330 },
            { text: '', color: '#fff', y: by + 360 },
            { text: '💡 提示：病毒会追踪你，红色电缆碰到即死，注意躲避！', color: '#ff6b6b', y: by + 390 }
        ];

        for (const line of helpLines) {
            ctx.fillStyle = line.color;
            ctx.fillText(line.text, bx + 50, line.y);
        }
    }

    _renderCreditsDialog() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const bw = 640, bh = 440;
        const bx = (w - bw) / 2, by = (h - bh) / 2;

        this._renderPanel(bx, by, bw, bh);

        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('👥 制作人员', w/2, by + 50);

        ctx.font = '20px "Courier New"';
        ctx.textAlign = 'center';
        const credits = [
            { text: '卓越工程师大冒险', color: '#ffd700', y: by + 95, size: 26 },
            { text: '─────────────────────', color: '#4facfe', y: by + 130, size: 18 },
            { text: '游戏策划 & 设计', color: '#aaaacc', y: by + 165, size: 18 },
            { text: '卓越工程师培养计划', color: '#ffffff', y: by + 195, size: 22 },
            { text: '', color: '#fff', y: by + 220, size: 18 },
            { text: '美术 & 程序', color: '#aaaacc', y: by + 250, size: 18 },
            { text: 'AI Assisted Development', color: '#ffffff', y: by + 280, size: 22 },
            { text: '', color: '#fff', y: by + 310, size: 18 },
            { text: '特别感谢', color: '#aaaacc', y: by + 340, size: 18 },
            { text: '腾讯 & 小鹏汽车提供灵感与场景', color: '#90ee90', y: by + 370, size: 20 },
            { text: '', color: '#fff', y: by + 395, size: 18 },
            { text: '© 2024 卓越工程师大冒险', color: '#666', y: by + 420, size: 16 }
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
        const bw = 520, bh = 300;
        const bx = (w - bw) / 2, by = (h - bh) / 2;

        this._renderPanel(bx, by, bw, bh);

        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('🚪 结束游戏', w/2, by + 55);

        ctx.fillStyle = '#ddd';
        ctx.font = '20px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('确定要结束游戏吗？', w/2, by + 120);
        ctx.fillText('感谢你的游玩！', w/2, by + 155);

        const btnW = 160, btnH = 55;
        const btnY = by + bh - 90;

        const yesX = bx + 60;
        ctx.save();
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(255,80,80,0.9)';
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(yesX, btnY, btnW, btnH, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px "Courier New"';
        ctx.fillText('确定退出', yesX + btnW/2, btnY + 36);
        ctx.restore();

        const noX = bx + bw - btnW - 60;
        ctx.save();
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(79,172,254,0.9)';
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(noX, btnY, btnW, btnH, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillText('继续游玩', noX + btnW/2, btnY + 36);
        ctx.restore();

        const mx = this.input.mouseX, my = this.input.mouseY;
        if (this.input.mouseJustClicked) {
            if (this._isInBox(mx, my, yesX, btnY, btnW, btnH)) {
                window.close();
                try { window.close(); } catch(e) {}
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a1628;color:#4facfe;font-family:Courier New,sans-serif;font-size:28px;text-align:center;">感谢游玩！<br>你可以关闭此页面了。</div>';
            } else if (this._isInBox(mx, my, noX, btnY, btnW, btnH) ||
                       !this._isInBox(mx, my, bx, by, bw, bh)) {
                this.audio.playSFX('BUTTON_CLICK');
                this._showEndConfirm = false;
            }
        }
    }
}
