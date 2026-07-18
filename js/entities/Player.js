// 玩家角色
class Player extends Entity {
    constructor(x, y, gender = 'male') {
        super(x, y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT);
        this.gender = gender;
        this.state = 'idle';
        this.prevState = 'idle';
        this.onGround = false;
        this.canDoubleJump = true;
        this.stamina = CONFIG.PLAYER.MAX_STAMINA;
        this.facingRight = true;
        this.crouching = false;

        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.15;

        this.invincibleTimer = 0;
    }

    jump() {
        if (this.onGround) {
            this.vy = CONFIG.PLAYER.JUMP_FORCE;
            this.onGround = false;
            this.canDoubleJump = true;
            this.state = 'jump';
            this.animFrame = 0;
            return 'jump';
        } else if (this.canDoubleJump) {
            this.vy = CONFIG.PLAYER.DOUBLE_JUMP_FORCE;
            this.canDoubleJump = false;
            this.state = 'jump';
            this.animFrame = 0;
            return 'doubleJump';
        }
        return null;
    }

    crouch(active) {
        this.crouching = active;
        if (active && this.onGround) {
            this.state = 'crouch';
            this.h = CONFIG.PLAYER.HEIGHT * 0.6;
            this.animFrame = 0;
        } else if (!active && this.state === 'crouch') {
            this.h = CONFIG.PLAYER.HEIGHT;
            this.state = this.onGround ? 'idle' : 'airborne';
        }
    }

    applyGravity(dt) {
        this.vy += CONFIG.GRAVITY * dt;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
    }

    land() {
        this.onGround = true;
        this.canDoubleJump = true;
        this.vy = 0;
        this.state = 'landing';
        this.animFrame = 0;
    }

    takeDamage(amount = 10) {
        if (this.invincibleTimer > 0) return false;
        this.stamina -= amount;
        if (this.stamina < 0) this.stamina = 0;
        this.invincibleTimer = 1.0;
        this.state = 'hurt';
        this.animFrame = 0;
        return true;
    }

    die() {
        this.state = 'death';
        this.animFrame = 0;
        this.vx = 0;
    }

    recoverStamina(amount) {
        this.stamina = Math.min(this.stamina + amount, CONFIG.PLAYER.MAX_STAMINA);
    }

    _resolveAnimName() {
        const g = this.gender;
        const moving = Math.abs(this.vx) > 10;
        switch (this.state) {
            case 'idle':     return 'idle';
            case 'run':      return this.facingRight ? 'run_right' : 'run_left';
            case 'jump':     return 'jump';
            case 'airborne': return 'airborne';
            case 'landing':  return 'landing';
            case 'crouch':   return moving ? 'crouch_walk' : 'crouch';
            case 'hurt':     return 'hurt';
            case 'knockback':return 'knockback';
            case 'death':    return 'death';
            case 'pickup':   return 'pickup';
            case 'operate':  return 'operate';
            case 'victory':  return 'victory';
            default:         return 'idle';
        }
    }

    update(dt) {
        super.update(dt);

        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;

        const moving = Math.abs(this.vx) > 10;

        // 状态自动机：根据物理状态修正动画
        if (this.state !== 'death' && this.state !== 'hurt' && this.state !== 'victory' && this.state !== 'operate' && this.state !== 'pickup') {
            if (!this.onGround) {
                if (this.vy < 0) {
                    this.state = (this.state === 'jump' && this.animFrame < 2) ? 'jump' : 'airborne';
                } else {
                    this.state = 'airborne';
                }
            } else if (this.state === 'airborne' || this.state === 'jump') {
                this.state = 'landing';
                this.animFrame = 0;
            } else if (this.state === 'landing') {
                const info = window.Game?.assets?.getAnimInfo(this.gender, 'landing');
                const fc = info?.frames || 3;
                if (this.animFrame >= fc - 1) {
                    this.state = this.crouching ? 'crouch' : (moving ? 'run' : 'idle');
                    this.animFrame = 0;
                }
            } else if (this.crouching) {
                this.state = moving ? 'crouch' : 'crouch';
            } else {
                this.state = moving ? 'run' : 'idle';
            }
        }

        // 获取当前动画信息
        const animName = this._resolveAnimName();
        const info = window.Game?.assets?.getAnimInfo(this.gender, animName);
        const frameCount = info?.frames || 4;

        // 动画速度
        switch (this.state) {
            case 'idle':     this.animSpeed = 0.2;  break;
            case 'run':      this.animSpeed = 0.1;  break;
            case 'jump':     this.animSpeed = 0.12; break;
            case 'airborne': this.animSpeed = 0.2;  break;
            case 'landing':  this.animSpeed = 0.1;  break;
            case 'crouch':   this.animSpeed = moving ? 0.12 : 0.3; break;
            case 'hurt':     this.animSpeed = 0.15; break;
            case 'death':    this.animSpeed = 0.2;  break;
            default:         this.animSpeed = 0.15; break;
        }

        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame++;
            if (this.state === 'death' || this.state === 'hurt' || this.state === 'pickup' || this.state === 'operate') {
                if (this.animFrame >= frameCount) this.animFrame = frameCount - 1;
            } else {
                if (this.animFrame >= frameCount) this.animFrame = 0;
            }
        }

        this.prevState = this.state;
    }

    render(renderer) {
        if (!this.visible) return;
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;

        const ctx = renderer.ctx;
        const assets = window.Game?.assets;
        const animName = this._resolveAnimName();

        // 角色精灵尺寸 80x72，需要缩放到PLAYER.WIDTH/HEIGHT
        const scale = this.h / 72;
        const drawW = 80 * scale;
        const drawH = 72 * scale;
        const drawX = this.x + (this.w - drawW) / 2;
        const drawY = this.y + this.h - drawH;

        // 对于run_left/run_right，sprite已经自带方向了；其他动画根据facingRight镜像
        let flipX = false;
        let finalAnim = animName;
        if (animName !== 'run_left' && animName !== 'run_right') {
            flipX = !this.facingRight;
        }

        if (assets && assets.charAnims?.[this.gender]?.[animName]) {
            assets.drawCharacter(ctx, this.gender, finalAnim, drawX, drawY, this.animFrame, scale, flipX);
        } else {
            const color = this.gender === 'male' ? '#4af' : '#f4a';
            renderer.drawRect(this.x, this.y, this.w, this.h, color);
            ctx.fillStyle = '#fff';
            ctx.font = '12px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText(this.state, this.x + this.w / 2, this.y + this.h / 2);
        }
    }
}
