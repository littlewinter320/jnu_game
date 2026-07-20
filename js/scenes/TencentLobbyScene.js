class TencentLobbyScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.assets = window.Game.assets;

        this._time = 0;
        this.gender = 'male';
        this.player = null;
        this.platforms = [];
        this.decorations = [];
        this.deadlyHazards = [];
        this.props = [];
        this.viruses = [];
        this.collectedProps = [];
        this.hud = null;
        this.cameraX = 0;
        this.currentAreaIdx = 0;
        this.currentAreaName = '';
        this.gameOver = false;
        this.victory = false;
        this.endTimer = 0;
        this.exitUnlocked = false;
        this.showExitMessage = false;
        this.exitMessageTimer = 0;
        this._bgBlend = 0;
        this._groundSegments = [];
        this._lastVirusWarn = 0;

        this.penguin = null;
        this.penguinFixed = false;
        this.dialogueSystem = null;
        this.storyPhase = 'intro';
        this.storyDone = false;
    }

    enter(data) {
        this._time = 0;
        this.gender = data?.gender || 'male';
        this.cameraX = 0;
        this.collectedProps = [];
        this.gameOver = false;
        this.victory = false;
        this.endTimer = 0;
        this.exitUnlocked = false;
        this.showExitMessage = false;
        this.exitMessageTimer = 0;
        this.currentAreaIdx = 0;
        this._bgBlend = 0;
        this.penguinFixed = false;
        this.storyPhase = 'intro';
        this.storyDone = false;
        this.particles.clear();

        const px = CONFIG.TENCENT.PLAYER_START_X;
        const py = CONFIG.TENCENT.PLAYER_START_Y;
        this.player = new Player(px, py, this.gender);
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = false;
        this.player.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.player.invincibleTimer = 0;
        this.player.state = 'idle';
        this.player.facingRight = true;

        this.penguin = {
            x: 80,
            y: CONFIG.TENCENT.GROUND_Y - 230,
            w: 160,
            h: 200
        };

        this._buildLevel();
        this._initDialogue();
        this.hud = new HUD();
        this.currentAreaName = CONFIG.TENCENT.AREA_NAMES[0];
        this.audio.playBGM('TENCENT');
    }

    _initDialogue() {
        this.dialogueSystem = {
            active: true,
            currentLine: 0,
            lines: [
                { speaker: 'penguin', text: '哔...哔...系统故障...需要帮助...' },
                { speaker: 'player', text: '企鹅先生！你怎么了？' },
                { speaker: 'penguin', text: '我的6个核心模块散落在大楼各处...' },
                { speaker: 'penguin', text: '微信、QQ、游戏、云、内容、技术...' },
                { speaker: 'penguin', text: '请帮我找回它们，修复我的系统！' },
                { speaker: 'player', text: '包在我身上！我这就去找回所有模块！' }
            ],
            lineTimer: 0,
            lineDuration: 0.05,
            charIndex: 0,
            waitingForInput: false,
            justCompleted: false
        };
    }

    _buildLevel() {
        this.platforms = [];
        this.decorations = [];
        this.deadlyHazards = [];
        this.props = [];
        this.viruses = [];
        this._groundSegments = [];

        const ts = CONFIG.TILES.TILE_SIZE;
        const gy = CONFIG.TENCENT.GROUND_Y;
        const ll = CONFIG.TENCENT.LEVEL_LENGTH;

        const gaps = CONFIG.TENCENT.GROUND_GAPS;
        let segStart = 0;
        for (const gap of gaps) {
            this._groundSegments.push({ x: segStart, w: gap.x - segStart });
            segStart = gap.x + gap.w;
        }
        this._groundSegments.push({ x: segStart, w: ll - segStart });

        for (const seg of this._groundSegments) {
            this.platforms.push({
                x: seg.x, y: gy, w: seg.w, h: CONFIG.TENCENT.GROUND_H,
                isGround: true, isSolid: true
            });
        }

        const platLayout = CONFIG.TENCENT.PLATFORM_LAYOUT;
        const platH = 50;
        const platTypes = ['platform', 'metal', 'tech', 'thin', 'semisolid'];
        for (let i = 0; i < platLayout.length; i++) {
            const pl = platLayout[i];
            const pw = pl.w * ts;
            const ptype = platTypes[i % platTypes.length];
            this.platforms.push({
                x: pl.x, y: pl.y, w: pw, h: platH,
                isGround: false, isSolid: true,
                type: pl.type || ptype
            });
        }

        const specialPlatforms = [
            { x: 600, y: 850, w: 3, type: 'metal' },
            { x: 1700, y: 720, w: 2, type: 'tech' },
            { x: 4000, y: 480, w: 3, type: 'thin' },
            { x: 6800, y: 480, w: 2, type: 'semisolid' },
            { x: 8500, y: 750, w: 4, type: 'metal' },
            { x: 11000, y: 500, w: 3, type: 'tech' },
            { x: 13000, y: 750, w: 4, type: 'platform' }
        ];
        for (const sp of specialPlatforms) {
            this.platforms.push({
                x: sp.x, y: sp.y, w: sp.w * ts, h: platH,
                isGround: false, isSolid: true, type: sp.type
            });
        }

        const limitedDecTypes = [
            { key: 'OBS_CONES', w: 50, h: 60, yOff: -60 },
            { key: 'OBS_WARNING_LIGHT', w: 45, h: 70, yOff: -70 },
            { key: 'OBS_MACHINERY', w: 100, h: 110, yOff: -110 },
            { key: 'OBS_HIGH_PIPES', w: 80, h: 140, yOff: -140 },
            { key: 'OBS_LOW_SERVERS', w: 100, h: 45, yOff: -45 }
        ];

        const decPositions = [
            { x: 700, onPlat: false },
            { x: 2500, onPlat: false },
            { x: 4800, onPlat: true },
            { x: 7200, onPlat: false },
            { x: 9800, onPlat: true }
        ];

        for (let i = 0; i < decPositions.length; i++) {
            const dp = decPositions[i];
            const dec = limitedDecTypes[i % limitedDecTypes.length];
            let dy;
            if (dp.onPlat) {
                const nearPlats = this.platforms.filter(p => !p.isGround && Math.abs(p.x + p.w/2 - dp.x) < 200);
                if (nearPlats.length > 0) {
                    const pl = nearPlats[0];
                    dy = pl.y + dec.yOff;
                } else {
                    dy = gy + dec.yOff;
                }
            } else {
                dy = gy + dec.yOff;
            }
            this.decorations.push({
                x: dp.x, y: dy, w: dec.w, h: dec.h, spriteKey: dec.key
            });
        }

        this.bgDecorations = [];
        const bgDecoTypes = ['building_s', 'building_m', 'building_t', 'tower'];
        for (let bx = 500; bx < ll - 500; bx += 800 + Math.random() * 400) {
            const type = bgDecoTypes[Math.floor(Math.random() * bgDecoTypes.length)];
            const sizes = { building_s: 200, building_m: 250, building_t: 220, tower: 180 };
            const heights = { building_s: 300, building_m: 350, building_t: 380, tower: 400 };
            this.bgDecorations.push({
                x: bx,
                y: gy - heights[type],
                w: sizes[type],
                h: heights[type],
                type: type,
                alpha: 0.15 + Math.random() * 0.1
            });
        }

        const hazardTypes = [
            { key: 'OBS_CABLE_RED', w: 60, h: 120, yOff: -120 },
            { key: 'OBS_LASER_SPHERE', w: 70, h: 80, yOff: -80 },
            { key: 'OBS_CHARGER_DAMAGED', w: 80, h: 140, yOff: -140 }
        ];

        const hazardPositions = [
            { x: 2200, onPlat: false },
            { x: 3500, onPlat: true },
            { x: 5200, onPlat: false },
            { x: 7000, onPlat: true },
            { x: 8800, onPlat: false },
            { x: 10500, onPlat: true },
            { x: 12500, onPlat: false }
        ];

        for (const hp of hazardPositions) {
            const hz = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
            let hy;
            if (hp.onPlat) {
                const nearPlats = this.platforms.filter(p => !p.isGround && Math.abs(p.x + p.w/2 - hp.x) < 200);
                if (nearPlats.length > 0) {
                    const pl = nearPlats[0];
                    hy = pl.y + hz.yOff;
                } else {
                    hy = gy + hz.yOff;
                }
            } else {
                hy = gy + hz.yOff;
            }
            this.deadlyHazards.push({
                x: hp.x, y: hy, w: hz.w, h: hz.h, spriteKey: hz.key
            });
        }

        CONFIG.TENCENT.PROP_TARGETS.forEach((pt) => {
            this.props.push({
                x: pt.x, y: gy - 220 - Math.random() * 100,
                w: 58, h: 58, spriteKey: pt.key, area: pt.area,
                collected: false, floatPhase: Math.random() * Math.PI * 2
            });
        });

        const virusPositions = [
            { x: 1800, y: gy - 80 },
            { x: 3200, y: gy - 80 },
            { x: 5000, y: gy - 80 },
            { x: 6800, y: gy - 80 },
            { x: 8600, y: gy - 80 },
            { x: 10400, y: gy - 80 },
            { x: 12000, y: gy - 80 }
        ];
        for (const vp of virusPositions) {
            this.viruses.push(new Virus(vp.x, vp.y));
        }
    }

    _killPlayer(reason = 'hazard') {
        if (this.gameOver || this.victory) return;
        this.gameOver = true;
        this.audio.playSFX('DIE');
        this.player.die();
        this.particles.emitExplosion(this.player.x + this.player.w/2, this.player.y + this.player.h/2);
        this.renderer.shake(15, 0.4);
    }

    _advanceDialogue() {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        if (ds.waitingForInput) {
            ds.currentLine++;
            ds.charIndex = 0;
            ds.lineTimer = 0;
            ds.waitingForInput = false;
            ds.justCompleted = false;
            if (ds.currentLine >= ds.lines.length) {
                ds.active = false;
                this.storyPhase = 'playing';
                this.storyDone = true;
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

        let boxX, boxY, speakerName;
        const boxW = 560;
        const boxH = 120;

        const playerScreenX = this.player.x - this.cameraX;
        const penguinScreenX = this.penguin.x - this.cameraX;

        if (line.speaker === 'penguin') {
            boxX = penguinScreenX - boxW / 2 + this.penguin.w / 2;
            boxY = this.penguin.y - boxH - 30;
            speakerName = '企鹅';
        } else {
            boxX = playerScreenX - boxW / 2 + this.player.w / 2;
            boxY = this.player.y - boxH - 30;
            speakerName = this.gender === 'male' ? '男工程师' : '女工程师';
        }

        boxX = Math.max(40, Math.min(w - boxW - 40, boxX));
        boxY = Math.max(40, boxY);

        ctx.save();
        ctx.fillStyle = 'rgba(10, 20, 40, 0.92)';
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#4facfe';
        ctx.beginPath();
        if (line.speaker === 'penguin') {
            ctx.moveTo(penguinScreenX + this.penguin.w/2, this.penguin.y - 5);
            ctx.lineTo(penguinScreenX + this.penguin.w/2 - 15, boxY + boxH);
            ctx.lineTo(penguinScreenX + this.penguin.w/2 + 15, boxY + boxH);
        } else {
            ctx.moveTo(playerScreenX + this.player.w/2, this.player.y - 5);
            ctx.lineTo(playerScreenX + this.player.w/2 - 15, boxY + boxH);
            ctx.lineTo(playerScreenX + this.player.w/2 + 15, boxY + boxH);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 20px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(speakerName, boxX + 20, boxY + 32);

        ctx.fillStyle = '#ffffff';
        ctx.font = '22px "Courier New"';
        const displayText = line.text.substring(0, ds.charIndex);
        this._wrapText(ctx, displayText, boxX + 20, boxY + 60, boxW - 40, 30);

        if (ds.waitingForInput) {
            const blink = Math.sin(this._time * 4) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = '18px "Courier New"';
                ctx.textAlign = 'right';
                ctx.fillText('▼ 按空格继续', boxX + boxW - 20, boxY + boxH - 15);
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

    _updateDialogue(dt) {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        const line = ds.lines[ds.currentLine];
        if (!line) return;

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
                this.input.isJustPressed(CONFIG.KEYS.W) || this.input.isJustPressed(CONFIG.KEYS.UP)) {
                this._advanceDialogue();
                this.audio.playSFX('BUTTON_CLICK');
            }
        }
    }

    _checkPenguinProximity() {
        if (!this.storyDone) return;
        const p = this.player;
        const pg = this.penguin;

        const dx = (p.x + p.w/2) - (pg.x + pg.w/2);
        const dy = (p.y + p.h/2) - (pg.y + pg.h/2);
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 180 && this.collectedProps.length < 6 && !this.dialogueSystem?.active) {
            if (!this._hintTimer || this._hintTimer <= 0) {
                this._hintMsg = `还需要收集 ${6 - this.collectedProps.length} 个模块才能修复企鹅！`;
                this._hintTimer = 2.5;
            }
        }
    }

    update(dt) {
        this._time += dt;
        if (this._hintTimer > 0) this._hintTimer -= dt;

        this._updateDialogue(dt);

        if (this.gameOver || this.victory) {
            this.endTimer += dt;
            this.particles.update(dt);
            if (this.endTimer > 2.5) {
                if (this.victory) {
                    this.changeScene(CONFIG.SCENES.WIN, {
                        gender: this.gender, level: 'tencent',
                        collected: this.collectedProps.length,
                        totalProps: 6, time: this._time
                    });
                } else {
                    this.changeScene(CONFIG.SCENES.GAME_OVER, {
                        gender: this.gender, level: 'tencent', reason: 'death'
                    });
                }
            }
            return;
        }

        if (this.dialogueSystem?.active) {
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.updateAnimation(dt);
            this.particles.update(dt);
            return;
        }

        const p = this.player;
        const assets = this.assets;

        let moveX = 0;
        if (this.input.isDown(CONFIG.KEYS.LEFT) || this.input.isDown(CONFIG.KEYS.A)) {
            moveX = -1;
            p.facingRight = false;
        }
        if (this.input.isDown(CONFIG.KEYS.RIGHT) || this.input.isDown(CONFIG.KEYS.D)) {
            moveX = 1;
            p.facingRight = true;
        }

        const speed = (p.crouching ? CONFIG.PLAYER.CROUCH_SPEED : CONFIG.PLAYER.MOVE_SPEED);
        p.vx = moveX * speed;

        if (this.input.isJustPressed(CONFIG.KEYS.JUMP) || this.input.isJustPressed(CONFIG.KEYS.W) || this.input.isJustPressed(CONFIG.KEYS.UP)) {
            const j = p.jump();
            if (j === 'jump') {
                this.audio.playSFX('JUMP');
                this.particles.emitDust(p.x + p.w/2, p.y + p.h);
            } else if (j === 'doubleJump') {
                this.audio.playSFX('DOUBLE_JUMP');
                this.particles.emit(p.x + p.w/2, p.y + p.h, { count: 12, spreadX: 120, spreadY: 100, life: 0.4, size: 3, colors: ['#88ddff', '#4facfe'], shape: 'circle' });
            }
        }

        let wantCrouch = this.input.isDown(CONFIG.KEYS.S) || this.input.isDown(CONFIG.KEYS.DOWN);
        if (wantCrouch && !p.crouching && p.onGround) {
            p.crouch(true);
        } else if (!wantCrouch && p.crouching) {
            let canStand = true;
            const standH = this.player._charInfo?.h || CONFIG.PLAYER.HEIGHT;
            for (const plat of this.platforms) {
                if (plat.isGround) continue;
                if (p.x + p.w > plat.x && p.x < plat.x + plat.w) {
                    if (p.y - (standH - p.h) < plat.y + plat.h && p.y > plat.y) {
                        canStand = false; break;
                    }
                }
            }
            if (canStand) p.crouch(false);
        }

        p.applyGravity(dt);

        const wasOnGround = p.onGround;
        p.onGround = false;

        p.update(dt);

        for (const plat of this.platforms) {
            if (CollisionSystem.platformCollision(p, plat)) {
                p.y = plat.y - p.h;
                p.vy = 0;
                if (!wasOnGround && !p.onGround) {
                    this.audio.playSFX('LAND');
                    this.particles.emitDust(p.x + p.w/2, p.y + p.h);
                }
                p.onGround = true;
                p.canDoubleJump = true;
                if (p.crouching && !wantCrouch) {
                    p.crouch(false);
                }
            }
        }

        if (p.x < 0) p.x = 0;
        if (p.x > CONFIG.TENCENT.LEVEL_LENGTH - p.w) p.x = CONFIG.TENCENT.LEVEL_LENGTH - p.w;

        if (p.y > CONFIG.TENCENT.DEATH_Y) {
            this._killPlayer('fall');
            this.particles.update(dt);
            return;
        }

        const playerHb = { x: p.x + 10, y: p.y + 5, w: p.w - 20, h: p.h - 10 };

        for (const hz of this.deadlyHazards) {
            if (CollisionSystem.aabb(playerHb, hz)) {
                this._killPlayer('hazard');
                this.particles.update(dt);
                return;
            }
        }

        for (const virus of this.viruses) {
            virus.update(dt, p, this.platforms);
            const virusHb = virus.getHitbox();
            if (virus.agitated && this._time - this._lastVirusWarn > 3) {
                this._lastVirusWarn = this._time;
                this.audio.playSFX('VIRUS_ALERT');
            }
            if (CollisionSystem.aabb(playerHb, virusHb)) {
                this._killPlayer('virus');
                this.particles.update(dt);
                return;
            }
        }

        for (const prop of this.props) {
            if (prop.collected) continue;
            if (CollisionSystem.aabb(p, { x: prop.x, y: prop.y, w: prop.w, h: prop.h })) {
                prop.collected = true;
                this.collectedProps.push(prop.spriteKey);
                this.hud.addProp(prop.area);
                this.audio.playSFX('COLLECT');
                this.particles.emitCollect(prop.x + prop.w/2, prop.y + prop.h/2);
            }
        }

        if (this.collectedProps.length >= 6 && !this.penguinFixed) {
            this.penguinFixed = true;
            this._hintMsg = '企鹅修复了！快回到企鹅旁边完成任务！';
            this._hintTimer = 4;
            this.audio.playSFX('VICTORY');
        }

        this._checkPenguinProximity();

        if (p.onGround) {
            p.stamina = Math.min(CONFIG.PLAYER.MAX_STAMINA, p.stamina + CONFIG.PLAYER.STAMINA_RECOVER_RATE * dt);
        }

        this.exitUnlocked = this.collectedProps.length >= 6;
        const exitX = this.penguin.x;
        const exitY = this.penguin.y;
        const exitHb = {
            x: exitX - 40,
            y: exitY,
            w: this.penguin.w + 80,
            h: this.penguin.h + 50
        };

        if (this.penguinFixed && CollisionSystem.aabb(playerHb, exitHb)) {
            if (!this.victory) {
                this.victory = true;
                this.audio.playSFX('VICTORY');
                p.playVictory();
                this._showEndingDialogue = true;
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => this.particles.emitCollect(
                        exitX + this.penguin.w/2 + (Math.random()-0.5)*200,
                        exitY + this.penguin.h/2 + (Math.random()-0.5)*150
                    ), i * 120);
                }
            }
        }

        const targetCamX = p.x - CONFIG.TENCENT.CAMERA_OFFSET_X;
        this.cameraX += (targetCamX - this.cameraX) * Math.min(1, dt * 8);
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraX > CONFIG.TENCENT.LEVEL_LENGTH - CONFIG.CANVAS_WIDTH) this.cameraX = CONFIG.TENCENT.LEVEL_LENGTH - CONFIG.CANVAS_WIDTH;

        const thresholds = CONFIG.TENCENT.AREA_CHANGE_THRESHOLDS;
        for (let i = thresholds.length - 1; i >= 0; i--) {
            if (p.x >= thresholds[i]) {
                if (this.currentAreaIdx !== i) {
                    this.currentAreaIdx = i;
                    this.currentAreaName = CONFIG.TENCENT.AREA_NAMES[i];
                    this._bgBlend = 0;
                }
                break;
            }
        }
        this._bgBlend = Math.min(1, this._bgBlend + dt * CONFIG.XPENG.BG_BLEND_SPEED);

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }

        this.particles.update(dt);
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = this.assets;

        const bgKeys = CONFIG.TENCENT.AREA_BG_KEYS;
        const thresholds = CONFIG.TENCENT.AREA_CHANGE_THRESHOLDS;
        const numAreas = bgKeys.length;

        const parallaxFactor = 0.5;
        const bgX = this.cameraX * parallaxFactor;

        let currentIdx = 0;
        let blend = 0;
        for (let i = numAreas - 1; i >= 0; i--) {
            if (this.cameraX >= thresholds[i]) {
                currentIdx = i;
                if (i < numAreas - 1) {
                    const nextThresh = thresholds[i + 1];
                    const range = nextThresh - thresholds[i];
                    const progress = (this.cameraX - thresholds[i]) / range;
                    blend = Math.max(0, Math.min(1, (progress - 0.6) / 0.3));
                }
                break;
            }
        }

        const drawBg = (key, offsetX, alpha) => {
            const sp = assets.getSprite(key);
            if (!sp || !sp.image || alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            const tileW = w;
            const startX = -((offsetX % tileW) + tileW) % tileW;
            for (let x = startX - tileW; x < w + tileW; x += tileW) {
                ctx.drawImage(sp.image, Math.round(x), 0, tileW, h);
            }
            ctx.restore();
        };

        const curKey = bgKeys[currentIdx];
        const nextKey = currentIdx < numAreas - 1 ? bgKeys[currentIdx + 1] : null;

        drawBg(curKey, bgX, 1);
        if (nextKey && blend > 0) {
            drawBg(nextKey, bgX, blend);
        }

        ctx.save();
        ctx.translate(-this.cameraX, 0);

        const gy = CONFIG.TENCENT.GROUND_Y;

        for (const bgd of this.bgDecorations) {
            assets.drawBgDecoration(ctx, bgd.x, bgd.y, bgd.type, bgd.alpha);
        }

        for (const seg of this._groundSegments) {
            assets.drawTilePlatform(ctx, seg.x, gy, seg.w, 'ground');
            const tileH = 96;
            const fillY = gy + tileH;
            const fillH = CONFIG.TENCENT.GROUND_H - tileH + 200;
            if (fillH > 0) {
                const grad = ctx.createLinearGradient(0, fillY, 0, fillY + fillH);
                grad.addColorStop(0, '#2a4060');
                grad.addColorStop(0.5, '#1a2d45');
                grad.addColorStop(1, '#0a1420');
                ctx.fillStyle = grad;
                ctx.fillRect(seg.x, fillY, seg.w, fillH);
                ctx.strokeStyle = 'rgba(100,160,220,0.08)';
                ctx.lineWidth = 1;
                for (let ly = fillY + 16; ly < fillY + fillH; ly += 24) {
                    ctx.beginPath(); ctx.moveTo(seg.x, ly); ctx.lineTo(seg.x + seg.w, ly); ctx.stroke();
                }
            }
        }

        for (const plat of this.platforms) {
            if (plat.isGround) continue;
            const ptype = plat.type || 'platform';
            assets.drawTilePlatform(ctx, plat.x, plat.y, plat.w, ptype);
        }

        for (const dec of this.decorations) {
            const sp = assets.getSprite(dec.spriteKey);
            if (sp && sp.image) {
                ctx.drawImage(sp.image, dec.x, dec.y, dec.w, dec.h);
            } else {
                ctx.fillStyle = 'rgba(100,100,120,0.6)';
                ctx.fillRect(dec.x, dec.y, dec.w, dec.h);
            }
        }

        for (const hz of this.deadlyHazards) {
            const sp = assets.getSprite(hz.spriteKey);
            if (sp && sp.image) {
                ctx.save();
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 15 + Math.sin(this._time * 5) * 5;
                ctx.drawImage(sp.image, hz.x, hz.y, hz.w, hz.h);
                ctx.restore();
            } else {
                ctx.fillStyle = 'rgba(255,50,50,0.9)';
                ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
            }
        }

        for (const prop of this.props) {
            if (prop.collected) continue;
            const floatY = Math.sin(this._time * 3 + prop.floatPhase) * 8;
            const sp = assets.getSprite(prop.spriteKey);
            if (sp && sp.image) {
                ctx.save();
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 18;
                ctx.drawImage(sp.image, prop.x, prop.y + floatY, prop.w, prop.h);
                ctx.restore();
            } else {
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(prop.x, prop.y + floatY, prop.w, prop.h);
            }
        }

        for (const virus of this.viruses) {
            virus.render(this.renderer);
        }

        const penguinKey = this.penguinFixed ? 'UI_PENGUIN_FIXED' : 'UI_PENGUIN_BROKEN';
        const penguinSprite = assets.getSprite(penguinKey);
        if (penguinSprite && penguinSprite.image) {
            const bobY = Math.sin(this._time * 2) * 3;
            ctx.drawImage(penguinSprite.image, this.penguin.x, this.penguin.y + bobY, this.penguin.w, this.penguin.h);
        } else {
            ctx.fillStyle = this.penguinFixed ? '#00ff88' : '#888';
            ctx.fillRect(this.penguin.x, this.penguin.y, this.penguin.w, this.penguin.h);
        }

        if (this.penguinFixed) {
            const exitX = this.penguin.x + this.penguin.w/2;
            const exitY = this.penguin.y + this.penguin.h/2;
            const lightColor = 'rgba(100,255,150,';
            const gradient = ctx.createRadialGradient(exitX, exitY, 0, exitX, exitY, 300);
            const pulse = 0.3 + Math.sin(this._time * 3) * 0.15;
            gradient.addColorStop(0, lightColor + '0.5)');
            gradient.addColorStop(0.5, lightColor + pulse + ')');
            gradient.addColorStop(1, lightColor + '0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(this.penguin.x - 200, this.penguin.y - 100, this.penguin.w + 400, this.penguin.h + 200);

            ctx.save();
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 20px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.fillText('★ 走近企鹅完成任务 ★', exitX, this.penguin.y - 25);
            ctx.restore();
        } else {
            const exitX = this.penguin.x + this.penguin.w/2;
            ctx.save();
            ctx.fillStyle = 'rgba(255,150,50,0.8)';
            ctx.font = 'bold 18px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('需要收集6个模块', exitX, this.penguin.y - 15);
            ctx.restore();
        }

        if (this.player) this.player.render(this.renderer);

        ctx.restore();

        this.particles.render(ctx);

        this.hud.render(ctx, null, 0, 'tencent');

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(w/2 - 180, 20, 360, 50);
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 2;
        ctx.strokeRect(w/2 - 180, 20, 360, 50);
        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 26px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentAreaName, w/2, 55);
        ctx.restore();

        const progress = Math.min(1, this.player.x / CONFIG.TENCENT.LEVEL_LENGTH);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(w - 320, h - 50, 280, 24);
        ctx.fillStyle = '#4facfe';
        ctx.fillRect(w - 318, h - 48, 276 * progress, 20);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(w - 320, h - 50, 280, 24);
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`进度: ${Math.floor(progress * 100)}%  道具: ${this.collectedProps.length}/6`, w - 180, h - 33);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(30, h - 90, 320, 70);
        ctx.fillStyle = '#ccc';
        ctx.font = '16px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText('WASD/方向键: 移动', 45, h - 65);
        ctx.fillText('空格/W/↑: 跳跃(可二段跳)', 45, h - 42);
        ctx.fillText('S/↓: 下蹲 | 帮企鹅找回6个模块!', 45, h - 19);
        ctx.restore();

        if (this._hintTimer > 0 && this._hintMsg) {
            const msgAlpha = Math.min(1, this._hintTimer * 2);
            ctx.save();
            ctx.globalAlpha = msgAlpha;
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(w/2 - 250, 100, 500, 60);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/2 - 250, 100, 500, 60);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 20px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText(this._hintMsg, w/2, 138);
            ctx.restore();
        }

        this._drawDialogue(ctx);

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(100,0,0,0.3)';
            ctx.fillRect(0, 0, w, h);
        }
    }
}
