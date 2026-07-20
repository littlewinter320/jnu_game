# 卓越工程师大冒险 - 游戏增强功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现小鹏关卡车辆终点机制、护盾道具、难度调整、胜利画面改进，以及两个关卡的剧情对话增强

**Architecture:** 采用TDD方法分模块实现：先修改配置文件，再实现小鹏关卡核心机制（车辆预警+护盾+胜利判定），然后修改胜利场景，最后重写两个intro场景的对话系统

**Tech Stack:** 原生JavaScript, Canvas API, CollisionSystem.aabb, 现有粒子系统

---

## 文件结构概览

**需要修改的文件：**
- `js/config.js` - 配置参数调整
- `js/scenes/XPengRunScene.js` - 核心游戏机制（车辆、护盾、渲染）
- `js/scenes/WinScene.js` - 胜利画面改进
- `js/scenes/XPengIntroScene.js` - 小鹏入场对话重写
- `js/scenes/TencentIntroScene.js` - 腾讯入场对话重写
- `js/scenes/TencentLobbyScene.js` - HUD调用修复

---

### Task 1: 修改 config.js 配置参数

**Files:**
- Modify: `js/config.js:134` (STAMINA_DECAY_PER_SEC)

- [ ] **Step 1: 确认并修改配置**

将 `js/config.js` 中第134行的：
```javascript
STAMINA_DECAY_PER_SEC: 0.8,
```
改为：
```javascript
STAMINA_DECAY_PER_SEC: 1.0,
```

- [ ] **Step 2: 验证其他参数是否正确**

确认以下参数值：
- XPENG.DURATION = 120 ✓ (第133行)
- XPENG.BASE_SPEED = 320 ✓ (第129行)
- XPENG.MAX_SPEED = 720 ✓ (第130行)
- TENCENT.VIRUS_SPEED = 340 ✓ (第50行)
- TENCENT.VIRUS_JUMP_FORCE = -980 ✓ (第51行)
- PLAYER.MOVE_SPEED = 440 ✓ (第11行)
- PLAYER.JUMP_FORCE = -900 ✓ (第9行)
- XPENG.DIFFICULTY_INCREASE = 0.1 ✓ (第138行)
- XPENG.DIFFICULTY_INTERVAL = 30 ✓ (第137行)
- XPENG.STAMINA_JUMP_COST = 2.5 ✓ (第135行)
- XPENG.STAMINA_CROUCH_COST = 1.5 ✓ (第136行)

- [ ] **Step 3: Commit**

```bash
git add js/config.js
git commit -m "feat: increase XPeng stamina decay to 1.0 for higher difficulty"
```

---

### Task 2: 修改 TencentLobbyScene.js - HUD护盾时间传递

**Files:**
- Modify: `js/scenes/TencentLobbyScene.js:1022`

- [ ] **Step 1: 修改hud.render调用**

将 `js/scenes/TencentLobbyScene.js` 第1022行：
```javascript
this.hud.render(ctx, null, 0, 'tencent');
```
改为：
```javascript
this.hud.render(ctx, this.player.stamina, CONFIG.PLAYER.MAX_STAMINA, 'tencent', this.player.shieldTimer || 0);
```

- [ ] **Step 2: 验证Player有stamina属性**

确认 TencentLobbyScene 中玩家有stamina属性（在enter()中第80行已设置：`this.player.stamina = CONFIG.PLAYER.MAX_STAMINA;`），Tencent关卡目前使用的是Player类自己的stamina管理。

注意：需要在update中同步stamina，或直接传给HUD。检查TencentLobbyScene的update逻辑，玩家stamina管理是在takeDamage和recover中，所以直接传递 `this.player.stamina` 即可。

- [ ] **Step 3: Commit**

```bash
git add js/scenes/TencentLobbyScene.js
git commit -m "fix: pass player stamina and shield timer to HUD in Tencent level"
```

---

### Task 3: XPengRunScene.js - 添加新的状态变量和初始化

**Files:**
- Modify: `js/scenes/XPengRunScene.js` (构造函数和enter方法)

- [ ] **Step 1: 在构造函数添加新属性**

在 `js/scenes/XPengRunScene.js` 构造函数中（第31行后）添加：
```javascript
        this.shieldItems = [];
        this._shieldTimer = 0;
        this._targetLane = -1;
        this._xpengCar = null;
        this._xpengCarPhase = 'waiting';
        this._xpengEndingBg = null;
        this._victoryParticlesEmitted = false;
```

完整构造函数末尾应该有这些属性。

- [ ] **Step 2: 在enter()方法中初始化新属性**

在enter()方法中（第61行后）添加：
```javascript
        this.shieldItems = [];
        this._shieldTimer = 10;
        this._targetLane = -1;
        this._xpengCar = null;
        this._xpengCarPhase = 'waiting';
        this._victoryParticlesEmitted = false;
```

- [ ] **Step 3: Commit**

```bash
git add js/scenes/XPengRunScene.js
git commit -m "feat: add state variables for shield, XPeng car, and ending"
```

---

### Task 4: XPengRunScene.js - 添加护盾道具生成逻辑

**Files:**
- Modify: `js/scenes/XPengRunScene.js` (添加_spawnShield方法和定时器)

- [ ] **Step 1: 添加护盾生成定时器变量**

在构造函数中 `this._batteryTimer = 3;` 后添加：
```javascript
        this._shieldItemTimer = 10;
```

在enter()中 `this._batteryTimer = 3;` 后添加：
```javascript
        this._shieldItemTimer = 10;
```

- [ ] **Step 2: 添加_spawnShield方法**

在 `_spawnBattery()` 方法（第343-353行）后面添加 `_spawnShield()` 方法：

```javascript
    _spawnShield() {
        const laneIdx = Math.floor(Math.random() * CONFIG.XPENG.LANES.length);
        const lane = CONFIG.XPENG.LANES[laneIdx];
        const yOffsets = [-100, -160, -220];
        this.shieldItems.push({
            x: CONFIG.CANVAS_WIDTH + 50,
            y: lane.y + yOffsets[Math.floor(Math.random() * yOffsets.length)],
            w: 40, h: 40,
            type: 'shield',
            lane: laneIdx,
            floatPhase: Math.random() * Math.PI * 2
        });
    }
```

- [ ] **Step 3: 在update中添加护盾生成计时**

在update方法中电池生成逻辑（第246-250行）后添加护盾生成逻辑：
```javascript
        this._shieldItemTimer -= dt;
        if (this._shieldItemTimer <= 0) {
            this._spawnShield();
            this._shieldItemTimer = 8 + Math.random() * 4;
        }
```

- [ ] **Step 4: Commit**

```bash
git add js/scenes/XPengRunScene.js
git commit -m "feat: add shield item spawning logic"
```

---

### Task 5: XPengRunScene.js - 添加护盾更新和碰撞检测

**Files:**
- Modify: `js/scenes/XPengRunScene.js` (update方法中的物品更新循环)

- [ ] **Step 1: 添加护盾更新和碰撞循环**

在电池更新循环（第275-291行）之后添加护盾道具更新循环：

```javascript
        for (let i = this.shieldItems.length - 1; i >= 0; i--) {
            const si = this.shieldItems[i];
            si.x -= moveAmount;
            if (si.x + si.w < -50) {
                this.shieldItems.splice(i, 1);
                continue;
            }
            const hb = this._getPlayerHitbox();
            if (CollisionSystem.aabb(hb, si)) {
                this.shieldItems.splice(i, 1);
                this.player.activateShield(10);
                this.audio.playSFX('COLLECT');
                this.particles.emit(si.x + si.w/2, si.y + si.h/2, {
                    count: 20, spreadX: 150, spreadY: 150, life: 0.6, size: 4,
                    colors: ['#00ddff', '#88eeff', '#4facfe'], shape: 'circle'
                });
            }
        }
```

- [ ] **Step 2: 修改障碍物碰撞检测，加入护盾处理**

找到障碍物碰撞检测部分（第260-272行），修改为：
```javascript
            if (!obs.hit && p.invincibleTimer <= 0) {
                const hb = this._getPlayerHitbox();
                if (CollisionSystem.aabb(hb, obs)) {
                    if (obs.avoidBy === 'jump' && this.jumpTimer > 0) continue;
                    if (obs.avoidBy === 'crouch' && this.crouchTimer > 0) continue;
                    
                    if (p.shieldActive && p.shieldTimer > 0) {
                        obs.hit = true;
                        p.shieldActive = false;
                        p.shieldTimer = 0;
                        p.invincibleTimer = 1.0;
                        this.audio.playSFX('COLLECT');
                        this.particles.emit(hb.x + hb.w/2, hb.y + hb.h/2, {
                            count: 15, spreadX: 100, spreadY: 100, life: 0.5, size: 3,
                            colors: ['#00ddff', '#88eeff'], shape: 'circle'
                        });
                    } else {
                        obs.hit = true;
                        this.stamina -= CONFIG.XPENG.DAMAGE_OBSTACLE;
                        this.audio.playSFX('HURT');
                        this.particles.emitExplosion(hb.x + hb.w/2, hb.y + hb.h/2);
                        this.renderer.shake(10, 0.3);
                        p.takeDamage(0);
                    }
                }
            }
```

- [ ] **Step 3: Commit**

```bash
git add js/scenes/XPengRunScene.js
git commit -m "feat: add shield collision detection and obstacle shield interaction"
```

---

### Task 6: XPengRunScene.js - 添加车辆终点机制（预警和目标车道选择）

**Files:**
- Modify: `js/scenes/XPengRunScene.js` (update方法中的时间判断逻辑)

- [ ] **Step 1: 修改时间到的胜利逻辑，改为车辆出现机制**

找到原来的时间胜利逻辑（第304-308行），替换为完整的车辆机制。先在update中添加预警逻辑：

在stamina检查（第297-302行）之后，原来的胜利逻辑之前，添加：

```javascript
        const timeLeft = CONFIG.XPENG.DURATION - this._time;
        
        if (timeLeft <= 10 && this._xpengCarPhase === 'waiting') {
            if (this._targetLane === -1) {
                this._targetLane = Math.floor(Math.random() * CONFIG.XPENG.LANES.length);
            }
            this._xpengCarPhase = 'warning';
        }

        if (timeLeft <= 0 && this._xpengCarPhase === 'warning') {
            this._xpengCarPhase = 'arriving';
            const targetLane = CONFIG.XPENG.LANES[this._targetLane];
            this._xpengCar = {
                x: CONFIG.CANVAS_WIDTH + 100,
                y: targetLane.y - 100,
                w: 200,
                h: 120,
                lane: this._targetLane,
                speed: this.speed * 1.2,
                passed: false
            };
        }

        if (this._xpengCarPhase === 'arriving' && this._xpengCar) {
            this._xpengCar.x -= this._xpengCar.speed * dt;
            const hb = this._getPlayerHitbox();
            const carHb = { x: this._xpengCar.x, y: this._xpengCar.y, w: this._xpengCar.w, h: this._xpengCar.h };
            
            if (CollisionSystem.aabb(hb, carHb)) {
                if (this.currentLane === this._targetLane) {
                    this.victory = true;
                    this.endTimer = 0;
                    this.audio.playSFX('VICTORY');
                    p.playVictory();
                    this._xpengCarPhase = 'victory';
                } else {
                    this.gameOver = true;
                    this.endTimer = 0;
                    this.deathReason = 'missed_xpeng';
                    this.audio.playSFX('DIE');
                    p.die();
                    this.particles.emitExplosion(p.x + p.w/2, p.y + p.h/2);
                    this._xpengCarPhase = 'failed';
                }
            }
            
            if (this._xpengCar.x + this._xpengCar.w < -100 && !this.victory && !this.gameOver) {
                this.gameOver = true;
                this.endTimer = 0;
                this.deathReason = 'missed_xpeng';
                this.audio.playSFX('DIE');
                p.die();
                this._xpengCarPhase = 'failed';
            }
        }
```

- [ ] **Step 2: 删除或注释原来的简单胜利逻辑**

删除原来的第304-308行：
```javascript
        if (this._time >= CONFIG.XPENG.DURATION && !this.victory && !this.gameOver) {
            this.victory = true;
            this.audio.playSFX('VICTORY');
            p.playVictory();
        }
```

- [ ] **Step 3: 修改游戏结束/胜利的等待时间**

找到第99行：
```javascript
            if (this.endTimer > 2.0) {
```
改为：
```javascript
            const waitTime = this.victory ? 2.5 : 2.0;
            if (this.endTimer > waitTime) {
```

同时修改gameOver的reason传递（第108-110行）：
```javascript
                    this.changeScene(CONFIG.SCENES.GAME_OVER, {
                        gender: this.gender, level: 'xpeng', reason: this.deathReason || 'stamina'
                    });
```

- [ ] **Step 4: 在胜利等待期间发射粒子**

在gameOver/victory处理块（第96-113行）中，victory时添加粒子发射：
```javascript
        if (this.gameOver || this.victory) {
            this.endTimer += dt;
            if (this.victory && !this._victoryParticlesEmitted) {
                this._victoryParticlesEmitted = true;
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => {
                        this.particles.emitCollect(
                            200 + Math.random() * (CONFIG.CANVAS_WIDTH - 400),
                            200 + Math.random() * 600
                        );
                    }, i * 50);
                }
            }
            this.particles.update(dt);
```

- [ ] **Step 5: 在构造函数添加deathReason初始化**

在构造函数中添加：
```javascript
        this.deathReason = null;
```

在enter()中添加：
```javascript
        this.deathReason = null;
```

- [ ] **Step 6: Commit**

```bash
git add js/scenes/XPengRunScene.js
git commit -m "feat: implement XPeng car arrival mechanism with warning and collision"
```

---

### Task 7: XPengRunScene.js - 更新HUD调用，传递护盾时间

**Files:**
- Modify: `js/scenes/XPengRunScene.js:488`

- [ ] **Step 1: 修改hud.render调用**

找到第488行：
```javascript
        this.hud.render(ctx, this.stamina, CONFIG.PLAYER.MAX_STAMINA, 'xpeng');
```
改为：
```javascript
        this.hud.render(ctx, this.stamina, CONFIG.PLAYER.MAX_STAMINA, 'xpeng', this.player.shieldTimer || 0);
```

- [ ] **Step 2: Commit**

```bash
git add js/scenes/XPengRunScene.js
git commit -m "fix: pass shield timer to HUD in XPeng scene"
```

---

### Task 8: XPengRunScene.js - 添加渲染改进（预警、车辆、护盾道具）

**Files:**
- Modify: `js/scenes/XPengRunScene.js` (render方法)

- [ ] **Step 1: 修改车道渲染，支持目标车道绿色闪烁**

找到车道渲染循环（第407-440行），修改其中的地面线颜色逻辑。替换整个for循环：

```javascript
        for (let li = 0; li < CONFIG.XPENG.LANES.length; li++) {
            const lane = CONFIG.XPENG.LANES[li];
            const ly = lane.y + lane.h;
            const isActive = this.currentLane === li;
            const isTarget = (this._xpengCarPhase === 'warning' || this._xpengCarPhase === 'arriving') && li === this._targetLane;
            const blink = Math.sin(this._time * 8) > 0;

            ctx.fillStyle = `rgba(50,50,80,${0.5 + li*0.1})`;
            ctx.fillRect(0, ly - 6, w, 10);

            let lineColor;
            if (isTarget && blink) {
                lineColor = 'rgba(0,255,100,0.8)';
            } else if (isActive) {
                lineColor = 'rgba(255,180,0,0.5)';
            } else {
                lineColor = `rgba(255,140,0,${0.12 + li*0.08})`;
            }
            
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = isTarget ? (blink ? 4 : 3) : (isActive ? 3 : (2 + li * 0.5));
            ctx.setLineDash([25, 20]);
            ctx.lineDashOffset = -this._roadMarkOffset;
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(w, ly);
            ctx.stroke();
            ctx.setLineDash([]);

            if (isActive || isTarget) {
                ctx.save();
                ctx.shadowColor = isTarget ? '#00ff66' : '#ffb400';
                ctx.shadowBlur = 15;
                ctx.strokeStyle = isTarget ? (blink ? 'rgba(0,255,100,0.7)' : 'rgba(0,255,100,0.4)') : 'rgba(255,180,0,0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([15, 10]);
                ctx.lineDashOffset = -this._roadMarkOffset * 1.2;
                ctx.beginPath();
                ctx.moveTo(0, ly - 2);
                ctx.lineTo(w, ly - 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }
        }
```

- [ ] **Step 2: 添加护盾道具渲染**

在电池渲染之后（第470行后），玩家渲染之前（第472行前）添加护盾渲染：

```javascript
        for (const si of this.shieldItems) {
            const floatY = Math.sin(this._time * 2.5 + si.floatPhase) * 10;
            const drawX = si.x;
            const drawY = si.y + floatY;
            ctx.save();
            const pulse = 0.7 + Math.sin(this._time * 4) * 0.3;
            ctx.shadowColor = '#00ddff';
            ctx.shadowBlur = 20 * pulse;
            ctx.fillStyle = 'rgba(0,120,200,0.9)';
            ctx.beginPath();
            ctx.arc(drawX + si.w/2, drawY + si.h/2, si.w/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#88eeff';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(drawX + si.w/2 - 4, drawY + 8, 8, si.h - 16);
            ctx.fillRect(drawX + 10, drawY + si.h/2 - 4, si.w - 20, 8);
            ctx.restore();
        }
```

- [ ] **Step 3: 添加小鹏汽车渲染**

在护盾道具渲染之后，玩家渲染之前添加：

```javascript
        if (this._xpengCar && (this._xpengCarPhase === 'arriving' || this._xpengCarPhase === 'victory' || this._xpengCarPhase === 'failed')) {
            const car = assets.getSprite('UI_XPENG_CAR');
            if (car && car.image) {
                ctx.drawImage(car.image, this._xpengCar.x, this._xpengCar.y, this._xpengCar.w, this._xpengCar.h);
            } else {
                ctx.save();
                ctx.fillStyle = '#1a73e8';
                ctx.fillRect(this._xpengCar.x, this._xpengCar.y + 20, this._xpengCar.w - 20, this._xpengCar.h - 40);
                ctx.fillStyle = '#0d47a1';
                ctx.beginPath();
                ctx.moveTo(this._xpengCar.x + 30, this._xpengCar.y + 20);
                ctx.lineTo(this._xpengCar.x + 60, this._xpengCar.y);
                ctx.lineTo(this._xpengCar.x + this._xpengCar.w - 50, this._xpengCar.y);
                ctx.lineTo(this._xpengCar.x + this._xpengCar.w - 20, this._xpengCar.y + 20);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'rgba(150,220,255,0.6)';
                ctx.fillRect(this._xpengCar.x + 70, this._xpengCar.y + 10, this._xpengCar.w - 120, 25);
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(this._xpengCar.x + 40, this._xpengCar.y + this._xpengCar.h - 25, 18, 0, Math.PI*2);
                ctx.arc(this._xpengCar.x + this._xpengCar.w - 50, this._xpengCar.y + this._xpengCar.h - 25, 18, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath();
                ctx.arc(this._xpengCar.x + this._xpengCar.w - 25, this._xpengCar.y + 50, 8, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        }
```

- [ ] **Step 4: 添加预警文字和箭头渲染**

在HUD渲染之前或时间显示之后添加预警UI。在时间显示（第504行）之后添加：

```javascript
        if (this._xpengCarPhase === 'warning' && timeLeft > 0) {
            const blink = Math.sin(this._time * 6) > 0;
            const targetLaneNum = this._targetLane + 1;
            
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(w/2 - 280, 80, 560, 60);
            ctx.strokeStyle = blink ? '#ffcc00' : '#ff9900';
            ctx.lineWidth = 3;
            ctx.strokeRect(w/2 - 280, 80, 560, 60);
            ctx.fillStyle = blink ? '#ffff00' : '#ffcc00';
            ctx.font = 'bold 28px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText(`⚠ 小鹏汽车即将出现！注意第${targetLaneNum}车道！`, w/2, 120);
            ctx.restore();

            const targetLane = CONFIG.XPENG.LANES[this._targetLane];
            ctx.save();
            ctx.fillStyle = blink ? 'rgba(255,220,0,0.9)' : 'rgba(255,180,0,0.7)';
            ctx.font = 'bold 32px "Courier New"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 20;
            ctx.fillText('↓ 目标车道 ↓', w/2, targetLane.y - 40);
            ctx.restore();
        }
```

- [ ] **Step 5: 修改胜利时的半透明背景覆盖**

在render方法末尾，gameOver红色覆盖之前（第537行前）添加胜利画面：

```javascript
        if (this.victory) {
            const endBg = assets.getSprite('BG_XPENG_ENDING');
            ctx.save();
            ctx.globalAlpha = 0.85;
            if (endBg && endBg.image) {
                ctx.drawImage(endBg.image, 0, 0, w, h);
            } else {
                const gradient = ctx.createLinearGradient(0, 0, 0, h);
                gradient.addColorStop(0, '#0a2040');
                gradient.addColorStop(0.5, '#1a4080');
                gradient.addColorStop(1, '#0a3060');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
            }
            ctx.restore();
            
            ctx.save();
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 30;
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 64px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('成功逃离！', w/2, h/2 - 50);
            ctx.restore();
        }
```

- [ ] **Step 6: 增大所有UI文字大小15-20%**

修改文字大小：
- 剩余时间：第501行 `'bold 28px "Courier New"'` 改为 `'bold 32px "Courier New"'`
- 速度：第510行 `'bold 20px "Courier New"'` 改为 `'bold 24px "Courier New"'`
- 操作提示：第519行 `'16px "Courier New"'` 改为 `'20px "Courier New"'`

- [ ] **Step 7: Commit**

```bash
git add js/scenes/XPengRunScene.js
git commit -m "feat: add rendering for warnings, XPeng car, shield items, and victory screen"
```

---

### Task 9: 重写 WinScene.js - 关卡特定胜利画面

**Files:**
- Modify: `js/scenes/WinScene.js`

- [ ] **Step 1: 修改render方法中的背景使用**

找到第63-67行：
```javascript
        if (this._data.level === 'tencent') {
            assets.drawBackground(ctx, 'BG_TENCENT_TECH', this._time);
        } else {
            assets.drawBackground(ctx, 'BG_XPENG_STAGE1', this._time);
        }
```
改为：
```javascript
        if (this._data.level === 'tencent') {
            assets.drawBackground(ctx, 'BG_TENCENT_TECH', this._time);
        } else {
            const endBg = assets.getSprite('BG_XPENG_ENDING');
            if (endBg && endBg.image) {
                ctx.drawImage(endBg.image, 0, 0, w, h);
            } else {
                const gradient = ctx.createLinearGradient(0, 0, 0, h);
                gradient.addColorStop(0, '#0a2040');
                gradient.addColorStop(0.5, '#1a4080');
                gradient.addColorStop(1, '#0a3060');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
            }
        }
```

- [ ] **Step 2: 修改大标题**

找到第91行：
```javascript
        ctx.fillText('通关成功！', w/2, by + 90);
```
改为：
```javascript
        if (this._data.level === 'xpeng') {
            ctx.fillText('🏆 成功逃离！', w/2, by + 90);
        } else {
            ctx.fillText('通关成功！', w/2, by + 90);
        }
```

- [ ] **Step 3: 替换腾讯关卡感谢文字，增加剧情**

找到第118-131行，替换为：
```javascript
        if (this._data.level === 'tencent') {
            const thanks = [
                '🐧 太好了！我的系统恢复正常了！',
                '感谢你找回了所有6个核心模块！',
                '企鹅被修复了，它告诉你腾讯大楼的系统已经恢复正常',
                '作为感谢，企鹅送给你一份特殊的工程师认证徽章',
                '两个关卡都完成了，你成为了真正的卓越工程师！',
                '你是一位真正的卓越工程师！'
            ];
            ctx.fillStyle = '#90ee90';
            ctx.font = '22px "Courier New"';
            let ty = by + 350;
            for (const line of thanks) {
                ctx.fillText(line, w/2, ty);
                ty += 28;
            }
        } else if (this._data.level === 'xpeng') {
            const story = [
                '你成功驾驶小鹏汽车逃离了充电站！',
                '出色的驾驶技术证明了你是真正的卓越工程师！',
                '未来的科技之路，由你领航！'
            ];
            ctx.fillStyle = '#88ccff';
            ctx.font = '24px "Courier New"';
            let ty = by + 350;
            for (const line of story) {
                ctx.fillText(line, w/2, ty);
                ty += 34;
            }
        }
```

- [ ] **Step 4: 调整其他文字大小（增大15-20%）**

修改：
- 关卡名称：第96行 `'28px "Courier New"'` 改为 `'32px "Courier New"'`
- 用时/统计：第101行 `'24px "Courier New"'` 改为 `'28px "Courier New"'`
- 评价：第115行 `'bold 32px "Courier New"'` 改为 `'bold 38px "Courier New"'`
- 按钮文字适当增大

- [ ] **Step 5: Commit**

```bash
git add js/scenes/WinScene.js
git commit -m "feat: enhance win screens with level-specific stories and XPeng ending"
```

---

### Task 10: 重写 TencentIntroScene.js - 丰富对话系统

**Files:**
- Modify: `js/scenes/TencentIntroScene.js` (完全重写对话逻辑)

- [ ] **Step 1: 重写整个TencentIntroScene类**

将整个文件内容替换为：

```javascript
class TencentIntroScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.t = 0;
        this.gender = 'male';
        this.dialogueSystem = null;
    }
    enter(data) {
        this.t = 0;
        this.gender = data?.gender || 'male';
        this._initDialogue();
        this.audio.playBGM('TENCENT');
    }

    _initDialogue() {
        this.dialogueSystem = {
            active: true,
            currentLine: 0,
            lines: [
                { speaker: 'narrator', text: '你来到了深圳腾讯滨海大厦的门口...' },
                { speaker: 'penguin', text: '哔...哔...紧急求救！有工程师在吗？' },
                { speaker: 'player', text: '是企鹅QQ！你怎么了？' },
                { speaker: 'penguin', text: '大厦核心系统突发故障！病毒入侵了！' },
                { speaker: 'penguin', text: '我的6个核心模块散落在大楼各处——' },
                { speaker: 'penguin', text: '微信、QQ、游戏、云、内容、技术六大事业群！' },
                { speaker: 'player', text: '别担心！我这就进去帮你找回所有模块！' },
                { speaker: 'penguin', text: '太感谢了！小心病毒，它们很危险！' },
                { speaker: 'narrator', text: '你深吸一口气，走进了腾讯大厦...' }
            ],
            lineTimer: 0,
            lineDuration: 0.05,
            charIndex: 0,
            waitingForInput: false
        };
    }

    _advanceDialogue() {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        if (ds.waitingForInput) {
            ds.currentLine++;
            ds.charIndex = 0;
            ds.lineTimer = 0;
            ds.waitingForInput = false;
            if (ds.currentLine >= ds.lines.length) {
                ds.active = false;
                this.changeScene(CONFIG.SCENES.TENCENT_LOBBY, { gender: this.gender });
            }
        }
    }

    _skipDialogue() {
        if (!this.dialogueSystem) return;
        this.dialogueSystem.active = false;
        this.audio.playSFX('BUTTON_CLICK');
        this.changeScene(CONFIG.SCENES.TENCENT_LOBBY, { gender: this.gender });
    }

    _updateDialogue(dt) {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        const line = ds.lines[ds.currentLine];
        if (!line) return;

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this._skipDialogue();
            return;
        }

        if (!ds.waitingForInput) {
            ds.lineTimer += dt;
            if (ds.lineTimer >= ds.lineDuration) {
                ds.lineTimer = 0;
                ds.charIndex++;
                if (ds.charIndex >= line.text.length) {
                    ds.charIndex = line.text.length;
                    ds.waitingForInput = true;
                }
            }
        }

        if (ds.waitingForInput) {
            if (this.input.isJustPressed(CONFIG.KEYS.JUMP) || this.input.isJustPressed(CONFIG.KEYS.ENTER) ||
                this.input.isJustPressed(CONFIG.KEYS.SPACE) || this.input.mouseJustClicked ||
                this.input.isJustPressed(CONFIG.KEYS.W) || this.input.isJustPressed(CONFIG.KEYS.UP)) {
                this._advanceDialogue();
                this.audio.playSFX('BUTTON_CLICK');
            }
        }
    }

    _drawDialogue(ctx) {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        const line = ds.lines[ds.currentLine];
        if (!line) return;

        const w = CONFIG.CANVAS_WIDTH;
        const h = CONFIG.CANVAS_HEIGHT;

        const boxW = 900;
        const boxH = 180;
        const boxX = (w - boxW) / 2;
        const boxY = h - boxH - 60;

        ctx.save();
        
        ctx.fillStyle = 'rgba(10, 25, 50, 0.95)';
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();

        let speakerName = '';
        let speakerColor = '#4facfe';
        if (line.speaker === 'penguin') {
            speakerName = '🐧 企鹅QQ';
            speakerColor = '#4facfe';
        } else if (line.speaker === 'player') {
            speakerName = this.gender === 'male' ? '👨‍💻 男工程师' : '👩‍💻 女工程师';
            speakerColor = '#ffd700';
        } else {
            speakerName = '📖 旁白';
            speakerColor = '#aaaaaa';
        }

        ctx.fillStyle = speakerColor;
        ctx.font = 'bold 26px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(speakerName, boxX + 30, boxY + 45);

        ctx.strokeStyle = 'rgba(100,180,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + 30, boxY + 60);
        ctx.lineTo(boxX + boxW - 30, boxY + 60);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '26px "Courier New"';
        const displayText = line.text.substring(0, ds.charIndex);
        this._wrapText(ctx, displayText, boxX + 30, boxY + 100, boxW - 60, 36);

        if (ds.waitingForInput) {
            const blink = Math.sin(this.t * 4) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = '22px "Courier New"';
                ctx.textAlign = 'right';
                ctx.fillText('▼ 按空格继续 | ESC跳过', boxX + boxW - 30, boxY + boxH - 25);
            }
        }
        ctx.restore();
    }

    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';
        let curY = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, curY);
                line = words[n];
                curY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, curY);
    }

    update(dt) {
        this.t += dt;
        this._updateDialogue(dt);
        this.particles.update(dt);
        if (Math.random() < 0.5) {
            const px = Math.random() * CONFIG.CANVAS_WIDTH;
            this.particles.emit(px, -10, {
                count: 1, spreadX: 20, spreadY: 0, life: 2, size: 3,
                colors: ['#4facfe', '#00f2fe', '#88ddff'], gravity: 80, shape: 'circle'
            });
        }
    }
    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;
        assets.drawBackground(ctx, 'BG_TENCENT_LOBBY', this.t);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#4facfe';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 38px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('── 第一关：腾讯滨海大厦 ──', w/2, 120);
        ctx.restore();

        ctx.save();
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 56px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('系统危机', w/2, 200);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#cce7ff';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('WASD/方向键移动  |  空格跳跃(可二段跳)  |  S键下蹲', w/2, 280);
        ctx.fillText('收集6个模块修复企鹅，小心病毒！', w/2, 320);
        ctx.restore();

        this._drawDialogue(ctx);
        this.particles.render(ctx);
    }
}
```

- [ ] **Step 2: 验证语法正确**

检查代码没有语法错误，所有大括号匹配。

- [ ] **Step 3: Commit**

```bash
git add js/scenes/TencentIntroScene.js
git commit -m "feat: rewrite Tencent intro with 9-line dialogue system and ESC skip"
```

---

### Task 11: 重写 XPengIntroScene.js - 丰富对话系统

**Files:**
- Modify: `js/scenes/XPengIntroScene.js` (完全重写对话逻辑)

- [ ] **Step 1: 重写整个XPengIntroScene类**

将整个文件内容替换为：

```javascript
class XPengIntroScene {
    constructor(renderer, input, audio, particles, changeScene) {
        this.renderer = renderer; this.input = input; this.audio = audio;
        this.particles = particles; this.changeScene = changeScene;
        this.t = 0;
        this.gender = 'male';
        this.dialogueSystem = null;
    }
    enter(data) {
        this.t = 0;
        this.gender = data?.gender || 'male';
        this._initDialogue();
        this.audio.playBGM('XPENG');
    }

    _initDialogue() {
        this.dialogueSystem = {
            active: true,
            currentLine: 0,
            lines: [
                { speaker: 'narrator', text: '离开腾讯后，你来到了广州小鹏智造工厂...' },
                { speaker: 'narrator', text: '工厂的自动化产线突然失控了！' },
                { speaker: 'player', text: '不好！充电桩过载，障碍物到处都是！' },
                { speaker: 'narrator', text: '你必须在自动奔跑中躲避各种危险！' },
                { speaker: 'narrator', text: '收集电池补充体力，坚持2分钟！' },
                { speaker: 'narrator', text: '最后10秒会预警救援车辆所在的车道——' },
                { speaker: 'narrator', text: '切换到正确车道碰到车辆才算成功逃离！' },
                { speaker: 'player', text: '明白了！看我的！' },
                { speaker: 'narrator', text: '你深吸一口气，踏上了充电产线...' }
            ],
            lineTimer: 0,
            lineDuration: 0.05,
            charIndex: 0,
            waitingForInput: false
        };
    }

    _advanceDialogue() {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        if (ds.waitingForInput) {
            ds.currentLine++;
            ds.charIndex = 0;
            ds.lineTimer = 0;
            ds.waitingForInput = false;
            if (ds.currentLine >= ds.lines.length) {
                ds.active = false;
                this.changeScene(CONFIG.SCENES.XPENG_RUN, { gender: this.gender });
            }
        }
    }

    _skipDialogue() {
        if (!this.dialogueSystem) return;
        this.dialogueSystem.active = false;
        this.audio.playSFX('BUTTON_CLICK');
        this.changeScene(CONFIG.SCENES.XPENG_RUN, { gender: this.gender });
    }

    _updateDialogue(dt) {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        const line = ds.lines[ds.currentLine];
        if (!line) return;

        if (this.input.isJustPressed(CONFIG.KEYS.ESC)) {
            this._skipDialogue();
            return;
        }

        if (!ds.waitingForInput) {
            ds.lineTimer += dt;
            if (ds.lineTimer >= ds.lineDuration) {
                ds.lineTimer = 0;
                ds.charIndex++;
                if (ds.charIndex >= line.text.length) {
                    ds.charIndex = line.text.length;
                    ds.waitingForInput = true;
                }
            }
        }

        if (ds.waitingForInput) {
            if (this.input.isJustPressed(CONFIG.KEYS.JUMP) || this.input.isJustPressed(CONFIG.KEYS.ENTER) ||
                this.input.isJustPressed(CONFIG.KEYS.SPACE) || this.input.mouseJustClicked ||
                this.input.isJustPressed(CONFIG.KEYS.W) || this.input.isJustPressed(CONFIG.KEYS.UP)) {
                this._advanceDialogue();
                this.audio.playSFX('BUTTON_CLICK');
            }
        }
    }

    _drawDialogue(ctx) {
        if (!this.dialogueSystem || !this.dialogueSystem.active) return;
        const ds = this.dialogueSystem;
        const line = ds.lines[ds.currentLine];
        if (!line) return;

        const w = CONFIG.CANVAS_WIDTH;
        const h = CONFIG.CANVAS_HEIGHT;

        const boxW = 900;
        const boxH = 180;
        const boxX = (w - boxW) / 2;
        const boxY = h - boxH - 60;

        ctx.save();
        
        ctx.fillStyle = 'rgba(20, 15, 35, 0.95)';
        ctx.strokeStyle = '#ff8c00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();

        let speakerName = '';
        let speakerColor = '#ff8c00';
        if (line.speaker === 'player') {
            speakerName = this.gender === 'male' ? '👨‍💻 男工程师' : '👩‍💻 女工程师';
            speakerColor = '#ffd700';
        } else {
            speakerName = '📖 旁白';
            speakerColor = '#ffaa55';
        }

        ctx.fillStyle = speakerColor;
        ctx.font = 'bold 26px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(speakerName, boxX + 30, boxY + 45);

        ctx.strokeStyle = 'rgba(255,180,100,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + 30, boxY + 60);
        ctx.lineTo(boxX + boxW - 30, boxY + 60);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '26px "Courier New"';
        const displayText = line.text.substring(0, ds.charIndex);
        this._wrapText(ctx, displayText, boxX + 30, boxY + 100, boxW - 60, 36);

        if (ds.waitingForInput) {
            const blink = Math.sin(this.t * 4) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = '22px "Courier New"';
                ctx.textAlign = 'right';
                ctx.fillText('▼ 按空格继续 | ESC跳过', boxX + boxW - 30, boxY + boxH - 25);
            }
        }
        ctx.restore();
    }

    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';
        let curY = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, curY);
                line = words[n];
                curY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, curY);
    }

    update(dt) {
        this.t += dt;
        this._updateDialogue(dt);
        this.particles.update(dt);
        if (Math.random() < 0.6) {
            const py = Math.random() * CONFIG.CANVAS_HEIGHT;
            this.particles.emit(CONFIG.CANVAS_WIDTH + 20, py, {
                count: 1, spreadX: 0, spreadY: 10, life: 0.6, size: 3,
                colors: ['#ff8c00', '#ffa500', '#ffcc00', '#fff'], gravity: 0, shape: 'rect'
            });
        }
    }
    render() {
        const ctx = this.renderer.ctx, w = CONFIG.CANVAS_WIDTH, h = CONFIG.CANVAS_HEIGHT;
        const assets = window.Game.assets;
        assets.drawBackground(ctx, 'BG_XPENG_STAGE1', this.t);
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = '#ff8c00';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#ff8c00';
        ctx.font = 'bold 38px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('── 第二关：小鹏智造工厂 ──', w/2, 120);
        ctx.restore();

        ctx.save();
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 56px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('极速救援', w/2, 200);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#ffddb0';
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('空格/W/↑跳跃  |  S/↓下蹲躲高障碍  |  ←→/AD切换车道', w/2, 280);
        ctx.fillText('坚持2分钟，最后10秒注意预警车道！', w/2, 320);
        ctx.restore();

        this._drawDialogue(ctx);
        this.particles.render(ctx);
    }
}
```

- [ ] **Step 2: 验证语法正确**

检查代码没有语法错误。

- [ ] **Step 3: Commit**

```bash
git add js/scenes/XPengIntroScene.js
git commit -m "feat: rewrite XPeng intro with 9-line dialogue system and ESC skip"
```

---

### Task 12: 最终检查和测试

**Files:**
- 所有修改的文件

- [ ] **Step 1: 检查XPengRunScene中删除了原来的半透明车**

找到原来第389-397行的半透明车渲染代码，因为现在车辆会实际出现，需要删除或注释掉这段装饰性代码：

```javascript
        // 删除或注释掉这段旧的装饰性车辆代码
        /*
        const car = assets.getSprite('UI_XPENG_CAR');
        if (car && car.image) {
            const carX = w - 350 + Math.sin(this._time * 0.5) * 5;
            const carY = CONFIG.XPENG.GROUND_Y - 100;
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.drawImage(car.image, carX, carY, 320, 170);
            ctx.restore();
        }
        */
```

- [ ] **Step 2: 运行游戏测试所有功能**

在浏览器中打开 index.html，测试：
1. 腾讯关卡入场对话 - 9句对话，ESC跳过，空格推进
2. 腾讯关卡HUD显示体力和护盾
3. 小鹏关卡入场对话 - 9句对话，ESC跳过，空格推进
4. 小鹏关卡护盾道具生成和拾取
5. 小鹏关卡护盾挡伤害
6. 小鹏关卡最后10秒预警
7. 小鹏关卡车辆出现和碰撞
8. 正确车道碰车胜利
9. 错误车道碰车/错过车辆失败 (reason='missed_xpeng')
10. 两个关卡胜利画面正确显示剧情

- [ ] **Step 3: 检查文字大小是否都增大了**

确认所有UI文字正文至少20px以上，标题更大。

- [ ] **Step 4: 最终Commit**

```bash
git add -A
git commit -m "feat: complete all game enhancements - XPeng car ending, shields, dialogues, win screens"
```

---

## 自检清单

1. **Spec覆盖：**
   - ✓ 车辆终点机制（预警、车道选择、碰撞、胜负判定）
   - ✓ 护盾道具（生成、拾取、挡伤害）
   - ✓ 难度递增（体力消耗改为1.0）
   - ✓ 胜利画面（2.5秒等待、粒子、背景）
   - ✓ 护盾HUD显示
   - ✓ 渲染改进（预警文字、绿色闪烁车道、车辆、护盾）
   - ✓ WinScene小鹏/腾讯各自剧情
   - ✓ Intro场景6-9句对话+ESC跳过
   - ✓ TencentLobbyScene HUD修复
   - ✓ 所有sprite key有fallback绘制
   - ✓ 文字大小增大
   - ✓ 使用CollisionSystem.aabb

2. **无占位符：** 所有步骤都有完整代码，没有TBD/TODO

3. **类型一致性：**
   - p.activateShield(10) - 正确
   - p.shieldTimer/p.shieldActive - 正确
   - CollisionSystem.aabb - 正确
   - this.hud.render(ctx, stamina, max, mode, shieldTime) - 正确
