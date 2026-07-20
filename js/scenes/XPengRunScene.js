class XPengRunScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.assets = window.Game.assets;

        this._time = 0;
        this.gender = 'male';
        this.player = null;
        this.obstacles = [];
        this.batteries = [];
        this.shieldItems = [];
        this.speed = CONFIG.XPENG.BASE_SPEED;
        this.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.collectedBatteries = 0;
        this.hud = null;
        this.gameOver = false;
        this.victory = false;
        this.endTimer = 0;
        this.currentLane = 0;
        this.targetLane = 0;
        this.laneSwitchProgress = 1;
        this.playerY = 0;
        this.jumpTimer = 0;
        this.jumpStartY = 0;
        this.crouching = false;
        this._obstacleTimer = 0;
        this._batteryTimer = 3;
        this._shieldItemTimer = 10;
        this._speedTier = 0;
        this._heartbeatTimer = 0;
        this._distanceTravelled = 0;
        this._bgScrollOffset = 0;
        this._bgBlend = 0;
        this._bgIdx = 0;
        this._roadMarkOffset = 0;
        this.deathReason = null;
        this._targetLane = -1;
        this._xpengCar = null;
        this._xpengCarPhase = 'waiting';
        this._victoryParticlesEmitted = false;
    }

    enter(data) {
        this._time = 0;
        this.gender = data?.gender || 'male';
        this.obstacles = [];
        this.batteries = [];
        this.shieldItems = [];
        this.speed = CONFIG.XPENG.BASE_SPEED;
        this.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.collectedBatteries = 0;
        this.gameOver = false;
        this.victory = false;
        this.endTimer = 0;
        this.currentLane = 0;
        this.targetLane = 0;
        this.laneSwitchProgress = 1;
        this.jumpTimer = 0;
        this.crouching = false;
        this._obstacleTimer = 3.5;
        this._batteryTimer = 3;
        this._shieldItemTimer = 10;
        this._speedTier = 0;
        this._heartbeatTimer = 0;
        this._distanceTravelled = 0;
        this._bgScrollOffset = 0;
        this._bgBlend = 0;
        this._bgIdx = 0;
        this._roadMarkOffset = 0;
        this.deathReason = null;
        this._targetLane = -1;
        this._xpengCar = null;
        this._xpengCarPhase = 'waiting';
        this._victoryParticlesEmitted = false;
        this.particles.clear();

        const px = CONFIG.XPENG.PLAYER_X;
        const py = CONFIG.XPENG.LANES[0].y - 110;
        this.player = new Player(px, py, this.gender);
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = true;
        this.player.facingRight = true;
        this.player.state = 'run';
        this.playerY = py;
        this.jumpStartY = py;

        this.hud = new HUD();
        this.audio.playBGM('XPENG');
    }

    _getLaneY(laneIdx) {
        const lane = CONFIG.XPENG.LANES[laneIdx];
        return lane.y - 110;
    }

    _getPlayerHitbox() {
        const h = this.crouching ? 55 : (this.jumpTimer > 0 ? 80 : 105);
        const w = 55;
        return {
            x: this.player.x + 18,
            y: this.player.y + (105 - h),
            w: w,
            h: h
        };
    }

    _spawnObstacle() {
        const laneIdx = Math.floor(Math.random() * CONFIG.XPENG.LANES.length);
        const lane = CONFIG.XPENG.LANES[laneIdx];

        const types = [
            { key: 'OBS_LOW_FOLDERS', w: 85, h: 52, yOff: -52, avoidBy: 'jump' },
            { key: 'OBS_LOW_BLOCKS', w: 90, h: 40, yOff: -40, avoidBy: 'jump' },
            { key: 'OBS_CABLE_RED', w: 65, h: 130, yOff: -200, avoidBy: 'crouch' },
            { key: 'OBS_LASER_SPHERE', w: 80, h: 90, yOff: -170, avoidBy: 'crouch' },
            { key: 'OBS_CHARGER_DAMAGED', w: 90, h: 145, yOff: -145, avoidBy: 'switch' }
        ];

        const o = types[Math.floor(Math.random() * types.length)];
        this.obstacles.push({
            x: CONFIG.CANVAS_WIDTH + 50,
            y: lane.y + o.yOff,
            w: o.w, h: o.h,
            spriteKey: o.key, avoidBy: o.avoidBy,
            lane: laneIdx, hit: false
        });
    }

    _spawnBattery() {
        const laneIdx = Math.floor(Math.random() * CONFIG.XPENG.LANES.length);
        const lane = CONFIG.XPENG.LANES[laneIdx];
        const yOffsets = [-100, -160, -220];
        this.batteries.push({
            x: CONFIG.CANVAS_WIDTH + 50,
            y: lane.y + yOffsets[Math.floor(Math.random() * yOffsets.length)],
            w: 48, h: 60,
            lane: laneIdx, rot: 0
        });
    }

    _spawnShield() {
        const laneIdx = Math.floor(Math.random() * CONFIG.XPENG.LANES.length);
        const lane = CONFIG.XPENG.LANES[laneIdx];
        const yOffsets = [-100, -160, -220];
        this.shieldItems.push({
            x: CONFIG.CANVAS_WIDTH + 50,
            y: lane.y + yOffsets[Math.floor(Math.random() * yOffsets.length)],
            w: 40, h: 40,
            type: 'shield',
            lane: laneIdx,
            floatPhase: Math.random() * Math.PI * 2
        });
    }

    update(dt) {
        if (this.gameOver || this.victory) {
            this.endTimer += dt;
            if (this.victory && !this._victoryParticlesEmitted) {
                this._victoryParticlesEmitted = true;
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => {
                        this.particles.emitCollect(
                            200 + Math.random() * (CONFIG.CANVAS_WIDTH - 400),
                            200 + Math.random() * 600
                        );
                    }, i * 50);
                }
            }
            this.player.update(dt);
            this.particles.update(dt);
            const waitTime = this.victory ? 2.5 : 2.0;
            if (this.endTimer > waitTime) {
                if (this.victory) {
                    this.changeScene(CONFIG.SCENES.WIN, {
                        gender: this.gender, level: 'xpeng',
                        collected: this.collectedBatteries,
                        totalProps: Math.floor(this._distanceTravelled / 500),
                        time: this._time
                    });
                } else {
                    this.changeScene(CONFIG.SCENES.GAME_OVER, {
                        gender: this.gender, level: 'xpeng', reason: this.deathReason || 'stamina'
                    });
                }
            }
            return;
        }

        this._time += dt;
        const effectiveSpeed = this.crouching ? this.speed * CONFIG.XPENG.CROUCH_SPEED_MULTIPLIER : this.speed;
        this._distanceTravelled += effectiveSpeed * dt;
        this._bgScrollOffset = (this._bgScrollOffset + effectiveSpeed * dt * 0.2) % 2000;
        this._roadMarkOffset = (this._roadMarkOffset + effectiveSpeed * dt * 1.5) % 80;

        const bgDurations = [50];
        if (this._time > bgDurations[this._bgIdx] && this._bgIdx < CONFIG.XPENG.BG_KEYS.length - 1) {
            this._bgIdx++;
            this._bgBlend = 0;
        }
        this._bgBlend = Math.min(1, this._bgBlend + dt * 0.8);

        const p = this.player;
        const targetSpeed = Math.min(CONFIG.XPENG.MAX_SPEED,
            CONFIG.XPENG.BASE_SPEED + Math.floor(this._time / CONFIG.XPENG.SPEED_INCREASE_INTERVAL) * CONFIG.XPENG.SPEED_INCREASE_AMOUNT);
        if (targetSpeed > this.speed) {
            this.speed = targetSpeed;
            this._speedTier++;
            this.audio.playSFX('SPEED_UP');
            for (let i = 0; i < 8; i++) {
                this.particles.emitSpeedLines(CONFIG.CANVAS_HEIGHT * Math.random());
            }
        }

        if (this.input.isJustPressed(CONFIG.KEYS.JUMP) || this.input.isJustPressed(CONFIG.KEYS.W) || this.input.isJustPressed(CONFIG.KEYS.UP)) {
            if (this.jumpTimer <= 0 && !this.crouching && this.laneSwitchProgress >= 0.9) {
                this.jumpTimer = CONFIG.XPENG.JUMP_TIME;
                this.jumpStartY = this.playerY;
                this.audio.playSFX('JUMP');
                this.particles.emitDust(p.x + p.w/2, this.playerY + p.h);
                this.stamina -= CONFIG.XPENG.STAMINA_JUMP_COST;
                this.crouching = false;
                p.crouch(false);
            }
        }

        const wasCrouching = this.crouching;
        const newCrouching = (this.input.isDown(CONFIG.KEYS.S) || this.input.isDown(CONFIG.KEYS.DOWN)) && this.jumpTimer <= 0;
        if (newCrouching && !wasCrouching) {
            this.audio.playSFX('LAND');
            p.crouch(true);
        } else if (!newCrouching && wasCrouching) {
            p.crouch(false);
        }
        this.crouching = newCrouching;
        if (this.crouching) {
            this.stamina -= CONFIG.XPENG.STAMINA_CROUCH_COST * dt;
        }

        if ((this.input.isJustPressed(CONFIG.KEYS.A) || this.input.isJustPressed(CONFIG.KEYS.LEFT)) && this.laneSwitchProgress >= 0.9 && this.jumpTimer <= 0) {
            if (this.targetLane > 0) {
                this.targetLane--;
                this.laneSwitchProgress = 0;
                this.audio.playSFX('BUTTON_HOVER');
            }
        }
        if ((this.input.isJustPressed(CONFIG.KEYS.D) || this.input.isJustPressed(CONFIG.KEYS.RIGHT)) && this.laneSwitchProgress >= 0.9 && this.jumpTimer <= 0) {
            if (this.targetLane < CONFIG.XPENG.LANES.length - 1) {
                this.targetLane++;
                this.laneSwitchProgress = 0;
                this.audio.playSFX('BUTTON_HOVER');
            }
        }

        if (this.laneSwitchProgress < 1) {
            this.laneSwitchProgress += dt / CONFIG.XPENG.LANE_SWITCH_TIME;
            if (this.laneSwitchProgress > 1) this.laneSwitchProgress = 1;
        }
        const t = this.laneSwitchProgress;
        const easeT = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
        const fromY = this._getLaneY(this.currentLane);
        const toY = this._getLaneY(this.targetLane);
        let targetY = fromY + (toY - fromY) * easeT;
        if (this.laneSwitchProgress >= 1) this.currentLane = this.targetLane;

        if (this.jumpTimer > 0) {
            this.jumpTimer -= dt;
            const jt = 1 - (this.jumpTimer / CONFIG.XPENG.JUMP_TIME);
            const jumpHeight = CONFIG.XPENG.JUMP_HEIGHT;
            const arc = Math.sin(jt * Math.PI);
            targetY = targetY - arc * jumpHeight;
            if (this.jumpTimer <= 0) {
                this.audio.playSFX('LAND');
                this.particles.emitDust(p.x + p.w/2, targetY + p.h);
                this.crouching = (this.input.isDown(CONFIG.KEYS.S) || this.input.isDown(CONFIG.KEYS.DOWN));
                if (this.crouching) {
                    p.crouch(true);
                }
            }
        }

        this.playerY += (targetY - this.playerY) * Math.min(1, dt * 15);
        p.y = this.playerY;
        p.onGround = this.jumpTimer <= 0;

        if (this.jumpTimer > 0) {
            const jt = 1 - (this.jumpTimer / CONFIG.XPENG.JUMP_TIME);
            p.vy = jt < 0.5 ? -400 : 400;
            p.vx = this.crouching ? this.speed * CONFIG.XPENG.CROUCH_SPEED_MULTIPLIER : this.speed;
        } else if (this.crouching) {
            p.vy = 0;
            p.vx = this.speed * CONFIG.XPENG.CROUCH_SPEED_MULTIPLIER;
        } else {
            p.vy = 0;
            p.vx = this.speed;
        }
        p.facingRight = true;

        this.stamina -= CONFIG.XPENG.STAMINA_DECAY_PER_SEC * dt;
        if (this.stamina <= 0) this.stamina = 0;

        if (this.stamina < 30 && this.stamina > 0) {
            this._heartbeatTimer -= dt;
            if (this._heartbeatTimer <= 0) {
                this._heartbeatTimer = this.stamina < 15 ? 0.5 : 0.9;
                this.audio.playSFX('HEARTBEAT');
            }
        }

        this._obstacleTimer -= dt;
        if (this._obstacleTimer <= 0) {
            this._spawnObstacle();
            const speedFactor = this.speed / CONFIG.XPENG.BASE_SPEED;
            const timeTiers = Math.floor(this._time / CONFIG.XPENG.DIFFICULTY_INTERVAL);
            const difficultyFactor = Math.pow(1 - CONFIG.XPENG.DIFFICULTY_INCREASE, timeTiers);
            const isEarlyPhase = this._time < CONFIG.XPENG.EARLY_PHASE_DURATION;
            const isFinalMinute = this._time >= (CONFIG.XPENG.DURATION - 60);
            const finalMinuteFactor = isFinalMinute ? 1.1 : 1.0; // 降低10%生成频率
            const minGap = ((isEarlyPhase ? CONFIG.XPENG.OBSTACLE_SPAWN_MIN_EARLY : CONFIG.XPENG.OBSTACLE_SPAWN_MIN) / speedFactor) * difficultyFactor * finalMinuteFactor;
            const maxGap = ((isEarlyPhase ? CONFIG.XPENG.OBSTACLE_SPAWN_MAX_EARLY : CONFIG.XPENG.OBSTACLE_SPAWN_MAX) / speedFactor) * difficultyFactor * finalMinuteFactor;
            this._obstacleTimer = minGap + Math.random() * (maxGap - minGap);
        }

        this._batteryTimer -= dt;
        if (this._batteryTimer <= 0) {
            this._spawnBattery();
            this._batteryTimer = CONFIG.XPENG.BATTERY_SPAWN_MIN + Math.random() * (CONFIG.XPENG.BATTERY_SPAWN_MAX - CONFIG.XPENG.BATTERY_SPAWN_MIN);
        }

        this._shieldItemTimer -= dt;
        if (this._shieldItemTimer <= 0) {
            this._spawnShield();
            this._shieldItemTimer = 8 + Math.random() * 4;
        }

        const timeLeft = CONFIG.XPENG.DURATION - this._time;
        
        if (timeLeft <= 10 && this._xpengCarPhase === 'waiting') {
            if (this._targetLane === -1) {
                this._targetLane = Math.floor(Math.random() * CONFIG.XPENG.LANES.length);
            }
            this._xpengCarPhase = 'warning';
        }

        if (timeLeft <= 0 && this._xpengCarPhase === 'warning') {
            this._xpengCarPhase = 'arriving';
            const targetLane = CONFIG.XPENG.LANES[this._targetLane];
            this._xpengCar = {
                x: CONFIG.CANVAS_WIDTH + 100,
                y: targetLane.y - 100,
                w: 200,
                h: 120,
                lane: this._targetLane,
                speed: this.speed * 1.2,
                passed: false
            };
        }

        if (this._xpengCarPhase === 'arriving' && this._xpengCar) {
            this._xpengCar.x -= this._xpengCar.speed * dt;
            const hb = this._getPlayerHitbox();
            const carHb = { x: this._xpengCar.x, y: this._xpengCar.y, w: this._xpengCar.w, h: this._xpengCar.h };
            
            if (CollisionSystem.aabb(hb, carHb)) {
                if (this.currentLane === this._targetLane) {
                    this.victory = true;
                    this.endTimer = 0;
                    this.audio.playSFX('VICTORY');
                    p.playVictory();
                    this._xpengCarPhase = 'victory';
                } else {
                    this.gameOver = true;
                    this.endTimer = 0;
                    this.deathReason = 'missed_xpeng';
                    this.audio.playSFX('DEATH');
                    p.die();
                    this.particles.emitExplosion(p.x + p.w/2, p.y + p.h/2);
                    this._xpengCarPhase = 'failed';
                }
            }
            
            if (this._xpengCar.x + this._xpengCar.w < -100 && !this.victory && !this.gameOver) {
                this.gameOver = true;
                this.endTimer = 0;
                this.deathReason = 'missed_xpeng';
                this.audio.playSFX('DEATH');
                p.die();
                this._xpengCarPhase = 'failed';
            }
        }

        const moveAmount = effectiveSpeed * dt;
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= moveAmount;
            if (obs.x + obs.w < -100) {
                this.obstacles.splice(i, 1);
                continue;
            }
            if (!obs.hit) {
                const hb = this._getPlayerHitbox();
                if (CollisionSystem.aabb(hb, obs)) {
                    if (obs.avoidBy === 'jump' && this.jumpTimer > 0) continue;
                    if (obs.avoidBy === 'crouch' && this.crouching) continue;
                    
                    if (p.blockDamage()) {
                        obs.hit = true;
                        this.particles.emitExplosion(obs.x + obs.w/2, obs.y + obs.h/2);
                        this.audio.playSFX('KILL');
                    } else if (p.invincibleTimer <= 0) {
                        obs.hit = true;
                        this.stamina -= CONFIG.XPENG.DAMAGE_OBSTACLE;
                        this.audio.playSFX('HURT');
                        this.particles.emitExplosion(hb.x + hb.w/2, hb.y + hb.h/2);
                        this.renderer.shake(10, 0.3);
                        p.takeDamage(0);
                    }
                }
            }
        }

        for (let i = this.batteries.length - 1; i >= 0; i--) {
            const bat = this.batteries[i];
            bat.x -= moveAmount;
            bat.rot += dt * 3;
            if (bat.x + bat.w < -50) {
                this.batteries.splice(i, 1);
                continue;
            }
            const hb = this._getPlayerHitbox();
            if (CollisionSystem.aabb(hb, bat)) {
                this.batteries.splice(i, 1);
                this.stamina = Math.min(CONFIG.PLAYER.MAX_STAMINA, this.stamina + CONFIG.XPENG.BATTERY_RESTORE);
                this.collectedBatteries++;
                this.audio.playSFX('COLLECT_BATTERY');
                this.particles.emitCollect(bat.x + bat.w/2, bat.y + bat.h/2);
            }
        }

        for (let i = this.shieldItems.length - 1; i >= 0; i--) {
            const si = this.shieldItems[i];
            si.x -= moveAmount;
            if (si.x + si.w < -50) {
                this.shieldItems.splice(i, 1);
                continue;
            }
            const hb = this._getPlayerHitbox();
            if (CollisionSystem.aabb(hb, si)) {
                this.shieldItems.splice(i, 1);
                this.player.activateShield('xpeng', CONFIG.XPENG.SHIELD_DURATION);
                this.audio.playSFX('SHIELD_PICKUP');
                this.particles.emit(si.x + si.w/2, si.y + si.h/2, {
                    count: 20, spreadX: 150, spreadY: 150, life: 0.6, size: 4,
                    colors: ['#00ddff', '#88eeff', '#4facfe'], shape: 'circle'
                });
            }
        }

        if (Math.random() < 0.2 * (this.speed / CONFIG.XPENG.BASE_SPEED)) {
            this.particles.emitSpeedLines(Math.random() * CONFIG.CANVAS_HEIGHT);
        }

        if (this.stamina <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.endTimer = 0;
            this.deathReason = 'stamina';
            this.audio.playSFX('DEATH');
            p.die();
            this.particles.emitExplosion(p.x + p.w/2, p.y + p.h/2);
        }

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }

        p.updateAnim(dt);
        p.x = CONFIG.XPENG.PLAYER_X;
        p.y = this.playerY;
        this.particles.update(dt);
    }

    render() {
        const ctx = this.renderer.ctx;
        const w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = this.assets;
        const ts = CONFIG.TILES.TILE_SIZE;

        const bgKeys = CONFIG.XPENG.BG_KEYS;
        const curBgKey = bgKeys[Math.min(this._bgIdx, bgKeys.length - 1)];
        const nextBgKey = (this._bgIdx < bgKeys.length - 1) ? bgKeys[this._bgIdx + 1] : null;

        const curBg = assets.getSprite(curBgKey);
        if (curBg && curBg.image) {
            const bgOff = this._bgScrollOffset * 0.3;
            ctx.drawImage(curBg.image, -bgOff % w, 0, w, h);
            ctx.drawImage(curBg.image, w - (bgOff % w), 0, w, h);
        } else {
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, '#0a0a1e');
            gradient.addColorStop(0.5, '#1a1a3e');
            gradient.addColorStop(1, '#0f0f2a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        }

        if (nextBgKey && this._bgBlend < 1) {
            const nextBg = assets.getSprite(nextBgKey);
            if (nextBg && nextBg.image) {
                ctx.save();
                ctx.globalAlpha = this._bgBlend * 0.6;
                ctx.drawImage(nextBg.image, 0, 0, w, h);
                ctx.restore();
            }
        }

        const gy = CONFIG.XPENG.GROUND_Y;
        const roadGrad = ctx.createLinearGradient(0, 500, 0, gy + 50);
        roadGrad.addColorStop(0, 'rgba(20,20,40,0)');
        roadGrad.addColorStop(0.4, 'rgba(30,30,60,0.6)');
        roadGrad.addColorStop(1, 'rgba(15,15,30,0.95)');
        ctx.fillStyle = roadGrad;
        ctx.fillRect(0, 500, w, gy + 100 - 500);

        for (let li = 0; li < CONFIG.XPENG.LANES.length; li++) {
            const lane = CONFIG.XPENG.LANES[li];
            const ly = lane.y + lane.h;
            const isActive = this.currentLane === li;
            const isTarget = (this._xpengCarPhase === 'warning' || this._xpengCarPhase === 'arriving') && li === this._targetLane;
            const blink = Math.sin(this._time * 8) > 0;

            ctx.fillStyle = `rgba(50,50,80,${0.5 + li*0.1})`;
            ctx.fillRect(0, ly - 6, w, 10);

            let lineColor;
            if (isTarget && blink) {
                lineColor = 'rgba(0,255,100,0.8)';
            } else if (isActive) {
                lineColor = 'rgba(255,180,0,0.5)';
            } else {
                lineColor = `rgba(255,140,0,${0.12 + li*0.08})`;
            }
            
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = isTarget ? (blink ? 4 : 3) : (isActive ? 3 : (2 + li * 0.5));
            ctx.setLineDash([25, 20]);
            ctx.lineDashOffset = -this._roadMarkOffset;
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(w, ly);
            ctx.stroke();
            ctx.setLineDash([]);

            if (isActive || isTarget) {
                ctx.save();
                ctx.shadowColor = isTarget ? '#00ff66' : '#ffb400';
                ctx.shadowBlur = 15;
                ctx.strokeStyle = isTarget ? (blink ? 'rgba(0,255,100,0.7)' : 'rgba(0,255,100,0.4)') : 'rgba(255,180,0,0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([15, 10]);
                ctx.lineDashOffset = -this._roadMarkOffset * 1.2;
                ctx.beginPath();
                ctx.moveTo(0, ly - 2);
                ctx.lineTo(w, ly - 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }
        }

        for (const obs of this.obstacles) {
            const sp = assets.getSprite(obs.spriteKey);
            ctx.save();
            ctx.shadowColor = '#ff3333';
            ctx.shadowBlur = 12 + Math.sin(this._time * 6) * 4;
            if (sp && sp.image) {
                ctx.drawImage(sp.image, obs.x, obs.y, obs.w, obs.h);
            } else {
                ctx.fillStyle = 'rgba(255,50,50,0.9)';
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            }
            ctx.restore();
        }

        for (const bat of this.batteries) {
            const sp = assets.getSprite('STAMINA_BATTERY');
            ctx.save();
            ctx.translate(bat.x + bat.w/2, bat.y + bat.h/2);
            ctx.rotate(Math.sin(bat.rot) * 0.25);
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 22;
            if (sp && sp.image) {
                ctx.drawImage(sp.image, -bat.w/2, -bat.h/2, bat.w, bat.h);
            } else {
                ctx.fillStyle = '#4facfe';
                ctx.fillRect(-bat.w/2, -bat.h/2, bat.w, bat.h);
            }
            ctx.restore();
        }

        for (const si of this.shieldItems) {
            const floatY = Math.sin(this._time * 2.5 + si.floatPhase) * 10;
            const drawX = si.x;
            const drawY = si.y + floatY;
            ctx.save();
            const pulse = 0.7 + Math.sin(this._time * 4) * 0.3;
            ctx.shadowColor = '#00ddff';
            ctx.shadowBlur = 20 * pulse;
            ctx.fillStyle = 'rgba(0,120,200,0.9)';
            ctx.beginPath();
            ctx.arc(drawX + si.w/2, drawY + si.h/2, si.w/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#88eeff';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(drawX + si.w/2 - 4, drawY + 8, 8, si.h - 16);
            ctx.fillRect(drawX + 10, drawY + si.h/2 - 4, si.w - 20, 8);
            ctx.restore();
        }

        if (this._xpengCar && (this._xpengCarPhase === 'arriving' || this._xpengCarPhase === 'victory' || this._xpengCarPhase === 'failed')) {
            const car = assets.getSprite('UI_XPENG_CAR');
            if (car && car.image) {
                ctx.drawImage(car.image, this._xpengCar.x, this._xpengCar.y, this._xpengCar.w, this._xpengCar.h);
            } else {
                ctx.save();
                ctx.fillStyle = '#1a73e8';
                ctx.fillRect(this._xpengCar.x, this._xpengCar.y + 20, this._xpengCar.w - 20, this._xpengCar.h - 40);
                ctx.fillStyle = '#0d47a1';
                ctx.beginPath();
                ctx.moveTo(this._xpengCar.x + 30, this._xpengCar.y + 20);
                ctx.lineTo(this._xpengCar.x + 60, this._xpengCar.y);
                ctx.lineTo(this._xpengCar.x + this._xpengCar.w - 50, this._xpengCar.y);
                ctx.lineTo(this._xpengCar.x + this._xpengCar.w - 20, this._xpengCar.y + 20);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'rgba(150,220,255,0.6)';
                ctx.fillRect(this._xpengCar.x + 70, this._xpengCar.y + 10, this._xpengCar.w - 120, 25);
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(this._xpengCar.x + 40, this._xpengCar.y + this._xpengCar.h - 25, 18, 0, Math.PI*2);
                ctx.arc(this._xpengCar.x + this._xpengCar.w - 50, this._xpengCar.y + this._xpengCar.h - 25, 18, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath();
                ctx.arc(this._xpengCar.x + this._xpengCar.w - 25, this._xpengCar.y + 50, 8, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        }

        if (this.player) this.player.render(this.renderer);

        const speedLines = Math.floor(this.speed / 120);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        for (let i = 0; i < speedLines; i++) {
            const ly = Math.random() * h;
            const lx = (this._time * this.speed * 1.8 + i * 250) % (w + 200) - 100;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx - 60 - Math.random()*50, ly);
            ctx.stroke();
        }

        this.particles.render(ctx);

        this.hud.render(ctx, this.stamina, CONFIG.PLAYER.MAX_STAMINA, 'xpeng', this.player.shieldTimer || 0);

        const timeLeft = Math.max(0, CONFIG.XPENG.DURATION - this._time);
        const mins = Math.floor(timeLeft / 60);
        const secs = Math.floor(timeLeft % 60);
        const timeColor = timeLeft < 10 ? '#ff4444' : '#ff8c00';
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(w/2 - 130, 20, 260, 50);
        ctx.strokeStyle = timeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(w/2 - 130, 20, 260, 50);
        ctx.fillStyle = timeColor;
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`剩余时间: ${mins}:${secs.toString().padStart(2,'0')}`, w/2, 55);
        ctx.restore();

        if (this._xpengCarPhase === 'warning' && timeLeft > 0) {
            const blink = Math.sin(this._time * 6) > 0;
            const targetLaneNum = this._targetLane + 1;
            
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(w/2 - 300, 80, 600, 70);
            ctx.strokeStyle = blink ? '#ffcc00' : '#ff9900';
            ctx.lineWidth = 3;
            ctx.strokeRect(w/2 - 300, 80, 600, 70);
            ctx.fillStyle = blink ? '#ffff00' : '#ffcc00';
            ctx.font = 'bold 28px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText(`⚠ 小鹏汽车即将出现！注意第${targetLaneNum}车道！`, w/2, 125);
            ctx.restore();

            const targetLane = CONFIG.XPENG.LANES[this._targetLane];
            ctx.save();
            ctx.fillStyle = blink ? 'rgba(255,220,0,0.9)' : 'rgba(255,180,0,0.7)';
            ctx.font = 'bold 32px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 20;
            ctx.fillText('↓ 目标车道 ↓', w/2, targetLane.y - 40);
            ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(w - 300, 80, 280, 45);
        ctx.fillStyle = '#ffa500';
        ctx.font = 'bold 24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`速度: ${Math.floor(this.speed)} px/s`, w - 160, 110);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(30, h - 100, 300, 80);
        ctx.fillStyle = '#ccc';
        ctx.font = '20px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText('空格/W/↑: 跳跃', 45, h - 70);
        ctx.fillText('S/↓: 下蹲躲高障碍', 45, h - 45);
        ctx.fillText('A/D ←/→: 切换车道', 45, h - 20);
        ctx.restore();

        if (this.player.invincibleTimer > 0 && Math.floor(this.player.invincibleTimer * 10) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,80,80,0.15)';
            ctx.fillRect(0, 0, w, h);
        }

        if (this.stamina < 25 && this.stamina > 0 && !this.gameOver && !this.victory) {
            const pulse = 0.1 + Math.sin(this._time * 8) * 0.08;
            ctx.fillStyle = `rgba(255,0,0,${pulse})`;
            ctx.fillRect(0, 0, w, h);
        }

        if (this.victory) {
            const endBg = assets.getSprite('BG_XPENG_ENDING');
            ctx.save();
            ctx.globalAlpha = 0.85;
            if (endBg && endBg.image) {
                ctx.drawImage(endBg.image, 0, 0, w, h);
            } else {
                const gradient = ctx.createLinearGradient(0, 0, 0, h);
                gradient.addColorStop(0, '#0a2040');
                gradient.addColorStop(0.5, '#1a4080');
                gradient.addColorStop(1, '#0a3060');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
            }
            ctx.restore();
            
            ctx.save();
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 30;
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 64px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('成功逃离！', w/2, h/2 - 50);
            ctx.restore();
        }

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(100,0,0,0.3)';
            ctx.fillRect(0, 0, w, h);
        }
    }
}
