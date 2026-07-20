class Virus extends Entity {
    constructor(x, y) {
        const size = CONFIG.TENCENT.VIRUS_SIZE;
        super(x, y, size, size);
        this.spawnX = x;
        this.spawnY = y;
        this.speed = CONFIG.TENCENT.VIRUS_SPEED;
        this.jumpForce = CONFIG.TENCENT.VIRUS_JUMP_FORCE;
        this.detectRange = CONFIG.TENCENT.VIRUS_DETECT_RANGE;
        this.jumpInterval = CONFIG.TENCENT.VIRUS_JUMP_INTERVAL;
        this.jumpTimer = Math.random() * this.jumpInterval;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.facingRight = Math.random() > 0.5;
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.15;
        this.agitated = false;
        this.patrolDir = Math.random() > 0.5 ? 1 : -1;
        this.patrolTimer = Math.random() * 3;
        this.dead = false;
        this.deadTimer = 0;
        this.stompable = true;
        this.killedByStomp = false;
    }

    update(dt, player, platforms) {
        if (this.dead) {
            this.deadTimer += dt;
            this.vy += CONFIG.GRAVITY * dt * 0.5;
            this.y += this.vy * dt;
            this.x += this.vx * dt;
            return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const sameLevel = Math.abs(dy) < 200;

        if (dist < this.detectRange) {
            this.agitated = true;
            const spd = this.speed * 1.15;
            if (dx > 10) {
                this.vx = spd;
                this.facingRight = true;
            } else if (dx < -10) {
                this.vx = -spd;
                this.facingRight = false;
            } else {
                this.vx = 0;
            }
        } else {
            this.agitated = false;
            this.patrolTimer -= dt;
            if (this.patrolTimer <= 0) {
                this.patrolTimer = 2 + Math.random() * 3;
                this.patrolDir = Math.random() > 0.5 ? 1 : -1;
            }
            this.vx = this.patrolDir * this.speed * 0.35;
            this.facingRight = this.patrolDir > 0;
        }

        let platformAhead = false;
        let gapAhead = false;
        if (this.onGround && platforms) {
            const checkX = this.facingRight ? this.x + this.w + 15 : this.x - 15;
            const checkY = this.y + this.h + 20;
            for (const plat of platforms) {
                if (checkX >= plat.x && checkX <= plat.x + plat.w &&
                    checkY >= plat.y - 10 && checkY <= plat.y + 20) {
                    platformAhead = true;
                    break;
                }
            }
            const wallCheckX = this.facingRight ? this.x + this.w + 5 : this.x - 5;
            for (const plat of platforms) {
                if (wallCheckX >= plat.x && wallCheckX <= plat.x + plat.w &&
                    this.y + this.h > plat.y && this.y < plat.y + plat.h) {
                    platformAhead = true;
                    break;
                }
            }
            const belowX = this.facingRight ? this.x + this.w + 10 : this.x - 10;
            let hasGroundBelow = false;
            for (const plat of platforms) {
                if (belowX >= plat.x && belowX <= plat.x + plat.w &&
                    plat.y <= this.y + this.h + 30 && plat.y >= this.y + this.h - 5) {
                    hasGroundBelow = true;
                    break;
                }
            }
            if (!hasGroundBelow) gapAhead = true;
        }

        this.jumpTimer -= dt;
        if (this.jumpTimer <= 0 && this.onGround) {
            let shouldJump = false;
            if (this.agitated) {
                if (dy < -50 || gapAhead || (!platformAhead && dist < 400 && sameLevel) || Math.random() < 0.25) {
                    shouldJump = true;
                }
            } else {
                if (gapAhead) {
                    this.patrolDir *= -1;
                    this.facingRight = this.patrolDir > 0;
                    this.vx = this.patrolDir * this.speed * 0.35;
                } else if (Math.random() < 0.2) {
                    shouldJump = true;
                }
            }
            if (shouldJump) {
                this.vy = this.jumpForce;
                this.onGround = false;
                this.jumpTimer = this.jumpInterval * (0.5 + Math.random() * 0.5);
                if (!this.agitated) this.jumpTimer *= 1.5;
            } else {
                this.jumpTimer = 0.3;
            }
        }

        this.vy += CONFIG.GRAVITY * dt;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        this.onGround = false;
        for (const plat of platforms) {
            if (CollisionSystem.platformCollision(this, plat)) {
                if (this.vy > 0) {
                    this.y = plat.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                }
                const prevX = this.x - this.vx * dt;
                if (this.vx > 0 && prevX + this.w <= plat.x + 2) {
                    this.x = plat.x - this.w;
                    this.facingRight = false;
                    this.patrolDir = -1;
                    if (!this.agitated) this.vx = -this.speed * 0.35;
                    else this.vx = -this.speed * 1.15;
                } else if (this.vx < 0 && prevX >= plat.x + plat.w - 2) {
                    this.x = plat.x + plat.w;
                    this.facingRight = true;
                    this.patrolDir = 1;
                    if (!this.agitated) this.vx = this.speed * 0.35;
                    else this.vx = this.speed * 1.15;
                }
            }
        }

        if (this.x < 0) { this.x = 0; this.patrolDir = 1; this.facingRight = true; }
        if (this.x > CONFIG.TENCENT.LEVEL_LENGTH - this.w) {
            this.x = CONFIG.TENCENT.LEVEL_LENGTH - this.w;
            this.patrolDir = -1;
            this.facingRight = false;
        }

        if (this.y > CONFIG.TENCENT.DEATH_Y) {
            if (this.killedByStomp) {
                this.dead = true;
                this.deadTimer = 0.6;
            } else {
                this.x = this.spawnX + (Math.random() - 0.5) * 200;
                this.y = this.spawnY - Math.random() * 100;
                this.vx = 0;
                this.vy = 0;
                this.agitated = false;
                this.dead = false;
            }
        }

        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    stomp() {
        if (this.dead) return;
        this.dead = true;
        this.killedByStomp = true;
        this.deadTimer = 0;
        this.vy = -500;
        this.vx *= 0.3;
    }

    getHitbox() {
        return { x: this.x + 8, y: this.y + 8, w: this.w - 16, h: this.h - 16 };
    }

    getStompHitbox() {
        return { x: this.x + 10, y: this.y, w: this.w - 20, h: 22 };
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const sx = this.x;
        const sy = this.y;
        const s = this.w;

        ctx.save();

        if (this.dead) {
            const t = Math.min(this.deadTimer / 0.6, 1);
            ctx.globalAlpha = 1 - t;
            ctx.translate(sx + s / 2, sy + s / 2);
            ctx.rotate(t * 2);
            ctx.scale(1 + t * 0.3, 1 - t * 0.5);
            ctx.translate(-s / 2, -s / 2);
        }

        if (this.agitated && !this.dead) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20 + Math.sin(Date.now() / 100) * 10;
        }

        const virusImg = window.Game?.assets?.getSprite?.('ENEMY_BOT');
        if (virusImg && virusImg.image && !this.dead) {
            ctx.save();
            if (!this.facingRight) {
                ctx.translate(sx + s, sy);
                ctx.scale(-1, 1);
                ctx.drawImage(virusImg.image, 0, 0, s, s);
            } else {
                ctx.drawImage(virusImg.image, sx, sy, s, s);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = this.dead ? '#663366' : (this.agitated ? '#ff3333' : '#9933ff');
            ctx.beginPath();
            ctx.arc(sx + s/2, sy + s/2, s/2 - 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            const eyeOff = this.facingRight ? 5 : -5;
            ctx.beginPath();
            ctx.arc(sx + s/2 + eyeOff - 8, sy + s/2 - 5, 6, 0, Math.PI * 2);
            ctx.arc(sx + s/2 + eyeOff + 8, sy + s/2 - 5, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this.agitated ? '#ff0000' : '#000';
            ctx.beginPath();
            ctx.arc(sx + s/2 + eyeOff - 6, sy + s/2 - 5, 3, 0, Math.PI * 2);
            ctx.arc(sx + s/2 + eyeOff + 10, sy + s/2 - 5, 3, 0, Math.PI * 2);
            ctx.fill();

            if (!this.dead) {
                const spikeCount = 8;
                ctx.strokeStyle = this.agitated ? '#ff6666' : '#cc66ff';
                ctx.lineWidth = 3;
                for (let i = 0; i < spikeCount; i++) {
                    const angle = (i / spikeCount) * Math.PI * 2 + this.animFrame * 0.3;
                    const innerR = s/2 - 4;
                    const outerR = s/2 + 6 + Math.sin(this.animFrame + i) * 3;
                    ctx.beginPath();
                    ctx.moveTo(sx + s/2 + Math.cos(angle) * innerR, sy + s/2 + Math.sin(angle) * innerR);
                    ctx.lineTo(sx + s/2 + Math.cos(angle) * outerR, sy + s/2 + Math.sin(angle) * outerR);
                    ctx.stroke();
                }
            }
        }

        ctx.restore();

        if (this.agitated && !this.dead) {
            ctx.fillStyle = 'rgba(255,0,0,0.8)';
            ctx.font = 'bold 16px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('!', sx + s/2, sy - 8);
        }
    }
}
