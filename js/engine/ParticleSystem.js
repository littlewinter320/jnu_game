// 粒子特效系统
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // 发射粒子
    emit(x, y, options = {}) {
        const {
            count = 10,
            color = '#fff',
            speedMin = 50,
            speedMax = 200,
            angleMin = 0,
            angleMax = Math.PI * 2,
            sizeMin = 2,
            sizeMax = 6,
            lifeMin = 0.3,
            lifeMax = 1.0,
            gravity = 0,
            shape = 'circle'  // circle, square, star
        } = options;

        for (let i = 0; i < count; i++) {
            const angle = angleMin + Math.random() * (angleMax - angleMin);
            const speed = speedMin + Math.random() * (speedMax - speedMin);
            const life = lifeMin + Math.random() * (lifeMax - lifeMin);
            const size = sizeMin + Math.random() * (sizeMax - sizeMin);

            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                life,
                maxLife: life,
                color,
                gravity,
                shape,
                alpha: 1
            });
        }

        // 限制粒子总数
        if (this.particles.length > CONFIG.PARTICLES.MAX_COUNT) {
            this.particles.splice(0, this.particles.length - CONFIG.PARTICLES.MAX_COUNT);
        }
    }

    // 跳跃尘土
    emitJump(x, y) {
        this.emit(x, y, {
            count: CONFIG.PARTICLES.JUMP_COUNT,
            color: '#c8a060',
            speedMin: 30, speedMax: 120,
            angleMin: -Math.PI, angleMax: 0,
            sizeMin: 2, sizeMax: 5,
            lifeMin: 0.2, lifeMax: 0.5,
            gravity: 200,
            shape: 'circle'
        });
    }

    // 收集道具星光
    emitCollect(x, y, color = '#ffd700') {
        this.emit(x, y, {
            count: CONFIG.PARTICLES.COLLECT_COUNT,
            color,
            speedMin: 80, speedMax: 250,
            sizeMin: 3, sizeMax: 8,
            lifeMin: 0.3, lifeMax: 0.8,
            gravity: -100,
            shape: 'star'
        });
    }

    // 爆炸
    emitExplosion(x, y) {
        this.emit(x, y, {
            count: CONFIG.PARTICLES.EXPLOSION_COUNT,
            color: '#f44',
            speedMin: 100, speedMax: 400,
            sizeMin: 3, sizeMax: 10,
            lifeMin: 0.3, lifeMax: 1.0,
            gravity: 300,
            shape: 'square'
        });
        // 二次黄色粒子
        this.emit(x, y, {
            count: CONFIG.PARTICLES.EXPLOSION_COUNT / 2,
            color: '#ff0',
            speedMin: 50, speedMax: 200,
            sizeMin: 2, sizeMax: 6,
            lifeMin: 0.2, lifeMax: 0.6,
            gravity: 100,
            shape: 'circle'
        });
    }

    // 体力低时边缘红色闪烁粒子
    emitLowStamina() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch (side) {
            case 0: x = Math.random() * CONFIG.CANVAS_WIDTH; y = 0; break;
            case 1: x = CONFIG.CANVAS_WIDTH; y = Math.random() * CONFIG.CANVAS_HEIGHT; break;
            case 2: x = Math.random() * CONFIG.CANVAS_WIDTH; y = CONFIG.CANVAS_HEIGHT; break;
            case 3: x = 0; y = Math.random() * CONFIG.CANVAS_HEIGHT; break;
        }
        this.emit(x, y, {
            count: CONFIG.PARTICLES.LOW_STAMINA_COUNT,
            color: '#f22',
            speedMin: 20, speedMax: 60,
            sizeMin: 4, sizeMax: 10,
            lifeMin: 0.5, lifeMax: 1.0,
            shape: 'circle'
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / p.maxLife);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;

            switch (p.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                    break;
                case 'star':
                    this._drawStar(ctx, p.x, p.y, p.size);
                    break;
            }
            ctx.restore();
        }
    }

    _drawStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    clear() {
        this.particles = [];
    }
}
