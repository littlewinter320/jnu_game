class XPengIntroScene {
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
        this.audio.playBGM('XPENG');
    }

    _initDialogue() {
        this.dialogueSystem = {
            active: true,
            currentLine: 0,
            lines: [
                { speaker: 'narrator', text: '修复完腾讯系统后，你马不停蹄赶到了小鹏智能智造工厂...' },
                { speaker: 'narrator', text: '这里的自动化产线突发故障，充电桩全部过载！' },
                { speaker: 'player', text: '情况看起来很糟糕，障碍物到处都是！' },
                { speaker: 'system', text: '⚠ 紧急救援程序已启动。请在产线上坚持2分钟。' },
                { speaker: 'system', text: '救援车辆将在最后10秒预告目标车道——' },
                { speaker: 'system', text: '切换到正确车道并碰到车辆，即可成功逃离！' },
                { speaker: 'player', text: '明白了！我会收集电池维持体力，躲避所有障碍！' },
                { speaker: 'narrator', text: '产线开始运转，你踏上了自动传送带...' },
                { speaker: 'system', text: '准备出发！祝你好运，卓越工程师！' }
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
                this.changeScene(CONFIG.SCENES.XPENG_RUN, { gender: this.gender });
            }
        }
    }

    _skipDialogue() {
        if (!this.dialogueSystem) return;
        this.dialogueSystem.active = false;
        this.audio.playSFX('BUTTON_CLICK');
        this.changeScene(CONFIG.SCENES.XPENG_RUN, { gender: this.gender });
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

        const boxW = 950;
        const boxH = 200;
        const boxX = (w - boxW) / 2;
        const boxY = h - boxH - 60;

        ctx.save();
        
        ctx.fillStyle = 'rgba(20, 15, 35, 0.95)';
        ctx.strokeStyle = '#ff8c00';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff8c00';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        let speakerName = '';
        let speakerColor = '#ff8c00';
        if (line.speaker === 'system') {
            speakerName = '🤖 车载系统';
            speakerColor = '#ff4444';
        } else if (line.speaker === 'player') {
            speakerName = this.gender === 'male' ? '👨‍💻 男工程师' : '👩‍💻 女工程师';
            speakerColor = '#ffd700';
        } else {
            speakerName = '📖 旁白';
            speakerColor = '#ffaa66';
        }

        ctx.fillStyle = speakerColor;
        ctx.font = 'bold 28px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(speakerName, boxX + 35, boxY + 50);

        ctx.strokeStyle = 'rgba(255,140,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + 35, boxY + 68);
        ctx.lineTo(boxX + boxW - 35, boxY + 68);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '26px "Courier New"';
        const displayText = line.text.substring(0, ds.charIndex);
        this._wrapText(ctx, displayText, boxX + 35, boxY + 110, boxW - 70, 38);

        if (ds.waitingForInput) {
            const blink = Math.sin(this.t * 4) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = '22px "Courier New"';
                ctx.textAlign = 'right';
                ctx.fillText('▼ 按空格继续 | ESC跳过', boxX + boxW - 35, boxY + boxH - 28);
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
        if (Math.random() < 0.6) {
            const py = Math.random() * CONFIG.CANVAS_HEIGHT;
            this.particles.emit(CONFIG.CANVAS_WIDTH + 20, py, {
                count: 1, spreadX: 0, spreadY: 15, life: 0.7, size: 4,
                colors: ['#ff8c00', '#ffa500', '#ffcc00', '#fff', '#ff6600'], gravity: 0, shape: 'rect'
            });
        }
    }

    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;
        assets.drawBackground(ctx, 'BG_XPENG_STAGE1', this.t);
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#ff8c00';
        ctx.shadowBlur = 50;
        ctx.fillStyle = '#ff8c00';
        ctx.font = 'bold 40px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('── 第二关：小鹏智造工厂 ──', w/2, 130);
        ctx.restore();

        ctx.save();
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 60px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('紧急逃离', w/2, 220);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#ffddb0';
        ctx.font = '25px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('空格/↑跳跃  |  S/↓下蹲  |  ←→/AD切换车道', w/2, 310);
        ctx.fillText('收集电池补充体力，躲避障碍物，坚持到救援车辆到达！', w/2, 350);
        ctx.fillText('⚠ 最后10秒会预警目标车道，必须在正确车道碰车才能胜利！', w/2, 390);
        ctx.restore();

        this._drawDialogue(ctx);
        this.particles.render(ctx);
    }
}
