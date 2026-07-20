class RangedVirus extends Entity {
    constructor(x, y) {
        const size = CONFIG.TENCENT.RANGED_VIRUS_SIZE;
        super(x, y, size, size);
        this.spawnX = x;
        this.spawnY = y;
        this.speed = CONFIG.TENCENT.RANGED_VIRUS_SPEED;
        this.vx = this.speed;
        this.vy = 0;
        this.onGround = false;
        this.facingRight = true;
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.2;
        this.shootCooldown = 1.0;
        this.shootInterval = 1.0;
        this.projectiles = [];
        this.dead = false;
        this.deadTimer = 0;
        this.stompable = true;
        this.patrolLeft = x - 120;
        this.patrolRight = x + 120;
        this.attacking = false;
        this.attackTimer = 0;
    }

    update(dt, player, platforms, cameraX = 0) {
        if (this.dead) {
            this.deadTimer += dt;
            this.vy += CONFIG.GRAVITY * dt * 0.5;
            this.y += this.vy * dt;
            return;
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt, platforms, cameraX);
            if (p.dead || p.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inRange = dist < 1000 && Math.abs(dy) < 400;

        if (inRange) {
            this.attacking = true;
            this.attackTimer += dt;
            this.vx = 0;
            this.facingRight = dx > 0;
            this.shootCooldown -= dt;
            if (this.shootCooldown <= 0) {
                this._shoot(player);
                this.shootCooldown = this.shootInterval;
            }
        } else {
            this.attacking = false;
            this.attackTimer = 0;
            if (this.x <= this.patrolLeft) {
                this.facingRight = true;
                this.vx = this.speed;
            } else if (this.x >= this.patrolRight) {
                this.facingRight = false;
                this.vx = -this.speed;
            }
            this.shootCooldown = Math.max(this.shootCooldown, 0.5);
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
                    if (!this.attacking) this.vx = -this.speed;
                } else if (this.vx < 0 && prevX >= plat.x + plat.w - 2) {
                    this.x = plat.x + plat.w;
                    this.facingRight = true;
                    if (!this.attacking) this.vx = this.speed;
                }
            }
        }

        if (this.x < this.patrolLeft) { this.x = this.patrolLeft; this.facingRight = true; if (!this.attacking) this.vx = this.speed; }
        if (this.x > this.patrolRight) { this.x = this.patrolRight; this.facingRight = false; if (!this.attacking) this.vx = -this.speed; }

        if (this.y > CONFIG.TENCENT.DEATH_Y) {
            this.x = this.spawnX;
            this.y = this.spawnY;
            this.vx = this.speed;
            this.vy = 0;
            this.dead = false;
            this.deadTimer = 0;
            this.projectiles = [];
        }

        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    _shoot(player) {
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const dx = player.x + player.w / 2 - cx;
        const dy = player.y + player.h / 2 - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const spd = CONFIG.PLAYER.MOVE_SPEED;
        const proj = new Projectile(cx, cy, (dx / dist) * spd, (dy / dist) * spd, 'enemy');
        this.projectiles.push(proj);
    }

    stomp() {
        if (this.dead) return;
        this.dead = true;
        this.deadTimer = 0;
        this.vy = -450;
        this.vx = 0;
        this.projectiles = [];
    }

    getHitbox() {
        return { x: this.x + 6, y: this.y + 6, w: this.w - 12, h: this.h - 12 };
    }

    getStompHitbox() {
        return { x: this.x + 8, y: this.y, w: this.w - 16, h: 18 };
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const sx = this.x;
        const sy = this.y;
        const s = this.w;

        for (const p of this.projectiles) {
            p.render(renderer);
        }

        ctx.save();
        if (this.dead) {
            const t = Math.min(this.deadTimer / 0.6, 1);
            ctx.globalAlpha = 1 - t;
            ctx.translate(sx + s / 2, sy + s / 2);
            ctx.scale(1 - t * 0.3, 1 - t * 0.6);
            ctx.rotate(t * 1.5);
            ctx.translate(-s / 2, -s / 2);
        }

        if (this.attacking) {
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 15;
        }

        ctx.fillStyle = this.attacking ? '#cc2222' : '#992222';
        ctx.fillRect(sx + 4, sy + 8, s - 8, s - 16);

        ctx.fillStyle = '#771111';
        ctx.fillRect(sx + 8, sy + 2, s - 16, 12);

        const barrelX = this.facingRight ? sx + s - 4 : sx - 10;
        ctx.fillStyle = '#550000';
        ctx.fillRect(barrelX, sy + s / 2 - 4, 18, 8);

        ctx.fillStyle = '#ff0000';
        const eyeX = this.facingRight ? sx + s - 18 : sx + 6;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = this.attacking ? 10 : 4;
        ctx.beginPath();
        ctx.arc(eyeX + 6, sy + 16, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff6666';
        const legOff = Math.sin(this.animFrame * Math.PI / 2) * 3;
        ctx.fillRect(sx + 10, sy + s - 10 + legOff, 8, 10);
        ctx.fillRect(sx + s - 18, sy + s - 10 - legOff, 8, 10);

        ctx.restore();

        if (this.attacking && this.shootCooldown < 0.5) {
            ctx.fillStyle = 'rgba(255,255,0,' + (0.5 + Math.sin(Date.now() / 50) * 0.5) + ')';
            ctx.font = 'bold 16px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('!', sx + s / 2, sy - 5);
        }
    }
}
