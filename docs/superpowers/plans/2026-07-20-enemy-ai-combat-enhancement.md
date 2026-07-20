# 怪物AI与战斗系统增强 Implementation Plan

&gt; **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增强病毒怪物AI（智能追踪、踩头击杀、死亡动画），新增远程射击怪物RangedVirus和投射物系统，添加玩家踩头击杀机制。

**Architecture:** 基于现有Entity基类扩展，创建Projectile投射物类和RangedVirus远程怪物类；修改Virus增强AI和踩头机制；修改Player添加踩头击杀判定；修改TencentLobbyScene整合新敌人类型和投射物更新/碰撞/渲染逻辑。

**Tech Stack:** 原生JavaScript Canvas 2D, 现有游戏引擎框架

---

## 文件结构说明

**修改文件：**
- `js/config.js` - 调整VIRUS_SPEED和VIRUS_JUMP_FORCE参数
- `js/entities/Virus.js` - 增强AI、踩头机制、死亡动画
- `js/entities/Player.js` - 添加踩头击杀逻辑
- `js/scenes/TencentLobbyScene.js` - 添加RangedVirus、投射物更新/碰撞/渲染
- `index.html` - 引入新实体类脚本

**新建文件：**
- `js/entities/Projectile.js` - 投射物基类
- `js/entities/RangedVirus.js` - 远程射击怪物类

---

### Task 1: 修改 config.js 调整怪物参数

**Files:**
- Modify: `js/config.js:50-51`

- [ ] **Step 1: 修改VIRUS_SPEED和VIRUS_JUMP_FORCE**

将config.js中TENCENT配置节的以下值修改：

```javascript
VIRUS_SPEED: 340,
VIRUS_JUMP_FORCE: -980,
```

- [ ] **Step 2: 验证修改**

确认文件中这两个值已更新为：
- VIRUS_SPEED: 340（原290，提高50px）
- VIRUS_JUMP_FORCE: -980（原-820，比玩家-900更强，跳更高）

- [ ] **Step 3: Commit**

```bash
git add js/config.js
git commit -m "feat: increase virus speed to 340 and jump force to -980"
```

---

### Task 2: 创建 Projectile.js 投射物类

**Files:**
- Create: `js/entities/Projectile.js`

- [ ] **Step 1: 创建Projectile类文件**

创建 `js/entities/Projectile.js`，内容如下：

```javascript
class Projectile extends Entity {
    constructor(x, y, vx, vy, owner = 'enemy', damage = 1) {
        super(x - 8, y - 8, 16, 16);
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.damage = damage;
        this.life = 2.0;
        this.dead = false;
        this.gravity = 0;
    }

    update(dt, platforms) {
        this.life -= dt;
        if (this.life &lt;= 0) {
            this.dead = true;
            return;
        }

        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        for (const plat of platforms) {
            if (CollisionSystem.aabb(this.getHitbox(), plat)) {
                this.dead = true;
                return;
            }
        }

        if (this.y &gt; CONFIG.TENCENT.DEATH_Y) {
            this.dead = true;
        }
    }

    getHitbox() {
        return { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 };
    }

    render(ctx) {
        ctx.save();
        
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffaaaa';
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w/4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.w/2 - 2, this.y + this.h/2 - 2, this.w/6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
```

- [ ] **Step 2: 验证文件创建**

确认文件已创建在 `js/entities/Projectile.js`

- [ ] **Step 3: Commit**

```bash
git add js/entities/Projectile.js
git commit -m "feat: add Projectile class for enemy ranged attacks"
```

---

### Task 3: 增强 Virus.js - 添加踩头击杀机制和属性

**Files:**
- Modify: `js/entities/Virus.js`

- [ ] **Step 1: 在构造函数中添加新属性**

在Virus构造函数中（第21行之后）添加：

```javascript
        this.dead = false;
        this.deadTimer = 0;
        this.stompable = true;
        this.seePlayer = false;
```

- [ ] **Step 2: 在getHitbox()之前添加getStompHitbox()方法**

在getHitbox()方法（第170行）之前添加：

```javascript
    getStompHitbox() {
        return { x: this.x + 10, y: this.y, w: this.w - 20, h: 20 };
    }

    stomp() {
        this.dead = true;
        this.deadTimer = 0;
        this.vy = -400;
        this.vx = 0;
    }
```

- [ ] **Step 3: 在update()开头添加死亡处理逻辑**

在update方法的最开始（第25行之前）添加：

```javascript
        if (this.dead) {
            this.deadTimer += dt;
            this.vy += CONFIG.GRAVITY * dt;
            if (this.vy &gt; CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
            this.y += this.vy * dt;
            this.x += this.vx * dt;
            return;
        }
```

- [ ] **Step 4: 修改追踪AI - 添加视线检测和智能跳跃**

替换原来update方法中的追踪逻辑（第25-49行）为：

```javascript
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.seePlayer = Math.abs(dy) &lt; 200;

        if (dist &lt; this.detectRange &amp;&amp; this.seePlayer) {
            this.agitated = true;
            const trackSpeed = this.speed * 1.1;
            if (dx &gt; 10) {
                this.vx = trackSpeed;
                this.facingRight = true;
            } else if (dx &lt; -10) {
                this.vx = -trackSpeed;
                this.facingRight = false;
            } else {
                this.vx = 0;
            }
        } else {
            this.agitated = false;
            this.patrolTimer -= dt;
            if (this.patrolTimer &lt;= 0) {
                this.patrolTimer = 2 + Math.random() * 3;
                this.patrolDir = Math.random() &gt; 0.5 ? 1 : -1;
            }
            this.vx = this.patrolDir * this.speed * 0.3;
            this.facingRight = this.patrolDir &gt; 0;
        }
```

- [ ] **Step 5: 添加平台边缘检测和智能跳跃逻辑**

在跳跃逻辑（第51-64行）之后，重力应用之前，添加边缘检测和智能跳跃：

```javascript
        let shouldJump = false;
        let edgeAhead = false;

        if (this.onGround) {
            const checkX = this.facingRight ? this.x + this.w + 5 : this.x - 5;
            const checkY = this.y + this.h + 5;
            let hasGroundAhead = false;
            for (const plat of platforms) {
                if (checkX &gt;= plat.x &amp;&amp; checkX &lt;= plat.x + plat.w &amp;&amp;
                    checkY &gt;= plat.y &amp;&amp; checkY &lt;= plat.y + plat.h + 20) {
                    hasGroundAhead = true;
                    break;
                }
            }
            edgeAhead = !hasGroundAhead;

            if (!this.agitated &amp;&amp; edgeAhead) {
                this.patrolDir = -this.patrolDir;
                this.facingRight = this.patrolDir &gt; 0;
                this.vx = this.patrolDir * this.speed * 0.3;
            }

            if (this.agitated &amp;&amp; edgeAhead &amp;&amp; dist &lt; 400) {
                shouldJump = true;
            }

            let wallAhead = false;
            const wallCheckX = this.facingRight ? this.x + this.w + 2 : this.x - 2;
            for (const plat of platforms) {
                if (wallCheckX &gt;= plat.x &amp;&amp; wallCheckX &lt;= plat.x + plat.w &amp;&amp;
                    this.y + this.h &gt; plat.y &amp;&amp; this.y &lt; plat.y + plat.h) {
                    wallAhead = true;
                    break;
                }
            }
            if (this.agitated &amp;&amp; wallAhead) {
                shouldJump = true;
            }
        }

        if (shouldJump &amp;&amp; this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
            this.jumpTimer = this.jumpInterval * 0.5;
        }
```

- [ ] **Step 6: 修改死亡重生逻辑 - 踩头死亡不重生**

找到掉出地图的重生逻辑（第88-94行），修改为：

```javascript
        if (this.y &gt; CONFIG.TENCENT.DEATH_Y) {
            if (!this.dead) {
                this.x = this.spawnX + (Math.random() - 0.5) * 200;
                this.y = this.spawnY - Math.random() * 100;
                this.vx = 0;
                this.vy = 0;
                this.agitated = false;
            }
        }
```

- [ ] **Step 7: 修改render()方法添加死亡动画**

替换render()方法内容（第103-168行），在ctx.save()之后添加死亡状态处理：

```javascript
    render(renderer) {
        const ctx = renderer.ctx;
        const sx = this.x;
        const sy = this.y;
        const s = this.w;

        ctx.save();

        if (this.dead) {
            ctx.globalAlpha = Math.max(0, 1 - this.deadTimer * 2);
            const scaleY = Math.max(0.2, 1 - this.deadTimer * 1.5);
            const rotation = this.deadTimer * 3;
            ctx.translate(sx + s/2, sy + s/2);
            ctx.rotate(rotation);
            ctx.scale(1, scaleY);
            ctx.translate(-(sx + s/2), -(sy + s/2));
        }

        if (this.agitated &amp;&amp; !this.dead) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20 + Math.sin(Date.now() / 100) * 10;
        }

        const virusImg = window.Game?.assets?.getSprite?.('ENEMY_BOT');
        if (virusImg &amp;&amp; virusImg.image) {
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
            ctx.fillStyle = this.dead ? '#666666' : (this.agitated ? '#ff3333' : '#9933ff');
            ctx.beginPath();
            ctx.arc(sx + s/2, sy + s/2, s/2 - 4, 0, Math.PI * 2);
            ctx.fill();

            if (!this.dead) {
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
                for (let i = 0; i &lt; spikeCount; i++) {
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

        if (this.agitated &amp;&amp; !this.dead) {
            ctx.fillStyle = 'rgba(255,0,0,0.8)';
            ctx.font = 'bold 14px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('!', sx + s/2, sy - 10);
        }
    }
```

- [ ] **Step 8: 验证修改**

确认Virus.js包含：
- dead/deadTimer/stompable/seePlayer属性
- getStompHitbox()和stomp()方法
- 死亡状态时禁用移动和碰撞（直接return）
- 智能追踪（1.1倍速）、边缘检测、智能跳跃
- 踩头死亡不重生，掉出地图才重生
- 死亡动画（透明度、缩放、旋转）

- [ ] **Step 9: Commit**

```bash
git add js/entities/Virus.js
git commit -m "feat: enhance virus AI with stomp mechanics, smart tracking, and death animation"
```

---

### Task 4: 创建 RangedVirus.js 远程怪物类

**Files:**
- Create: `js/entities/RangedVirus.js`

- [ ] **Step 1: 创建RangedVirus类文件**

创建 `js/entities/RangedVirus.js`，内容如下：

```javascript
class RangedVirus extends Entity {
    constructor(x, y) {
        super(x, y, 60, 60);
        this.spawnX = x;
        this.spawnY = y;
        this.speed = CONFIG.TENCENT.VIRUS_SPEED * 0.5;
        this.detectRange = 500;
        this.shootCooldown = 0;
        this.shootInterval = 2.0;
        this.projectiles = [];
        this.dead = false;
        this.deadTimer = 0;
        this.stompable = true;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.facingRight = Math.random() &gt; 0.5;
        this.patrolDir = Math.random() &gt; 0.5 ? 1 : -1;
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.15;
        this.shooting = false;
    }

    getStompHitbox() {
        return { x: this.x + 8, y: this.y, w: this.w - 16, h: 18 };
    }

    getHitbox() {
        return { x: this.x + 6, y: this.y + 6, w: this.w - 12, h: this.h - 12 };
    }

    stomp() {
        this.dead = true;
        this.deadTimer = 0;
        this.vy = -400;
        this.vx = 0;
    }

    update(dt, player, platforms) {
        if (this.dead) {
            this.deadTimer += dt;
            this.vy += CONFIG.GRAVITY * dt;
            if (this.vy &gt; CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
            this.y += this.vy * dt;
            this.x += this.vx * dt;
            
            for (let i = this.projectiles.length - 1; i &gt;= 0; i--) {
                this.projectiles[i].update(dt, platforms);
                if (this.projectiles[i].dead) {
                    this.projectiles.splice(i, 1);
                }
            }
            return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const canSeePlayer = Math.abs(dy) &lt; 150 &amp;&amp; dist &lt; this.detectRange;

        if (canSeePlayer) {
            this.shooting = true;
            this.vx = 0;
            this.facingRight = dx &gt; 0;
            
            this.shootCooldown -= dt;
            if (this.shootCooldown &lt;= 0) {
                this.shootCooldown = this.shootInterval;
                const dir = this.facingRight ? 1 : -1;
                const proj = new Projectile(
                    this.x + this.w/2,
                    this.y + this.h/2,
                    dir * 400,
                    0,
                    'enemy',
                    1
                );
                this.projectiles.push(proj);
            }
        } else {
            this.shooting = false;
            this.vx = this.patrolDir * this.speed;
            this.facingRight = this.patrolDir &gt; 0;
        }

        this.vy += CONFIG.GRAVITY * dt;
        if (this.vy &gt; CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;

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

        if (this.onGround &amp;&amp; !canSeePlayer) {
            const checkX = this.facingRight ? this.x + this.w + 5 : this.x - 5;
            const checkY = this.y + this.h + 5;
            let hasGroundAhead = false;
            for (const plat of platforms) {
                if (checkX &gt;= plat.x &amp;&amp; checkX &lt;= plat.x + plat.w &amp;&amp;
                    checkY &gt;= plat.y &amp;&amp; checkY &lt;= plat.y + plat.h + 20) {
                    hasGroundAhead = true;
                    break;
                }
            }
            if (!hasGroundAhead) {
                this.patrolDir = -this.patrolDir;
                this.facingRight = this.patrolDir &gt; 0;
                this.vx = this.patrolDir * this.speed;
            }
        }

        let wallHit = false;
        for (const plat of platforms) {
            if (this.x &lt;= plat.x + plat.w &amp;&amp; this.x + this.w &gt;= plat.x &amp;&amp;
                this.y + this.h &gt; plat.y &amp;&amp; this.y &lt; plat.y + plat.h) {
                if (this.patrolDir &gt; 0 &amp;&amp; this.x + this.w &gt;= plat.x &amp;&amp; this.x &lt; plat.x) {
                    this.x = plat.x - this.w;
                    wallHit = true;
                } else if (this.patrolDir &lt; 0 &amp;&amp; this.x &lt;= plat.x + plat.w &amp;&amp; this.x + this.w &gt; plat.x + plat.w) {
                    this.x = plat.x + plat.w;
                    wallHit = true;
                }
            }
        }
        if (wallHit &amp;&amp; !canSeePlayer) {
            this.patrolDir = -this.patrolDir;
            this.facingRight = this.patrolDir &gt; 0;
            this.vx = this.patrolDir * this.speed;
        }

        if (this.y &gt; CONFIG.TENCENT.DEATH_Y &amp;&amp; !this.dead) {
            this.x = this.spawnX + (Math.random() - 0.5) * 100;
            this.y = this.spawnY - Math.random() * 50;
            this.vx = 0;
            this.vy = 0;
            this.projectiles = [];
        }

        for (let i = this.projectiles.length - 1; i &gt;= 0; i--) {
            this.projectiles[i].update(dt, platforms);
            if (this.projectiles[i].dead) {
                this.projectiles.splice(i, 1);
            }
        }

        this.animTimer += dt;
        if (this.animTimer &gt;= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const sx = this.x;
        const sy = this.y;
        const s = this.w;

        for (const proj of this.projectiles) {
            proj.render(ctx);
        }

        ctx.save();

        if (this.dead) {
            ctx.globalAlpha = Math.max(0, 1 - this.deadTimer * 2);
            const scaleY = Math.max(0.2, 1 - this.deadTimer * 1.5);
            const rotation = this.deadTimer * 3;
            ctx.translate(sx + s/2, sy + s/2);
            ctx.rotate(rotation);
            ctx.scale(1, scaleY);
            ctx.translate(-(sx + s/2), -(sy + s/2));
        }

        ctx.fillStyle = this.dead ? '#553333' : '#ff4444';
        ctx.fillRect(sx + 5, sy + 10, s - 10, s - 15);
        
        ctx.fillStyle = this.dead ? '#442222' : '#cc2222';
        ctx.fillRect(sx + 10, sy, s - 20, 20);

        if (!this.dead) {
            const barrelX = this.facingRight ? sx + s - 5 : sx - 15;
            ctx.fillStyle = '#882222';
            ctx.fillRect(barrelX, sy + s/2 - 5, 20, 10);
            
            ctx.fillStyle = '#ff8888';
            const eyeX = this.facingRight ? sx + s - 20 : sx + 10;
            ctx.fillRect(eyeX, sy + 5, 8, 8);
            
            if (this.shooting) {
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(eyeX, sy + 5, 8, 8);
            }
            
            ctx.fillStyle = '#aa3333';
            for (let i = 0; i &lt; 3; i++) {
                ctx.fillRect(sx + 10 + i * 12, sy + s - 8, 8, 4);
            }
        }

        ctx.restore();
    }
}
```

- [ ] **Step 2: 验证文件创建**

确认文件已创建在 `js/entities/RangedVirus.js`，包含：
- 60x60大小，速度为普通病毒0.5倍
- shootCooldown/shootInterval/projectiles属性
- 巡逻逻辑（边缘转身）
- 玩家进入范围（500px，y差&lt;150）时停止移动射击
- 投射物管理（创建、更新、移除）
- 死亡动画同Virus
- 渲染为红色方形机器人，带炮管

- [ ] **Step 3: Commit**

```bash
git add js/entities/RangedVirus.js
git commit -m "feat: add RangedVirus ranged enemy class with shooting mechanics"
```

---

### Task 5: 修改 Player.js 添加踩头击杀逻辑

**Files:**
- Modify: `js/entities/Player.js`

- [ ] **Step 1: 在Player类中添加stompBounce方法（可选，但便于调用）**

在die()方法之后添加一个辅助方法（第106行之后）：

```javascript
    bounce() {
        this.vy = -600;
        this.onGround = false;
        this.canDoubleJump = true;
    }
```

- [ ] **Step 2: 验证修改**

确认Player.js现在有bounce()方法，用于踩头后的小弹跳。踩头的实际判定逻辑将在TencentLobbyScene中处理。

- [ ] **Step 3: Commit**

```bash
git add js/entities/Player.js
git commit -m "feat: add bounce() method for stomp rebound"
```

---

### Task 6: 修改 TencentLobbyScene.js 整合新系统

**Files:**
- Modify: `js/scenes/TencentLobbyScene.js`

- [ ] **Step 1: 在构造函数中添加rangedViruses和allProjectiles数组**

在构造函数中（第28行之后）添加：

```javascript
        this.rangedViruses = [];
        this.allProjectiles = [];
```

- [ ] **Step 2: 在_buildLevel()中初始化rangedViruses并添加实例**

在_buildLevel()方法中，找到`this.viruses = [];`（第120行）之后添加：

```javascript
        this.rangedViruses = [];
```

在病毒创建之后（第254行之后），添加远程病毒创建：

```javascript
        const rangedVirusPositions = [
            { x: 6500, y: 500 },
            { x: 8700, y: 600 },
            { x: 10600, y: 700 }
        ];
        for (const rvp of rangedVirusPositions) {
            this.rangedViruses.push(new RangedVirus(rvp.x, rvp.y));
        }
```

- [ ] **Step 3: 在update()中更新rangedViruses和收集投射物**

找到病毒更新循环（第609-622行），替换整个病毒和碰撞检测部分：

首先，在病毒更新之前，添加所有敌人列表整合：

```javascript
        const allPlatformsForVirus = [...this.platforms, ...this.movingPlatforms];
        this.allProjectiles = [];

        for (const virus of this.viruses) {
            virus.update(dt, p, allPlatformsForVirus);
            if (virus.agitated &amp;&amp; !virus.dead &amp;&amp; this._time - this._lastVirusWarn &gt; 3) {
                this._lastVirusWarn = this._time;
                this.audio.playSFX('VIRUS_ALERT');
            }
        }

        for (const rv of this.rangedViruses) {
            rv.update(dt, p, allPlatformsForVirus);
            for (const proj of rv.projectiles) {
                this.allProjectiles.push(proj);
            }
        }
```

- [ ] **Step 4: 添加踩头击杀判定和敌人碰撞检测**

在敌人更新之后，替换原来简单的碰撞致死逻辑（第617-621行）为：

```javascript
        const allEnemies = [...this.viruses, ...this.rangedViruses];
        for (const enemy of allEnemies) {
            if (enemy.dead) continue;
            
            const enemyHb = enemy.getHitbox();
            const stompHb = enemy.getStompHitbox();
            const playerFeet = { x: playerHb.x, y: playerHb.y + playerHb.h - 15, w: playerHb.w, h: 20 };
            
            if (p.vy &gt; 0 &amp;&amp; CollisionSystem.aabb(playerFeet, stompHb)) {
                enemy.stomp();
                p.bounce();
                this.audio.playSFX('LAND');
                this.particles.emit(enemy.x + enemy.w/2, enemy.y + enemy.h/2, {
                    count: 15, spreadX: 100, spreadY: 80, life: 0.5, size: 4,
                    colors: ['#ff6666', '#ffaa00', '#ffff00'], shape: 'circle'
                });
                continue;
            }
            
            if (CollisionSystem.aabb(playerHb, enemyHb)) {
                this._killPlayer('virus');
                this.particles.update(dt);
                return;
            }
        }
```

- [ ] **Step 5: 添加投射物碰撞检测**

在敌人碰撞检测之后添加：

```javascript
        for (const proj of this.allProjectiles) {
            if (proj.dead) continue;
            if (CollisionSystem.aabb(playerHb, proj.getHitbox())) {
                proj.dead = true;
                this._killPlayer('projectile');
                this.particles.update(dt);
                return;
            }
        }
```

- [ ] **Step 6: 添加清理dead敌人的逻辑**

在投射物碰撞检测之后，添加：

```javascript
        this.viruses = this.viruses.filter(v =&gt; !v.dead || v.deadTimer &lt;= 0.6);
        this.rangedViruses = this.rangedViruses.filter(rv =&gt; !rv.dead || rv.deadTimer &lt;= 0.6);
```

- [ ] **Step 7: 修改render()先渲染投射物再渲染敌人**

在render()方法中，找到病毒渲染部分（第829-831行）：

```javascript
        for (const virus of this.viruses) {
            virus.render(this.renderer);
        }
```

在它之前添加投射物渲染和远程病毒渲染：

```javascript
        for (const proj of this.allProjectiles) {
            if (!proj.dead) {
                proj.render(ctx);
            }
        }

        for (const rv of this.rangedViruses) {
            rv.render(this.renderer);
        }

        for (const virus of this.viruses) {
            virus.render(this.renderer);
        }
```

- [ ] **Step 8: 在enter()方法中重置rangedViruses**

在enter()方法中，找到_buildLevel()调用之前确保重置状态，_buildLevel()已经会初始化rangedViruses，确认没有问题。

- [ ] **Step 9: 验证修改**

确认TencentLobbyScene.js：
- 构造函数有rangedViruses和allProjectiles
- _buildLevel()创建3个RangedVirus在指定位置
- update()更新所有病毒和远程病毒，收集投射物
- 踩头判定：vy&gt;0（下落）且玩家脚在敌人stompHitbox内
- 踩头调用enemy.stomp()和p.bounce()
- 投射物碰撞检测杀死玩家
- 清理dead超过0.6秒的敌人
- render()先渲染投射物，再远程病毒，再普通病毒

- [ ] **Step 10: Commit**

```bash
git add js/scenes/TencentLobbyScene.js
git commit -m "feat: integrate RangedVirus, projectiles, and stomp kill mechanics in scene"
```

---

### Task 7: 修改 index.html 引入新脚本

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 在Virus.js之后添加新脚本引用**

找到第50行：
```html
    &lt;script src="js/entities/Virus.js"&gt;&lt;/script&gt;
```

在它之后添加：

```html
    &lt;script src="js/entities/Projectile.js"&gt;&lt;/script&gt;
    &lt;script src="js/entities/RangedVirus.js"&gt;&lt;/script&gt;
```

- [ ] **Step 2: 验证修改**

确认index.html中脚本加载顺序为：
1. Entity.js
2. Player.js
3. Obstacle.js
4. Collectible.js
5. Platform.js
6. Virus.js
7. Projectile.js
8. RangedVirus.js

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Projectile.js and RangedVirus.js script includes"
```

---

### Task 8: 手动测试验证

**Files:**
- 无文件修改

- [ ] **Step 1: 启动本地服务器测试**

在项目根目录运行：
```bash
python -m http.server 8080
```
或者使用任意静态文件服务器。

- [ ] **Step 2: 测试功能点**

在浏览器中打开游戏，测试以下内容：

1. **怪物速度和跳跃：** 普通病毒移动更快，跳得比玩家高
2. **踩头击杀：** 从上方跳到病毒头上，病毒死亡（压扁+旋转+淡出），玩家反弹
3. **智能追踪：** 病毒发现玩家后会更快追踪，遇到缺口/墙壁会跳
4. **巡逻不落地：** 病毒巡逻到平台边缘会转身
5. **远程病毒：** 中后段平台上有红色机器人，会左右巡逻
6. **远程射击：** 靠近远程病毒时，它会停止移动向你发射红色能量球
7. **投射物击杀：** 被能量球击中会死亡
8. **远程病毒可踩头：** 远程病毒同样可以被踩头击杀
9. **死亡不重生：** 被踩头的怪物永久消失；掉出地图的怪物会重生

- [ ] **Step 3: 修复发现的问题**

如果测试中发现任何bug，记录并修复。

- [ ] **Step 4: Final Commit**

```bash
git add -A
git commit -m "fix: any bugfixes from testing"
```

---

## 自检清单

**Spec覆盖检查：**
- ✅ Virus踩头击杀机制（dead/deadTimer/stompable/getStompHitbox/stomp）
- ✅ Virus智能追踪AI（seePlayer、1.1倍速、边缘检测、智能跳跃）
- ✅ Virus巡逻不掉落（边缘转身），agitated时可跳下追击
- ✅ config参数调整（VIRUS_SPEED=340, VIRUS_JUMP_FORCE=-980）
- ✅ Virus死亡动画（透明度、y轴缩放、旋转）
- ✅ RangedVirus类（60x60、慢速度、巡逻、射击、投射物）
- ✅ Projectile类（水平飞行、碰撞平台消失、红色发光球渲染）
- ✅ Player踩头判定（vy&gt;0、脚在顶部区域、反弹-600）
- ✅ 踩头死亡永久移除，掉出地图重生
- ✅ TencentLobbyScene添加3个RangedVirus在x=6500/8500/10500附近
- ✅ 投射物更新、碰撞检测、渲染顺序
- ✅ index.html引入新脚本

**占位符检查：**
- ✅ 无TBD/TODO
- ✅ 所有代码步骤有完整代码
- ✅ 无模糊描述（"添加适当处理"等）
- ✅ 文件路径完整准确

**类型一致性检查：**
- ✅ stomp()方法在Virus和RangedVirus中一致
- ✅ getStompHitbox()命名一致
- ✅ dead/deadTimer属性在所有怪物类中一致
- ✅ Projectile构造函数参数与RangedVirus射击调用匹配
