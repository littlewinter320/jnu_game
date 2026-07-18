// 玩家角色
class Player extends Entity {
    constructor(x, y, gender = 'male') {
        super(x, y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT);
        this.gender = gender;
        this.state = 'idle';      // idle, run, jump, crouch, death
        this.onGround = false;
        this.canDoubleJump = true;
        this.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.facingRight = true;

        // 动画
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.1;  // 每帧间隔（秒）

        // 无敌时间（被击后短暂无暂）
        this.invincibleTimer = 0;
    }

    // 跳跃
    jump() {
        if (this.onGround) {
            this.vy = CONFIG.PLAYER.JUMP_FORCE;
            this.onGround = false;
            this.canDoubleJump = true;
            this.state = 'jump';
            return 'jump';
        } else if (this.canDoubleJump) {
            this.vy = CONFIG.PLAYER.DOUBLE_JUMP_FORCE;
            this.canDoubleJump = false;
            this.state = 'jump';
            return 'doubleJump';
        }
        return null;
    }

    // 下蹲
    crouch(active) {
        if (active && this.onGround) {
            this.state = 'crouch';
            this.h = CONFIG.PLAYER.HEIGHT * 0.6;
        } else if (!active && this.state === 'crouch') {
            this.state = this.onGround ? 'run' : 'jump';
            this.h = CONFIG.PLAYER.HEIGHT;
        }
    }

    // 应用重力
    applyGravity(dt) {
        this.vy += CONFIG.GRAVITY * dt;
        if (this.vy > CONFIG.MAX_FALL_SPEED) {
            this.vy = CONFIG.MAX_FALL_SPEED;
        }
    }

    // 着地
    land() {
        this.onGround = true;
        this.canDoubleJump = true;
        this.vy = 0;
        if (this.state === 'jump') {
            this.state = 'run';
        }
    }

    // 受伤
    takeDamage(amount = 10) {
        if (this.invincibleTimer > 0) return false;
        this.stamina -= amount;
        if (this.stamina < 0) this.stamina = 0;
        this.invincibleTimer = 1.0;  // 1秒无敌
        return true;
    }

    // 恢复体力
    recoverStamina(amount) {
        this.stamina = Math.min(this.stamina + amount, CONFIG.PLAYER.MAX_STAMINA);
    }

    update(dt) {
        super.update(dt);

        // 更新无敌时间
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }

        // 更新动画帧
        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame++;
        }

        // 根据状态设置动画速度
        switch (this.state) {
            case 'idle':
                this.animSpeed = 0.2;
                if (this.animFrame >= 4) this.animFrame = 0;
                break;
            case 'run':
                this.animSpeed = 0.08;
                if (this.animFrame >= 8) this.animFrame = 0;
                break;
            case 'jump':
                this.animSpeed = 0.15;
                if (this.animFrame >= 2) this.animFrame = 0;
                break;
            case 'crouch':
                this.animSpeed = 0.2;
                if (this.animFrame >= 2) this.animFrame = 0;
                break;
        }
    }

    render(renderer) {
        if (!this.visible) return;

        // 无敌时闪烁
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
            return;
        }

        const ctx = renderer.ctx;
        const imgKey = `${this.gender.toUpperCase()}_${this.state.toUpperCase()}`;
        const image = renderer.images?.[imgKey];

        if (image) {
            // 使用贴图（精灵图）
            const frameW = image.width / this._getFrameCount();
            const frameH = image.height;
            const sx = this.animFrame * frameW;
            renderer.drawImage(image, sx, 0, frameW, frameH, this.x, this.y, this.w, this.h);
        } else {
            // 占位矩形（贴图未加载时）
            const color = this.gender === 'male' ? '#4af' : '#f4a';
            renderer.drawRect(this.x, this.y, this.w, this.h, color);
            // 绘制状态文字
            ctx.fillStyle = '#fff';
            ctx.font = '12px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText(this.state, this.x + this.w / 2, this.y + this.h / 2);
        }
    }

    _getFrameCount() {
        switch (this.state) {
            case 'idle': return 4;
            case 'run': return 8;
            case 'jump': return 2;
            case 'crouch': return 2;
            default: return 1;
        }
    }
}
