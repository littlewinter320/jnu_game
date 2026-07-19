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
        this.particles.clear();

        const px = CONFIG.TENCENT.PLAYER_START_X;
        const py = CONFIG.TENCENT.PLAYER_START_Y;
        this.player = new Player(px, py, this.gender);
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = false;
        this.player.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.player.invincibleTimer = 0;

        this._buildLevel();
        this.hud = new HUD();
        this.currentAreaName = CONFIG.TENCENT.AREA_NAMES[0];
        this.audio.playBGM('TENCENT');
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
        for (const pl of platLayout) {
            const pw = pl.w * ts;
            this.platforms.push({
                x: pl.x, y: pl.y, w: pw, h: platH,
                isGround: false, isSolid: true,
                type: pl.type || 'platform'
            });
        }

        const decTypes = [
            { key: 'OBS_CONES', w: 50, h: 60, yOff: -60 },
            { key: 'OBS_WARNING_LIGHT', w: 45, h: 70, yOff: -70 },
            { key: 'OBS_BARRIER_FULL', w: 70, h: 90, yOff: -90 },
            { key: 'OBS_HIGH_ARCADE', w: 80, h: 140, yOff: -140 },
            { key: 'OBS_HIGH_GLASS', w: 75, h: 130, yOff: -130 },
            { key: 'OBS_HIGH_PIPES', w: 80, h: 140, yOff: -140 },
            { key: 'OBS_LOW_BLOCKS', w: 90, h: 40, yOff: -40 },
            { key: 'OBS_LOW_FOLDERS', w: 80, h: 50, yOff: -50 },
            { key: 'OBS_LOW_SERVERS', w: 100, h: 45, yOff: -45 },
            { key: 'OBS_MACHINERY', w: 100, h: 110, yOff: -110 },
            { key: 'OBS_HIGH_ICE', w: 80, h: 140, yOff: -140 },
            { key: 'OBS_HIGH_NEWS', w: 80, h: 150, yOff: -150 },
            { key: 'OBS_HIGH_WALL', w: 70, h: 160, yOff: -160 }
        ];

        for (let dx = 600; dx < ll - 600; dx += 350 + Math.random() * 300) {
            const onPlat = Math.random() < 0.35;
            const dec = decTypes[Math.floor(Math.random() * decTypes.length)];
            let dy;
            if (onPlat) {
                const nearPlats = this.platforms.filter(p => !p.isGround && Math.abs(p.x + p.w/2 - dx) < 150);
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
                x: dx, y: dy, w: dec.w, h: dec.h, spriteKey: dec.key
            });
        }

        const hazardTypes = [
            { key: 'OBS_CABLE_RED', w: 60, h: 120, yOff: -120 },
            { key: 'OBS_LASER_SPHERE', w: 70, h: 80, yOff: -80 },
            { key: 'OBS_CHARGER_DAMAGED', w: 80, h: 140, yOff: -140 }
        ];

        const hazardPositions = [
            { x: 1800, onPlat: false },
            { x: 3800, onPlat: true },
            { x: 5800, onPlat: false },
            { x: 7600, onPlat: true },
            { x: 9400, onPlat: false },
            { x: 11400, onPlat: true }
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
                x: pt.x, y: gy - 200 - Math.random() * 80,
                w: 58, h: 58, spriteKey: pt.key, area: pt.area,
                collected: false, floatPhase: Math.random() * Math.PI * 2
            });
        });

        const virusPositions = [
            { x: 1500, y: gy - 80 },
            { x: 3500, y: gy - 80 },
            { x: 5500, y: gy - 80 },
            { x: 7500, y: gy - 80 },
            { x: 9500, y: gy - 80 },
            { x: 11500, y: gy - 80 }
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

    update(dt) {
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

        this._time += dt;
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

        if (p.onGround) {
            p.stamina = Math.min(CONFIG.PLAYER.MAX_STAMINA, p.stamina + CONFIG.PLAYER.STAMINA_RECOVER_RATE * dt);
        }

        this.exitUnlocked = this.collectedProps.length >= 6;
        const exitX = CONFIG.TENCENT.EXIT_X;
        const exitHb = {
            x: exitX,
            y: CONFIG.TENCENT.GROUND_Y - CONFIG.TENCENT.EXIT_HEIGHT,
            w: CONFIG.TENCENT.EXIT_WIDTH,
            h: CONFIG.TENCENT.EXIT_HEIGHT
        };

        if (CollisionSystem.aabb(playerHb, exitHb)) {
            if (this.exitUnlocked) {
                if (!this.victory) {
                    this.victory = true;
                    this.audio.playSFX('VICTORY');
                    p.playVictory();
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => this.particles.emitCollect(
                            exitX + CONFIG.TENCENT.EXIT_WIDTH/2 + (Math.random()-0.5)*200,
                            CONFIG.TENCENT.GROUND_Y - CONFIG.TENCENT.EXIT_HEIGHT/2 + (Math.random()-0.5)*150
                        ), i * 120);
                    }
                }
            } else {
                this.showExitMessage = true;
                this.exitMessageTimer = 2.0;
            }
        }

        if (this.exitMessageTimer > 0) {
            this.exitMessageTimer -= dt;
            if (this.exitMessageTimer <= 0) this.showExitMessage = false;
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
            const ptype = plat.type === 'semisolid' ? 'semisolid' : 'platform';
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

        const exitX = CONFIG.TENCENT.EXIT_X;
        const exitY = gy - CONFIG.TENCENT.EXIT_HEIGHT;
        const exitW = CONFIG.TENCENT.EXIT_WIDTH;
        const exitH = CONFIG.TENCENT.EXIT_HEIGHT;
        const lightColor = this.exitUnlocked ? 'rgba(0,255,100,' : 'rgba(255,50,50,';

        const gradient = ctx.createRadialGradient(
            exitX + exitW/2, exitY + exitH/2, 0,
            exitX + exitW/2, exitY + exitH/2, CONFIG.TENCENT.EXIT_LIGHT_RADIUS
        );
        const pulse = 0.3 + Math.sin(this._time * 3) * 0.15;
        gradient.addColorStop(0, lightColor + (this.exitUnlocked ? 0.4 : 0.35) + ')');
        gradient.addColorStop(0.5, lightColor + pulse + ')');
        gradient.addColorStop(1, lightColor + '0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(
            exitX - CONFIG.TENCENT.EXIT_LIGHT_RADIUS,
            exitY - 100,
            exitW + CONFIG.TENCENT.EXIT_LIGHT_RADIUS * 2,
            exitH + 200
        );

        ctx.fillStyle = this.exitUnlocked ? 'rgba(0,255,100,0.6)' : 'rgba(255,50,50,0.5)';
        ctx.fillRect(exitX, exitY, exitW, 20);
        ctx.fillRect(exitX, exitY, 20, exitH);
        ctx.fillRect(exitX + exitW - 20, exitY, 20, exitH);

        const doorGlow = this.exitUnlocked ? 'rgba(100,255,150,0.3)' : 'rgba(255,100,100,0.2)';
        ctx.fillStyle = doorGlow;
        ctx.fillRect(exitX + 20, exitY + 20, exitW - 40, exitH - 40);

        ctx.save();
        ctx.fillStyle = this.exitUnlocked ? '#00ff64' : '#ff3232';
        ctx.font = 'bold 20px "Courier New"';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.exitUnlocked ? '#00ff64' : '#ff3232';
        ctx.shadowBlur = 10;
        ctx.fillText(this.exitUnlocked ? '✓ 出口已开启' : '✗ 需要收集6个道具', exitX + exitW/2, exitY - 20);
        ctx.restore();

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
        ctx.fillText('S/↓: 下蹲 | 避开病毒和红色陷阱!', 45, h - 19);
        ctx.restore();

        if (this.showExitMessage) {
            const msgAlpha = Math.min(1, this.exitMessageTimer * 3);
            ctx.save();
            ctx.globalAlpha = msgAlpha;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(w/2 - 280, h/2 - 50, 560, 100);
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(w/2 - 280, h/2 - 50, 560, 100);
            ctx.fillStyle = '#ff6666';
            ctx.font = 'bold 24px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('⚠ 出口被锁定！请先收集全部6个事业群道具！', w/2, h/2 + 8);
            ctx.restore();
        }

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(100,0,0,0.3)';
            ctx.fillRect(0, 0, w, h);
        }
    }
}
