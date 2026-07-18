class MainMenuScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.changeScene = changeScene;
        this.time = 0;
        this.bgTime = 0;
        this.selectedIndex = 0;
        this.buttons = [];
        this.pressed = false;
    }

    enter() {
        this.time = 0;
        this.bgTime = 0;
        this.selectedIndex = 0;
        this.pressed = false;
        this._layoutButtons();
    }

    _layoutButtons() {
        const cx = CONFIG.CANVAS_WIDTH / 2;
        const startY = 440;
        const gap = 110;
        const btnW = 440;
        this.buttons = [
            { key: 'BTN_START', label: '开始游戏', action: () => this.changeScene(CONFIG.SCENES.CHARACTER_SELECT) },
            { key: 'BTN_HELP', label: '操作说明', action: () => {} },
            { key: 'BTN_CREDITS', label: '制作人员', action: () => {} },
            { key: 'BTN_END', label: '结束游戏', action: () => {} }
        ];
        this.buttons.forEach((b, i) => {
            b.x = cx - btnW / 2;
            b.y = startY + i * gap;
            b.w = btnW;
            b.h = 120;
            b.hovered = false;
        });
        this.settingsBtn = { key: 'BTN_SETTINGS', x: CONFIG.CANVAS_WIDTH - 220, y: 25, w: 170, h: 50, hovered: false };
    }

    update(dt) {
        this.time += dt;
        this.bgTime += dt;

        const assets = window.Game?.assets;
        const img = assets?.images?.ui?.BTN_START;
        if (img) {
            const baseW = img.targetWidth || 400;
            const baseH = img.targetHeight || 107;
            const scale = 440 / baseW;
            this.buttons.forEach(b => {
                b.w = baseW * scale;
                b.h = baseH * scale;
                b.x = CONFIG.CANVAS_WIDTH / 2 - b.w / 2;
            });
            this.settingsBtn.w = 170;
            this.settingsBtn.h = 170 * (59/200);
        }

        if (this.input.mouseX !== undefined) {
            this.buttons.forEach(b => {
                const wasHovered = b.hovered;
                b.hovered = this._pointInRect(this.input.mouseX, this.input.mouseY, b);
                if (b.hovered && !wasHovered) {
                    this.audio.playSFX('BUTTON_HOVER');
                }
            });
            const sb = this.settingsBtn;
            const wasHov = sb.hovered;
            sb.hovered = this._pointInRect(this.input.mouseX, this.input.mouseY, sb);
            if (sb.hovered && !wasHov) this.audio.playSFX('BUTTON_HOVER');
        }

        if (this.input.isJustPressed(CONFIG.KEYS.UP) || this.input.isJustPressed(CONFIG.KEYS.W)) {
            this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
            this.audio.playSFX('BUTTON_HOVER');
        }
        if (this.input.isJustPressed(CONFIG.KEYS.DOWN) || this.input.isJustPressed(CONFIG.KEYS.S)) {
            this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
            this.audio.playSFX('BUTTON_HOVER');
        }

        const confirmPressed = this.input.isJustPressed(CONFIG.KEYS.ENTER) || this.input.isJustPressed(CONFIG.KEYS.SPACE);
        const clickPressed = this.input.mouseJustClicked;

        if (!this.pressed) {
            if (confirmPressed) {
                this.pressed = true;
                this.audio.playSFX('BUTTON_CLICK');
                this.buttons[this.selectedIndex].action();
            } else if (clickPressed) {
                for (const b of this.buttons) {
                    if (b.hovered) {
                        this.pressed = true;
                        this.audio.playSFX('BUTTON_CLICK');
                        b.action();
                        break;
                    }
                }
                if (this.settingsBtn.hovered) {
                    this.pressed = true;
                    this.audio.playSFX('BUTTON_CLICK');
                }
            }
        }

        if (clickPressed || confirmPressed) {
            this.pressed = false;
        }
    }

    _pointInRect(px, py, r) {
        return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }

    render() {
        const ctx = this.renderer.ctx;
        const assets = window.Game?.assets;
        const CW = CONFIG.CANVAS_WIDTH;
        const CH = CONFIG.CANVAS_HEIGHT;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CW, CH);

        if (assets) {
            assets.drawBackground(ctx, 'BG_MAIN_MENU', this.bgTime);
        }

        ctx.fillStyle = 'rgba(10, 22, 40, 0.35)';
        ctx.fillRect(0, 0, CW, CH);

        const logoEntry = assets?.images?.ui?.LOGO;
        const logoW = logoEntry?.targetWidth || 800;
        const logoH = logoEntry?.targetHeight || 384;
        const logoScale = 1 + Math.sin(this.time * 2) * 0.02;
        const drawLogoW = logoW * logoScale;
        const drawLogoH = logoH * logoScale;
        const logoX = (CW - drawLogoW) / 2;
        const logoY = 80;

        ctx.save();
        ctx.shadowColor = 'rgba(79,172,254,0.5)';
        ctx.shadowBlur = 20;
        if (assets && logoEntry?.image) {
            assets.drawUI(ctx, 'LOGO', logoX, logoY, drawLogoW, drawLogoH);
        } else {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 64px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('卓越工程师的大冒险', CW / 2, logoY + drawLogoH / 2);
        }
        ctx.restore();

        this.buttons.forEach((b, i) => {
            const isSelected = i === this.selectedIndex;
            const isHovered = b.hovered || isSelected;
            const imgEntry = assets?.images?.ui?.[b.key];

            const pulse = isHovered ? 1 + Math.sin(this.time * 4) * 0.03 : 1;
            const bw = b.w * pulse;
            const bh = b.h * pulse;
            const bx = CW / 2 - bw / 2;
            const by = b.y - (bh - b.h) / 2;

            if (isHovered) {
                ctx.save();
                ctx.shadowColor = '#4af';
                ctx.shadowBlur = 25;
            }
            if (assets && imgEntry?.image) {
                const finalW = bw;
                const finalH = bh;
                ctx.drawImage(imgEntry.image, Math.round(bx), Math.round(by), Math.round(finalW), Math.round(finalH));
            } else {
                ctx.fillStyle = isHovered ? 'rgba(79,172,254,0.9)' : 'rgba(79,172,254,0.6)';
                ctx.fillRect(bx, by, bw, bh);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 36px "Courier New"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(b.label, bx + bw / 2, by + bh / 2);
            }
            if (isHovered) {
                ctx.restore();
            }
        });

        const sb = this.settingsBtn;
        const sImg = assets?.images?.ui?.BTN_SETTINGS;
        const spulse = sb.hovered ? 1.08 : 1;
        const sw = sb.w * spulse;
        const sh = sb.h * spulse;
        const sx = sb.x - (sw - sb.w) / 2;
        const sy = sb.y - (sh - sb.h) / 2;
        if (assets && sImg?.image) {
            ctx.save();
            if (sb.hovered) {
                ctx.shadowColor = '#4af';
                ctx.shadowBlur = 15;
            }
            ctx.drawImage(sImg.image, Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh));
            ctx.restore();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        const hintY = CONFIG.CANVAS_HEIGHT - 30;
        const blink = Math.sin(this.time * 3) > 0;
        if (blink) {
            ctx.fillText('↑↓ 选择  |  空格/回车 确认  |  点击按钮', CONFIG.CANVAS_WIDTH / 2, hintY);
        }

        this.particles.render(ctx);
    }
}
