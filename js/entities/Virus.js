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
    }

    update(dt, player, platforms) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.detectRange) {
            this.agitated = true;
            if (dx > 10) {
                this.vx = this.speed;
                this.facingRight = true;
            } else if (dx < -10) {
                this.vx = -this.speed;
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
            this.vx = this.patrolDir * this.speed * 0.3;
            this.facingRight = this.patrolDir > 0;
        }

        this.jumpTimer -= dt;
        if (this.jumpTimer <= 0 && this.onGround) {
            if (this.agitated) {
                this.vy = this.jumpForce;
                this.onGround = false;
                this.jumpTimer = this.jumpInterval * (0.6 + Math.random() * 0.4);
            } else {
                if (Math.random() < 0.3) {
                    this.vy = this.jumpForce * 0.7;
                    this.onGround = false;
                }
                this.jumpTimer = this.jumpInterval * (1 + Math.random());
            }
        }

        this.vy += CONFIG.GRAVITY * dt;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        this.onGround = false;
        for (const plat of platforms) {
            if (CollisionSystem.platformCollision(this, plat)) {
                this.y = plat.y - this.h;
                this.vy = 0;
                this.onGround = true;
            }
        }

        if (this.x < 0) { this.x = 0; this.patrolDir = 1; this.facingRight = true; }
        if (this.x > CONFIG.TENCENT.LEVEL_LENGTH - this.w) {
            this.x = CONFIG.TENCENT.LEVEL_LENGTH - this.w;
            this.patrolDir = -1;
            this.facingRight = false;
        }

        if (this.y > CONFIG.TENCENT.DEATH_Y) {
            this.x = this.spawnX + (Math.random() - 0.5) * 200;
            this.y = this.spawnY - Math.random() * 100;
            this.vx = 0;
            this.vy = 0;
            this.agitated = false;
        }

        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const sx = this.x;
        const sy = this.y;
        const s = this.w;

        ctx.save();

        if (this.agitated) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20 + Math.sin(Date.now() / 100) * 10;
        }

        const virusImg = window.Game?.assets?.getSprite?.('ENEMY_BOT');
        if (virusImg && virusImg.image) {
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
            ctx.fillStyle = this.agitated ? '#ff3333' : '#9933ff';
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

        ctx.restore();

        if (this.agitated) {
            ctx.fillStyle = 'rgba(255,0,0,0.8)';
            ctx.font = 'bold 14px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('!', sx + s/2, sy - 10);
        }
    }

    getHitbox() {
        return { x: this.x + 8, y: this.y + 8, w: this.w - 16, h: this.h - 16 };
    }
}
