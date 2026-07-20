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
        this.landingTimer = 0;
        this.deathTimer = 0;

        this.shieldTimer = 0;
        this.shieldActive = false;
        this.shieldType = 'none';

        this._refreshCharInfo();
    }

    _refreshCharInfo() {
        this._charInfo = this._getCharInfo(this.gender);
    }

    _getCharInfo(gender) {
        const info = window.Game?.assets?.getAnimInfo?.(gender, 'idle');
        const fw = info?.frameWidth || 92;
        const fh = info?.frameHeight || 79;
        const scale = CONFIG.PLAYER.HEIGHT / fh;
        return { w: fw * scale, h: fh * scale, fw, fh, scale };
    }

    jump() {
        if (this.state === 'death') return null;
        if (this.onGround) {
            this.vy = CONFIG.PLAYER.JUMP_FORCE;
            this.onGround = false;
            this.canDoubleJump = true;
            this.state = 'jump';
            this.animFrame = 0;
            this.animTimer = 0;
            return 'jump';
        } else if (this.canDoubleJump) {
            this.vy = CONFIG.PLAYER.DOUBLE_JUMP_FORCE;
            this.canDoubleJump = false;
            this.state = 'jump';
            this.animFrame = 0;
            this.animTimer = 0;
            return 'doubleJump';
        }
        return null;
    }

    crouch(active) {
        if (this.state === 'death') return;
        this.crouching = active;
        const fullH = CONFIG.PLAYER.HEIGHT;
        if (active && this.onGround) {
            this.state = 'crouch';
            this.h = fullH * 0.6;
            this.animFrame = 0;
            this.animTimer = 0;
        } else if (!active && this.state === 'crouch') {
            this.h = fullH;
            this.state = this.onGround ? 'idle' : 'airborne';
        }
    }

    applyGravity(dt) {
        if (this.state === 'death') return;
        this.vy += CONFIG.GRAVITY * dt;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
    }

    land() {
        this.onGround = true;
        this.canDoubleJump = true;
        this.vy = 0;
        this.state = 'landing';
        this.animFrame = 0;
        this.animTimer = 0;
        this.landingTimer = 0;
        this.h = CONFIG.PLAYER.HEIGHT;
    }

    takeDamage(amount = 10) {
        if (this.state === 'death') return false;
        if (this.invincibleTimer > 0) return false;
        if (this.shieldActive && this.shieldTimer > 0) {
            this.blockDamage();
            return 'blocked';
        }
        this.stamina -= amount;
        if (this.stamina < 0) this.stamina = 0;
        this.invincibleTimer = 1.0;
        this.hurtTimer = 0.4;
        this.state = 'hurt';
        this.animFrame = 0;
        this.animTimer = 0;
        return true;
    }

    stompBounce() {
        this.vy = -650;
        this.onGround = false;
        this.canDoubleJump = true;
        this.state = 'jump';
        this.animFrame = 0;
        this.animTimer = 0;
    }

    activateShield(type = 'tencent', duration = 0) {
        this.shieldActive = true;
        this.shieldType = type;
        if (type === 'xpeng') {
            this.shieldTimer = duration;
        } else {
            this.shieldTimer = Infinity;
        }
    }

    blockDamage() {
        if (this.state === 'death') return false;
        if (this.invincibleTimer > 0) return true;
        if (this.shieldActive && this.shieldTimer > 0) {
            if (this.shieldType === 'tencent') {
                this.shieldActive = false;
                this.shieldTimer = 0;
                this.shieldType = 'none';
            }
            this.invincibleTimer = 1.0;
            return true;
        }
        return false;
    }

    die() {
        this.state = 'death';
        this.animFrame = 0;
        this.animTimer = 0;
        this.deathTimer = 0;
        this.vx = 0;
        this.vy = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldType = 'none';
    }

    recoverStamina(amount) {
        this.stamina = Math.min(this.stamina + amount, CONFIG.PLAYER.MAX_STAMINA);
    }

    playPickup() {
        if (this.state === 'death') return;
        this.state = 'pickup';
        this.animFrame = 0;
        this.animTimer = 0;
        this.pickupTimer = 0.5;
        this.vx = 0;
    }

    playVictory() {
        this.state = 'victory';
        this.animFrame = 0;
        this.animTimer = 0;
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

    _getAnimSpeed(animName, info) {
        if (info && info.animSpeed) return info.animSpeed;
        const defaults = {
            idle: 0.2,
            run_right: 0.25,
            run_left: 0.25,
            jump_start: 0.08,
            airborne: 0.15,
            landing: 0.08,
            crouch: 0.2,
            crouch_walk: 0.25,
            knockback: 0.12,
            death: 0.2,
            pickup: 0.12,
            operate: 0.15,
            victory: 0.15
        };
        return defaults[animName] || 0.15;
    }

    integrate(dt) {
        if (this.state !== 'death') {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        } else {
            this.deathTimer += dt;
            if (this.deathTimer < 0.5) {
                this.vy += CONFIG.GRAVITY * dt * 0.3;
                this.y += this.vy * dt;
            }
        }
    }

    updateAnim(dt) {
        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
        if (this.hurtTimer > 0) this.hurtTimer -= dt;
        if (this.shieldTimer > 0 && this.shieldTimer !== Infinity) {
            this.shieldTimer -= dt;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
                this.shieldTimer = 0;
                this.shieldType = 'none';
            }
        }
        if (this.pickupTimer > 0) {
            this.pickupTimer -= dt;
            if (this.pickupTimer <= 0 && this.state !== 'death') this.state = 'idle';
        }

        if (this.state === 'death') {
            const animName = 'death';
            const info = window.Game?.assets?.getAnimInfo?.(this.gender, animName);
            const frameCount = info?.frames?.length || 4;
            this.animSpeed = this._getAnimSpeed(animName, info);
            this.animTimer += dt;
            if (this.animTimer >= this.animSpeed) {
                this.animTimer = 0;
                if (this.animFrame < frameCount - 1) this.animFrame++;
            }
            this.prevState = this.state;
            return;
        }

        if (this.state === 'hurt' && this.hurtTimer <= 0) {
            this.state = this.onGround ? (this.crouching ? 'crouch' : 'idle') : 'airborne';
            this.animFrame = 0;
            this.animTimer = 0;
        }

        const moving = Math.abs(this.vx) > 10;

        if (this.state !== 'hurt' && this.state !== 'victory' &&
            this.state !== 'operate' && this.state !== 'pickup') {
            if (!this.onGround) {
                if (this.vy < 0) {
                    this.state = 'jump';
                } else {
                    this.state = 'airborne';
                }
            } else if (this.state === 'airborne' || this.state === 'jump') {
                this.state = 'landing';
                this.animFrame = 0;
                this.animTimer = 0;
                this.landingTimer = 0;
            } else if (this.state === 'landing') {
                this.landingTimer += dt;
                const info = window.Game?.assets?.getAnimInfo?.(this.gender, 'landing');
                const fc = info?.frames?.length || 4;
                const frameDur = this._getAnimSpeed('landing', info);
                if (this.landingTimer >= fc * frameDur) {
                    this.state = this.crouching ? 'crouch' : (moving ? 'run' : 'idle');
                    this.animFrame = 0;
                    this.animTimer = 0;
                }
            } else if (this.crouching) {
                this.state = 'crouch';
            } else {
                this.state = moving ? 'run' : 'idle';
            }
        }

        const animName = this._resolveAnimName();
        const info = window.Game?.assets?.getAnimInfo?.(this.gender, animName);
        const frameCount = info?.frames?.length || 4;
        const loop = info?.loop !== false;
        this.animSpeed = this._getAnimSpeed(animName, info);

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

    update(dt) {
        this.integrate(dt);
        this.updateAnim(dt);
    }

    render(renderer) {
        if (!this.visible) return;
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 12) % 2 === 0 && this.state !== 'death') return;

        const ctx = renderer.ctx;
        const assets = window.Game?.assets;
        const animName = this._resolveAnimName();
        const info = assets?.getAnimInfo?.(this.gender, animName);

        const fw = info?.frameWidth || this._charInfo.fw;
        const fh = info?.frameHeight || this._charInfo.fh;
        const scale = CONFIG.PLAYER.HEIGHT / fh;
        const drawW = fw * scale;
        const drawH = fh * scale;

        const crouchOffset = this.crouching && this.onGround ? drawH * 0.3 : 0;
        const drawX = this.x + (this.w - drawW) / 2;
        const drawY = this.y + this.h - drawH + crouchOffset;

        // Female sprites only have left-facing frames, so flip when facing right
        // Male sprites have both directions, so no flip needed
        const isDirectionalAnim = animName === 'run_left' || animName === 'run_right';
        let flipX = false;
        if (this.gender === 'female') {
            const needsFlipForRight = (animName !== 'run_right');
            flipX = this.facingRight && needsFlipForRight;
        } else {
            flipX = !isDirectionalAnim && !this.facingRight;
        }

        if (this.shieldActive && this.shieldTimer > 0) {
            ctx.save();
            const pulse = 0.8 + Math.sin(Date.now() / 100) * 0.2;
            ctx.shadowColor = 'rgba(0,200,255,' + pulse + ')';
            ctx.shadowBlur = 25;
            ctx.strokeStyle = 'rgba(100,220,255,' + (0.6 + pulse * 0.3) + ')';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (assets && assets.charAnims?.[this.gender]?.[animName]) {
            if (this.state === 'death') {
                const t = Math.min(this.deathTimer / 1.5, 1);
                ctx.save();
                ctx.globalAlpha = 1 - t * 0.4;
                ctx.translate(this.x + this.w / 2, this.y + this.h);
                ctx.rotate(t * 1.2);
                ctx.scale(1 - t * 0.2, 1 - t * 0.2);
                ctx.translate(-this.w / 2, -this.h);
                assets.drawCharacter(ctx, this.gender, animName, drawX - this.x, drawY - this.y, this.animFrame, scale, flipX);
                ctx.restore();
            } else {
                assets.drawCharacter(ctx, this.gender, animName, drawX, drawY, this.animFrame, scale, flipX);
            }
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
