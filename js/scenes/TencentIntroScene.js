class TencentIntroScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.t = 0;
        this.gender = 'male';
        this.dialogueSystem = null;
    }
    enter(data) {
        this.t = 0;
        this.gender = data?.gender || 'male';
        this._initDialogue();
        this.audio.playBGM('TENCENT');
    }

    _initDialogue() {
        this.dialogueSystem = {
            active: true,
            currentLine: 0,
            lines: [
                { speaker: 'narrator', text: '深圳腾讯滨海大厦巍然矗立，玻璃幕墙映着深蓝灯光，科技感扑面而来。' },
                { speaker: 'narrator', text: '紧急警报！企鹅系统遭神秘病毒入侵，各事业群核心模块被感染分散！' },
                { speaker: 'narrator', text: '你需穿越微信、QQ、游戏、云、内容、技术六大区域，找回6个核心模块。' },
                { speaker: 'narrator', text: '作为卓越工程师，你肩负重任，定能修复系统拯救企鹅！' },
                { speaker: 'narrator', text: '准备好了吗？冒险即将开始，向着大厦内部进发！' }
            ],
            lineTimer: 0,
            lineDuration: 0.05,
            charIndex: 0,
            waitingForInput: false
        };
    }

    _advanceDialogue() {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        if (ds.waitingForInput) {
            ds.currentLine++;
            ds.charIndex = 0;
            ds.lineTimer = 0;
            ds.waitingForInput = false;
            if (ds.currentLine >= ds.lines.length) {
                ds.active = false;
                this.changeScene(CONFIG.SCENES.TENCENT_LOBBY, { gender: this.gender });
            }
        }
    }

    _skipDialogue() {
        if (!this.dialogueSystem) return;
        this.dialogueSystem.active = false;
        this.audio.playSFX('BUTTON_CLICK');
        this.changeScene(CONFIG.SCENES.TENCENT_LOBBY, { gender: this.gender });
    }

    _updateDialogue(dt) {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        const line = ds.lines[ds.currentLine];
        if (!line) return;

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this._skipDialogue();
            return;
        }

        if (!ds.waitingForInput) {
            ds.lineTimer += dt;
            if (ds.lineTimer >= ds.lineDuration) {
                ds.lineTimer = 0;
                ds.charIndex++;
                if (ds.charIndex >= line.text.length) {
                    ds.charIndex = line.text.length;
                    ds.waitingForInput = true;
                }
            }
        }

        if (ds.waitingForInput) {
            if (this.input.isJustPressed(CONFIG.KEYS.JUMP) || this.input.isJustPressed(CONFIG.KEYS.ENTER) ||
                this.input.isJustPressed(CONFIG.KEYS.SPACE) || this.input.mouseJustClicked ||
                this.input.isJustPressed(CONFIG.KEYS.W) || this.input.isJustPressed(CONFIG.KEYS.UP)) {
                this._advanceDialogue();
                this.audio.playSFX('BUTTON_CLICK');
            }
        }
    }

    _drawDialogue(ctx) {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        const line = ds.lines[ds.currentLine];
        if (!line) return;

        const w = CONFIG.CANVAS_WIDTH;
        const h = CONFIG.CANVAS_HEIGHT;

        const boxW = 900;
        const boxH = 180;
        const boxX = (w - boxW) / 2;
        const boxY = h - boxH - 60;

        ctx.save();
        
        ctx.fillStyle = 'rgba(10, 25, 50, 0.95)';
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();

        let speakerName = '';
        let speakerColor = '#4facfe';
        if (line.speaker === 'penguin') {
            speakerName = '🐧 企鹅QQ';
            speakerColor = '#4facfe';
        } else if (line.speaker === 'player') {
            speakerName = this.gender === 'male' ? '👨‍💻 男工程师' : '👩‍💻 女工程师';
            speakerColor = '#ffd700';
        } else {
            speakerName = '📖 旁白';
            speakerColor = '#aaaaaa';
        }

        ctx.fillStyle = speakerColor;
        ctx.font = 'bold 26px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(speakerName, boxX + 30, boxY + 45);

        ctx.strokeStyle = 'rgba(100,180,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + 30, boxY + 60);
        ctx.lineTo(boxX + boxW - 30, boxY + 60);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '26px "Courier New"';
        const displayText = line.text.substring(0, ds.charIndex);
        this._wrapText(ctx, displayText, boxX + 30, boxY + 100, boxW - 60, 36);

        if (ds.waitingForInput) {
            const blink = Math.sin(this.t * 4) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = '22px "Courier New"';
                ctx.textAlign = 'right';
                ctx.fillText('▼ 按空格继续 | ESC跳过', boxX + boxW - 30, boxY + boxH - 25);
            }
        }
        ctx.restore();
    }

    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';
        let curY = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, curY);
                line = words[n];
                curY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, curY);
    }

    update(dt) {
        this.t += dt;
        this._updateDialogue(dt);
        this.particles.update(dt);
        if (Math.random() < 0.5) {
            const px = Math.random() * CONFIG.CANVAS_WIDTH;
            this.particles.emit(px, -10, {
                count: 1, spreadX: 20, spreadY: 0, life: 2, size: 3,
                colors: ['#4facfe', '#00f2fe', '#88ddff'], gravity: 80, shape: 'circle'
            });
        }
    }
    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;
        assets.drawBackground(ctx, 'BG_TENCENT_LOBBY', this.t);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 38px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('── 第一关：腾讯滨海大厦 ──', w/2, 120);
        ctx.restore();

        ctx.save();
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 56px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('系统危机', w/2, 200);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#cce7ff';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('WASD/方向键移动  |  空格跳跃(可二段跳)  |  S键下蹲', w/2, 280);
        ctx.fillText('收集6个模块修复企鹅，小心病毒！', w/2, 320);
        ctx.restore();

        this._drawDialogue(ctx);
        this.particles.render(ctx);
    }
}
