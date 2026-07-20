class Projectile extends Entity {
    constructor(x, y, vx, vy, owner = 'enemy') {
        super(x - 8, y - 8, 16, 16);
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.life = CONFIG.TENCENT.PROJECTILE_LIFE;
        this.dead = false;
        this.radius = 8;
    }

    update(dt, platforms, cameraX = 0) {
        if (this.dead) return;
        this.life -= dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        const screenX = this.x - cameraX;
        if (screenX < -50 || screenX > CONFIG.CANVAS_WIDTH + 50 || this.y < -50 || this.y > CONFIG.CANVAS_HEIGHT + 50) {
            this.dead = true;
            return;
        }

        if (this.life <= 0) {
            this.dead = true;
            return;
        }

        for (const plat of platforms) {
            if (CollisionSystem.platformCollision(this, plat)) {
                this.dead = true;
                return;
            }
        }
    }

    getHitbox() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    render(renderer) {
        const ctx = renderer.ctx;
        if (this.dead) return;
        ctx.save();
        ctx.shadowColor = '#ff2222';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffaaaa';
        ctx.beginPath();
        ctx.arc(this.x + this.radius - 2, this.y + this.radius - 2, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
