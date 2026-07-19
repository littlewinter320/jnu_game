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
        this.pickupTimer = 0;
        this.hurtTimer = 0;

        this._refreshCharInfo();
    }

    _refreshCharInfo() {
        this._charInfo = this._getCharInfo(this.gender);
    }

    _getCharInfo(gender) {
        const info = window.Game?.assets?.getAnimInfo?.(gender, 'idle');
        const fw = info?.frameWidth || 92;
        const fh = info?.frameHeight || 79;
        // 让渲染高度接近碰撞盒高度(110)，sprite略大一些更自然
        const scale = CONFIG.PLAYER.HEIGHT / fh * 1.15;
        return { w: fw * scale, h: fh * scale, fw, fh, scale };
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
            this.h = this._charInfo.h * 0.6;
            this.animFrame = 0;
        } else if (!active && this.state === 'crouch') {
            this.h = this._charInfo.h;
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
        this.h = this._charInfo.h;
    }

    takeDamage(amount = 10) {
        if (this.invincibleTimer > 0) return false;
        this.stamina -= amount;
        if (this.stamina < 0) this.stamina = 0;
        this.invincibleTimer = 1.0;
        this.hurtTimer = 0.4;
        this.state = 'hurt';
        this.animFrame = 0;
        return true;
    }

    die() {
        this.state = 'death';
        this.animFrame = 0;
        this.vx = 0;
        this.vy = 0;
    }

    recoverStamina(amount) {
        this.stamina = Math.min(this.stamina + amount, CONFIG.PLAYER.MAX_STAMINA);
    }

    playPickup() {
        this.state = 'pickup';
        this.animFrame = 0;
        this.pickupTimer = 0.5;
        this.vx = 0;
    }

    playVictory() {
        this.state = 'victory';
        this.animFrame = 0;
        this.vx = 0;
    }

    _resolveAnimName() {
        switch (this.state) {
            case 'idle':     return 'idle';
            case 'run':      return this.facingRight ? 'run_right' : 'run_left';
            case 'jump':     return 'jump_start';
            case 'airborne': return 'airborne';
            case 'landing':  return 'landing';
            case 'crouch':   return this.crouching && Math.abs(this.vx) > 10 ? 'crouch_walk' : 'crouch';
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
        if (this.hurtTimer > 0) this.hurtTimer -= dt;
        if (this.pickupTimer > 0) {
            this.pickupTimer -= dt;
            if (this.pickupTimer <= 0) this.state = 'idle';
        }

        const moving = Math.abs(this.vx) > 10;

        if (this.state !== 'death' && this.state !== 'hurt' && this.state !== 'victory' &&
            this.state !== 'operate' && this.state !== 'pickup') {
            if (!this.onGround) {
                if (this.vy < 0) {
                    this.state = (this.state === 'jump') ? 'jump' : 'airborne';
                } else {
                    this.state = 'airborne';
                }
            } else if (this.state === 'airborne' || this.state === 'jump') {
                this.state = 'landing';
                this.animFrame = 0;
            } else if (this.state === 'landing') {
                const info = window.Game?.assets?.getAnimInfo?.(this.gender, 'landing');
                const fc = info?.frames?.length || 4;
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

        const animName = this._resolveAnimName();
        const info = window.Game?.assets?.getAnimInfo?.(this.gender, animName);
        const frameCount = info?.frames?.length || 4;
        const loop = info?.loop !== false;

        switch (this.state) {
            case 'idle':     this.animSpeed = 0.2;  break;
            case 'run':      this.animSpeed = 0.08; break;
            case 'jump':     this.animSpeed = 0.1;  break;
            case 'airborne': this.animSpeed = 0.15; break;
            case 'landing':  this.animSpeed = 0.08; break;
            case 'crouch':   this.animSpeed = moving ? 0.1 : 0.25; break;
            case 'hurt':     this.animSpeed = 0.12; break;
            case 'death':    this.animSpeed = 0.15; break;
            case 'pickup':   this.animSpeed = 0.12; break;
            case 'victory':  this.animSpeed = 0.15; break;
            default:         this.animSpeed = 0.12; break;
        }

        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame++;
            if (!loop) {
                if (this.animFrame >= frameCount) this.animFrame = frameCount - 1;
            } else {
                if (this.animFrame >= frameCount) this.animFrame = 0;
            }
        }

        this.prevState = this.state;
    }

    updateAnimation(dt) {
        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
        if (this.hurtTimer > 0) this.hurtTimer -= dt;
        if (this.pickupTimer > 0) {
            this.pickupTimer -= dt;
            if (this.pickupTimer <= 0) this.state = 'idle';
        }

        const animName = this._resolveAnimName();
        const info = window.Game?.assets?.getAnimInfo?.(this.gender, animName);
        const frameCount = info?.frames?.length || 4;
        const loop = info?.loop !== false;

        const moving = Math.abs(this.vx) > 10;
        switch (this.state) {
            case 'idle':     this.animSpeed = 0.2;  break;
            case 'run':      this.animSpeed = 0.08; break;
            case 'jump':     this.animSpeed = 0.1;  break;
            case 'airborne': this.animSpeed = 0.15; break;
            case 'landing':  this.animSpeed = 0.08; break;
            case 'crouch':   this.animSpeed = moving ? 0.1 : 0.25; break;
            case 'hurt':     this.animSpeed = 0.12; break;
            case 'death':    this.animSpeed = 0.15; break;
            case 'pickup':   this.animSpeed = 0.12; break;
            case 'victory':  this.animSpeed = 0.15; break;
            default:         this.animSpeed = 0.12; break;
        }

        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame++;
            if (!loop) {
                if (this.animFrame >= frameCount) this.animFrame = frameCount - 1;
            } else {
                if (this.animFrame >= frameCount) this.animFrame = 0;
            }
        }

        this.prevState = this.state;
    }

    render(renderer) {
        if (!this.visible) return;
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 12) % 2 === 0) return;

        const ctx = renderer.ctx;
        const assets = window.Game?.assets;
        const animName = this._resolveAnimName();
        const info = assets?.getAnimInfo?.(this.gender, animName);

        const scale = this._charInfo.scale;
        const fw = info?.frameWidth || this._charInfo.fw;
        const fh = info?.frameHeight || this._charInfo.fh;
        const drawW = fw * scale;
        const drawH = fh * scale;

        const crouchOffset = this.crouching && this.onGround ? drawH * 0.3 : 0;
        const drawX = this.x + (this.w - drawW) / 2;
        const drawY = this.y + this.h - drawH + crouchOffset;

        let flipX = false;
        if (animName !== 'run_left' && animName !== 'run_right') {
            flipX = !this.facingRight;
        } else if (animName === 'run_left') {
            flipX = true;
        }

        if (assets && assets.charAnims?.[this.gender]?.[animName]) {
            assets.drawCharacter(ctx, this.gender, animName, drawX, drawY, this.animFrame, scale, flipX);
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
