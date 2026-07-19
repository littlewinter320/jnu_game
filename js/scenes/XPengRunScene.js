class XPengRunScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.assets = window.Game.assets;

        this._time = 0;
        this.gender = 'male';
        this.player = null;
        this.obstacles = [];
        this.decorations = [];
        this.batteries = [];
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
        this.crouchTimer = 0;
        this._obstacleTimer = 0;
        this._decorationTimer = 0;
        this._batteryTimer = 3;
        this._speedTier = 0;
        this._heartbeatTimer = 0;
        this._distanceTravelled = 0;
        this._bgScrollOffset = 0;
        this._bgBlend = 0;
        this._bgIdx = 0;
        this._roadMarkOffset = 0;
    }

    enter(data) {
        this._time = 0;
        this.gender = data?.gender || 'male';
        this.obstacles = [];
        this.decorations = [];
        this.batteries = [];
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
        this.crouchTimer = 0;
        this._obstacleTimer = 1.2;
        this._decorationTimer = 0.5;
        this._batteryTimer = 2.5;
        this._speedTier = 0;
        this._heartbeatTimer = 0;
        this._distanceTravelled = 0;
        this._bgScrollOffset = 0;
        this._bgBlend = 0;
        this._bgIdx = 0;
        this._roadMarkOffset = 0;
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
        const h = this.crouchTimer > 0 ? 55 : (this.jumpTimer > 0 ? 80 : 105);
        const w = 55;
        return {
            x: this.player.x + 18,
            y: this.player.y + (105 - h),
            w: w,
            h: h
        };
    }

    update(dt) {
        if (this.gameOver || this.victory) {
            this.endTimer += dt;
            this.particles.update(dt);
            if (this.endTimer > 2.0) {
                if (this.victory) {
                    this.changeScene(CONFIG.SCENES.WIN, {
                        gender: this.gender, level: 'xpeng',
                        collected: this.collectedBatteries,
                        totalProps: Math.floor(this._distanceTravelled / 500),
                        time: this._time
                    });
                } else {
                    this.changeScene(CONFIG.SCENES.GAME_OVER, {
                        gender: this.gender, level: 'xpeng', reason: 'stamina'
                    });
                }
            }
            return;
        }

        this._time += dt;
        this._distanceTravelled += this.speed * dt;
        this._bgScrollOffset = (this._bgScrollOffset + this.speed * dt * 0.2) % 2000;
        this._roadMarkOffset = (this._roadMarkOffset + this.speed * dt * 1.5) % 80;

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
            if (this.jumpTimer <= 0 && this.crouchTimer <= 0 && this.laneSwitchProgress >= 0.9) {
                this.jumpTimer = CONFIG.XPENG.JUMP_TIME;
                this.jumpStartY = this.playerY;
                this.audio.playSFX('JUMP');
                this.particles.emitDust(p.x + p.w/2, this.playerY + p.h);
                this.stamina -= CONFIG.XPENG.STAMINA_JUMP_COST;
            }
        }

        if (this.input.isJustPressed(CONFIG.KEYS.S) || this.input.isJustPressed(CONFIG.KEYS.DOWN)) {
            if (this.jumpTimer <= 0 && this.crouchTimer <= 0) {
                this.crouchTimer = CONFIG.XPENG.CROUCH_DURATION;
                this.audio.playSFX('LAND');
                p.crouch(true);
            }
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
            }
        }

        if (this.crouchTimer > 0) {
            this.crouchTimer -= dt;
            if (this.crouchTimer < 0) {
                this.crouchTimer = 0;
                p.crouch(false);
            }
        }

        this.playerY += (targetY - this.playerY) * Math.min(1, dt * 15);
        p.y = this.playerY;
        p.vy = 0;
        p.onGround = this.jumpTimer <= 0;

        if (this.jumpTimer > 0) {
            p.state = 'jump';
            p.crouching = false;
        } else if (this.crouchTimer > 0) {
            p.state = 'crouch';
            p.crouching = true;
        } else {
            p.state = 'run';
            p.crouching = false;
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
            const minGap = CONFIG.XPENG.OBSTACLE_SPAWN_MIN / speedFactor;
            const maxGap = CONFIG.XPENG.OBSTACLE_SPAWN_MAX / speedFactor;
            this._obstacleTimer = minGap + Math.random() * (maxGap - minGap);
        }

        this._decorationTimer -= dt;
        if (this._decorationTimer <= 0) {
            this._spawnDecoration();
            this._decorationTimer = 0.4 + Math.random() * 0.8;
        }

        this._batteryTimer -= dt;
        if (this._batteryTimer <= 0) {
            this._spawnBattery();
            this._batteryTimer = CONFIG.XPENG.BATTERY_SPAWN_MIN + Math.random() * (CONFIG.XPENG.BATTERY_SPAWN_MAX - CONFIG.XPENG.BATTERY_SPAWN_MIN);
        }

        const moveAmount = this.speed * dt;
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= moveAmount;
            if (obs.x + obs.w < -100) {
                this.obstacles.splice(i, 1);
                continue;
            }
            if (!obs.hit && p.invincibleTimer <= 0) {
                const hb = this._getPlayerHitbox();
                if (CollisionSystem.aabb(hb, obs)) {
                    if (obs.avoidBy === 'jump' && this.jumpTimer > 0) continue;
                    if (obs.avoidBy === 'crouch' && this.crouchTimer > 0) continue;
                    obs.hit = true;
                    this.stamina -= CONFIG.XPENG.DAMAGE_OBSTACLE;
                    this.audio.playSFX('HURT');
                    this.particles.emitExplosion(hb.x + hb.w/2, hb.y + hb.h/2);
                    this.renderer.shake(10, 0.3);
                    p.takeDamage(0);
                }
            }
        }

        for (let i = this.decorations.length - 1; i >= 0; i--) {
            const dec = this.decorations[i];
            dec.x -= moveAmount * (dec.bgLayer || 1);
            if (dec.x + dec.w < -200) {
                this.decorations.splice(i, 1);
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

        if (Math.random() < 0.2 * (this.speed / CONFIG.XPENG.BASE_SPEED)) {
            this.particles.emitSpeedLines(Math.random() * CONFIG.CANVAS_HEIGHT);
        }

        if (this.stamina <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.audio.playSFX('DIE');
            p.die();
            this.particles.emitExplosion(p.x + p.w/2, p.y + p.h/2);
        }

        if (this._time >= CONFIG.XPENG.DURATION && !this.victory && !this.gameOver) {
            this.victory = true;
            this.audio.playSFX('VICTORY');
            p.playVictory();
        }

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this.audio.playSFX('BUTTON_CLICK');
            this.changeScene(CONFIG.SCENES.MAIN_MENU);
        }

        p.updateAnimation(dt);
        this.particles.update(dt);
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

    _spawnDecoration() {
        const laneIdx = Math.floor(Math.random() * (CONFIG.XPENG.LANES.length + 2));
        const ly = laneIdx < CONFIG.XPENG.LANES.length ? CONFIG.XPENG.LANES[laneIdx].y : CONFIG.XPENG.GROUND_Y;

        const decTypes = [
            { key: 'OBS_CONES', w: 45, h: 55, yOff: -55, bgLayer: 1.0 },
            { key: 'OBS_WARNING_LIGHT', w: 40, h: 65, yOff: -65, bgLayer: 1.0 },
            { key: 'OBS_BARRIER_FULL', w: 65, h: 80, yOff: -80, bgLayer: 1.0 },
            { key: 'OBS_GATE_FULL', w: 70, h: 85, yOff: -85, bgLayer: 0.9 },
            { key: 'OBS_HIGH_ARCADE', w: 75, h: 130, yOff: -130, bgLayer: 0.85 },
            { key: 'OBS_HIGH_GLASS', w: 70, h: 120, yOff: -120, bgLayer: 0.85 },
            { key: 'OBS_HIGH_ICE', w: 75, h: 130, yOff: -130, bgLayer: 0.8 },
            { key: 'OBS_HIGH_NEWS', w: 75, h: 140, yOff: -140, bgLayer: 0.8 },
            { key: 'OBS_HIGH_PIPES', w: 75, h: 135, yOff: -135, bgLayer: 0.85 },
            { key: 'OBS_HIGH_WALL', w: 65, h: 150, yOff: -150, bgLayer: 0.75 },
            { key: 'OBS_LOW_SERVERS', w: 95, h: 42, yOff: -42, bgLayer: 1.0 },
            { key: 'OBS_MACHINERY', w: 95, h: 100, yOff: -100, bgLayer: 0.9 },
            { key: 'OBS_WALL_FULL', w: 60, h: 120, yOff: -120, bgLayer: 0.7 },
            { key: 'OBS_SPIKE_FULL', w: 70, h: 40, yOff: -40, bgLayer: 1.0 }
        ];

        const d = decTypes[Math.floor(Math.random() * decTypes.length)];
        const yOff = laneIdx >= CONFIG.XPENG.LANES.length ? d.yOff * 0.6 : d.yOff;
        this.decorations.push({
            x: CONFIG.CANVAS_WIDTH + 100 + Math.random() * 300,
            y: ly + yOff,
            w: d.w, h: d.h,
            spriteKey: d.key, bgLayer: d.bgLayer,
            isBackground: laneIdx >= CONFIG.XPENG.LANES.length
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

        const car = assets.getSprite('UI_XPENG_CAR');
        if (car && car.image) {
            const carX = w - 350 + Math.sin(this._time * 0.5) * 5;
            const carY = CONFIG.XPENG.GROUND_Y - 100;
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.drawImage(car.image, carX, carY, 320, 170);
            ctx.restore();
        }

        const gy = CONFIG.XPENG.GROUND_Y;
        const roadGrad = ctx.createLinearGradient(0, 500, 0, gy + 50);
        roadGrad.addColorStop(0, 'rgba(20,20,40,0)');
        roadGrad.addColorStop(0.4, 'rgba(30,30,60,0.6)');
        roadGrad.addColorStop(1, 'rgba(15,15,30,0.95)');
        ctx.fillStyle = roadGrad;
        ctx.fillRect(0, 500, w, gy + 100 - 500);

        for (const dec of this.decorations.filter(d => d.isBackground)) {
            const sp = assets.getSprite(dec.spriteKey);
            if (sp && sp.image) {
                ctx.save();
                ctx.globalAlpha = 0.5 * dec.bgLayer;
                ctx.drawImage(sp.image, dec.x, dec.y, dec.w * 0.7, dec.h * 0.7);
                ctx.restore();
            }
        }

        for (let li = 0; li < CONFIG.XPENG.LANES.length; li++) {
            const lane = CONFIG.XPENG.LANES[li];
            const ly = lane.y + lane.h;
            const isActive = this.currentLane === li;

            ctx.fillStyle = `rgba(50,50,80,${0.5 + li*0.1})`;
            ctx.fillRect(0, ly - 6, w, 10);

            ctx.strokeStyle = isActive ? 'rgba(255,180,0,0.5)' : `rgba(255,140,0,${0.12 + li*0.08})`;
            ctx.lineWidth = isActive ? 3 : (2 + li * 0.5);
            ctx.setLineDash([25, 20]);
            ctx.lineDashOffset = -this._roadMarkOffset;
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(w, ly);
            ctx.stroke();
            ctx.setLineDash([]);

            if (isActive) {
                ctx.save();
                ctx.shadowColor = '#ffb400';
                ctx.shadowBlur = 15;
                ctx.strokeStyle = 'rgba(255,180,0,0.6)';
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

        for (const dec of this.decorations.filter(d => !d.isBackground)) {
            const sp = assets.getSprite(dec.spriteKey);
            if (sp && sp.image) {
                ctx.drawImage(sp.image, dec.x, dec.y, dec.w, dec.h);
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

        this.hud.render(ctx, this.stamina, CONFIG.PLAYER.MAX_STAMINA, 'xpeng');

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
        ctx.font = 'bold 28px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`剩余时间: ${mins}:${secs.toString().padStart(2,'0')}`, w/2, 55);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(w - 280, 80, 250, 40);
        ctx.fillStyle = '#ffa500';
        ctx.font = 'bold 20px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`速度: ${Math.floor(this.speed)} px/s`, w - 155, 108);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(30, h - 90, 260, 70);
        ctx.fillStyle = '#ccc';
        ctx.font = '16px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText('空格/W/↑: 跳跃', 45, h - 65);
        ctx.fillText('S/↓: 下蹲躲高障碍', 45, h - 42);
        ctx.fillText('A/D ←/→: 切换车道', 45, h - 19);
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

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(100,0,0,0.3)';
            ctx.fillRect(0, 0, w, h);
        }
    }
}
