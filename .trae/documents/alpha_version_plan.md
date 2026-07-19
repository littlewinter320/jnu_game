# 《卓越工程师大冒险》Alpha版本实现计划

> **Goal:** 构建一个可玩的Alpha版本——完成从启动→主菜单→角色选择→关卡选择→两个可玩跑酷关卡（腾讯大堂横版平台跳跃 + 小鹏充电桩自动跑酷）→胜利/失败的完整游戏流程。具备BGM+SFX音效、角色动画（男女各14个动作）、ping-pong动态背景、平台跳跃/闪避、道具收集、障碍物躲避、体力系统、HUD、操作说明、制作人员名单等完整功能。每个关卡至少保证1-2分钟游玩长度，所有提供的素材充分利用。

**完整游戏流程：**
```
BootScene(加载中)
  → MainMenuScene(开始游戏/操作说明/制作人员/结束游戏 + ping-pong动画背景 + BGM)
    → CharacterSelectScene(男/女选择，spritesheet待机动画展示)
      → LevelSelectScene(腾讯大堂卡/小鹏充电桩卡片选择)
        → TencentLobbyScene(横版平台跑酷：收集6事业群道具通关，约2分钟)
        → XPengRunScene(自动跑酷：坚持120秒/速度递增/电池续体力，约2分钟)
          → WinScene/GameOverScene(胜利/失败 + 重开/返回)
    → CreditsScene(制作人员名单)
```

**Architecture:**
1. **素材处理层**：编写Python脚本自动裁剪UI元素集/障碍物集/道具集，去白底保存为透明PNG；裁剪Q版男女角色图；更新manifest注册所有素材。
2. **引擎修复**：修复角色动画加载Bug（JSON结构不匹配、帧坐标错误、动画名映射、尺寸自适应）；实现背景ping-pong循环；Web Audio API程序化音效系统。
3. **场景实现**：
   - MainMenuScene：5按钮全部可用（开始/说明/制作人员/设置/结束）+ 操作说明弹窗
   - CreditsScene：制作人员名单（制作人/美术/音乐）
   - CharacterSelectScene：动态spritesheet待机动画+性别头像选择
   - LevelSelectScene：腾讯/小鹏两张卡片均解锁可进入
   - TencentLobbyScene：横版卷轴平台跑酷，8000px预生成关卡，7区域主题，6道具+电池+高低障碍
   - XPengRunScene：强制卷轴自动跑酷，速度400→900递增，激光/电缆/充电桩3类障碍，电池续跑120秒
4. **音频**：BGM《科技冒险双关》循环播放 + 12种程序化SFX音效（跳跃/收集/受伤/胜利等）。
5. **HUD**：体力条4色渐变+道具槽/速度表，低体力红色闪烁脉动。

**Tech Stack:** HTML5 Canvas 2D, 原生JavaScript ES6+, Python PIL/numpy（素材处理）, Web Audio API

---

## 发现的关键Bug（必须修复）

1. **AssetLoader._loadCharacterSheet** 期望 `animMeta.animations` 对象，但实际JSON直接在顶层包含动画键（idle, run_left等）——导致角色动画无法加载，显示红色占位框
2. **drawCharacter** 使用 `fi * anim.frameWidth` 计算帧x坐标，但JSON中每个帧有精确的 `x/y/w/h` 字段——导致帧裁切错误
3. **Player._resolveAnimName** 中 `case 'jump'` 返回 `'jump'`，但JSON中动画名是 `'jump_start'`——动画名不匹配
4. **Player.render** 使用硬编码 `80*72` 计算缩放，但男角色帧是 92×79，女角色是 112×80
5. **背景循环**是简单循环（0-7-0-7），需要改为ping-pong（0-7-6-...-1-0-1-...）

---

## Task 1: 素材处理脚本更新与新素材裁剪

**Files:**
- Create: `scripts/process_ui_set.py`（裁剪UI素材集）
- Create: `scripts/process_obstacles.py`（裁剪障碍物素材集）
- Modify: `scripts/process_bg.py`（更新背景帧源路径+生成ping-pong帧）
- Modify: `assets/images/ui/`（新增裁剪后的UI元素）
- Modify: `assets/images/obstacles/`（新增裁剪后的障碍物）
- Modify: `assets/sounds/bgm/`（确认BGM文件）

### Step 1: 创建UI素材集裁剪脚本

UI Set 1（鎵规_05）有10个元素，UI Set 2（鎵规_06）有10个元素。每个元素由白色间隙分隔。编写脚本自动检测非白色区域连通块，裁剪每个独立元素并保存。

```python
# scripts/process_ui_set.py
# 裁剪鎵规_05_UI绱犳潗_01.png 和 鎵规_06_UI绱犳潗_02.png
# 输出到 assets/images/ui/
```

需要裁剪出的元素：
- Set 1: `ui_gender_male.png`, `ui_gender_female.png`, `ui_stamina_bar_bg.png`, `ui_stamina_bar_fill_green.png`, `ui_stamina_bar_fill_yellow.png`, `ui_stamina_bar_fill_orange.png`, `ui_stamina_bar_fill_red.png`, `ui_prop_slot_empty.png`, `ui_prop_slot_filled.png`, `ui_card_tencent.png`
- Set 2: `ui_card_xpeng.png`, `ui_card_back.png`, `ui_penguin_broken.png`, `ui_penguin_fixed.png`, `ui_xpeng_car.png`, `ui_dialog_box.png`, `btn_restart.png`, `btn_menu.png`, `btn_continue.png`, `lock_icon.png`

处理方式：flood fill检测白色间隙，分割连通区域，每个区域自动裁剪，去白底保存为透明PNG。

### Step 2: 创建障碍物素材裁剪脚本

障碍物图02（激光/电缆/充电桩）10个元素、图04（低障/高墙）10个元素。同样使用连通块检测裁剪。

输出到 `assets/images/obstacles/`：
- 激光/电缆/充电桩: `obs_laser_sphere.png`, `obs_laser_cross4.png`, `obs_laser_crossX.png`, `obs_cable_1.png`, `obs_cable_2.png`, `obs_cable_plug.png`, `obs_cable_red.png`, `obs_charger_normal.png`, `obs_charger_damaged.png`, `obs_charger_burning.png`
- 低障高墙: `obs_low_gate.png`, `obs_low_folders.png`, `obs_low_balloons.png`, `obs_low_servers.png`, `obs_low_blocks.png`, `obs_high_glass.png`, `obs_high_ice.png`, `obs_high_arcade.png`, `obs_high_news.png`, `obs_high_pipes.png`

### Step 3: 处理角色选择图片

将 `3387502ef7d8487a7fa1d579cc7a68ec.jpg`（男女像素Q版立绘）裁剪为两个独立头像：
- `char_portrait_male_pixel.png`
- `char_portrait_female_pixel.png`

去白底，保存到 `assets/images/ui/`。

### Step 4: 更新背景处理（ping-pong帧）

由于背景需要01→08→01循环（共14帧一个完整周期：01,02,03,04,05,06,07,08,07,06,05,04,03,02），更新 `process_bg.py` 或者直接在AssetLoader中实现ping-pong逻辑（更高效，不需要额外帧文件）。

**选择方案B：在AssetLoader中实现ping-pong**，不需要重新生成图片。修改 `drawBackground` 方法，使用三角形波函数计算帧索引：
```javascript
const cycle = ab.frames.length * 2 - 2; // ping-pong周期
const pos = Math.floor(time / ab.frameDuration) % cycle;
const idx = pos < ab.frames.length ? pos : cycle - pos;
```

### Step 5: 复制BGM文件确认

确认 `assets/sounds/bgm/bgm_adventure.mp3` 是完整的 `科技冒险双关.mp3`（看起来已经复制过了）。在CONFIG.ASSETS.SOUNDS.BGM中注册。

---

## Task 2: 修复引擎核心Bug

**Files:**
- Modify: `js/engine/AssetLoader.js`（角色动画数据解析+drawCharacter帧坐标+背景ping-pong）
- Modify: `js/entities/Player.js`（动画名映射+帧尺寸适配）
- Modify: `js/config.js`（注册BGM路径，调整PLAYER尺寸）

### Step 1: 修复 _loadCharacterSheet

将 `animMeta.animations` 改为直接遍历 `animMeta`（排除非动画键），使用JSON中每个帧的精确x/y/w/h：

```javascript
for (const [animName, ainfo] of Object.entries(animMeta)) {
    if (!ainfo || !ainfo.frames || !Array.isArray(ainfo.frames)) continue;
    this.charAnims[gender][animName] = {
        image: img,
        frameWidth: ainfo.frameWidth,
        frameHeight: ainfo.frameHeight,
        frames: ainfo.frames,  // 每个frame是 {x,y,w,h}
        animSpeed: ainfo.animSpeed || 0.12,
        loop: ainfo.loop !== false
    };
}
```

### Step 2: 修复 drawCharacter

使用帧的精确x/y/w/h而非简单列索引：

```javascript
const frame = anim.frames[frameIndex % anim.frames.length];
ctx.drawImage(anim.image, frame.x, frame.y, frame.w, frame.h, dx, dy, frame.w*scale, frame.h*scale);
```

### Step 3: 修复背景ping-pong循环

修改drawBackground中的帧索引计算：
```javascript
const n = ab.frames.length;
if (ab.pingPong) {
    const cycle = n * 2 - 2;
    const pos = Math.floor(time / ab.frameDuration) % cycle;
    idx = pos < n ? pos : cycle - pos;
} else {
    idx = Math.floor(time / ab.frameDuration) % n;
}
```

manifest中BG_MAIN_MENU增加 `"pingPong": true`。

### Step 4: 修复Player动画名和尺寸

- `case 'jump'` 返回 `'jump_start'`
- render中根据gender的帧尺寸动态计算：从 `assets.getAnimInfo(gender, animName)` 获取 frameWidth/frameHeight

### Step 5: 注册BGM路径

在CONFIG.ASSETS.SOUNDS.BGM中添加：
```javascript
ADVENTURE: 'assets/sounds/bgm/bgm_adventure.mp3',
MAIN_MENU: 'assets/sounds/bgm/bgm_adventure.mp3',
TENCENT: 'assets/sounds/bgm/bgm_adventure.mp3',
XPENG_STAGE1: 'assets/sounds/bgm/bgm_adventure.mp3'
```

---

## Task 3: 更新assets_manifest.json

**Files:**
- Modify: `assets/assets_manifest.json`

添加所有新裁剪的UI和障碍物素材声明，包括targetWidth/targetHeight。更新BG_MAIN_MENU添加pingPong标志。

关键新增项：
- backgrounds: 添加bg_char_select, bg_level_select, bg_tencent_lobby等（已存在的背景文件需要注册）
- props: 6大事业群道具+体力电池（已存在文件需要注册）
- obstacles: 20+个障碍物（原有+新增裁剪）
- ui: 新增stamina bar、prop slots、cards、buttons、portraits、dialog box、penguin、penguin car、lock等

---

## Task 4: 重写CharacterSelectScene

**Files:**
- Modify: `js/scenes/CharacterSelectScene.js`

使用新UI素材和角色spritesheet实现：
- 背景：使用bg_char_select（或动态主菜单背景）
- 标题："选择你的工程师"
- 左侧男角色卡片（ui_gender_male头像+idle动画预览），右侧女角色卡片
- 选中高亮（蓝色发光边框）
- 键盘←→选择，空格/回车确认
- 鼠标点击选择
- ESC返回主菜单
- 选中后传gender数据到LevelSelectScene

---

## Task 5: 重写LevelSelectScene

**Files:**
- Modify: `js/scenes/LevelSelectScene.js`

使用卡片UI实现：
- 背景：动态主菜单背景（复用BG_MAIN_MENU）
- 标题："选择关卡"
- 左侧腾讯卡片（ui_card_tencent）：3星难度，"腾讯大厦大堂"，显示"进入关卡"绿色按钮
- 右侧小鹏卡片（ui_card_xpeng）：4星难度，"小鹏充电桩"，显示"进入关卡"绿色按钮（不锁定）
- 卡片悬停/选中时发光放大效果
- 键盘←→选择，空格/回车确认进入
- 鼠标点击卡片进入
- ESC返回角色选择
- 腾讯卡片→TENCENT_INTRO（可跳过的简单介绍）→TENCENT_LOBBY
- 小鹏卡片→XPENG_INTRO（可跳过）→XPENG_RUN

---

## Task 6a: 实现可玩的TencentLobbyScene（腾讯大堂-横版平台跑酷）

**Files:**
- Modify: `js/scenes/TencentLobbyScene.js`

Alpha核心玩法1——横版卷轴平台跑酷：

**基础框架：**
- 背景：bg_tencent_lobby，双层视差滚动（远景云/建筑慢0.3x，近景草地/树慢0.7x）
- 地面：使用platform_tiles.png拼接，y=920位置，宽80px瓦片铺满
- 浮空平台：随机生成在不同高度（y=700-500），长度2-5瓦片
- 玩家：Player实例，gender从场景数据中获取，初始位置(200, 800)
- 相机：水平跟随玩家（offsetX=player.x-400），右边界无限延伸
- 关卡长度：8000px（按移动速度300-400px/s计算约需2-2.5分钟，含平台跳跃和道具收集保证1分钟以上）
- 区域划分：每1200px一个区域，共6个区域（lobby→wechat→qq→games→cloud→content→tech→repair），背景色微调暗示区域变化

**控制：**
- ←→/AD：左右移动（vx = ±MOVE_SPEED）
- 空格/W/↑：跳跃（支持二段跳）
- ↓/S/C：下蹲（降低碰撞盒高度，可过矮障碍）
- ESC：暂停（弹出ui_dialog_box + btn_menu/btn_restart）

**生成系统（基于关卡长度8000px预生成，确保每个区域有明确主题和可跳跃路径）：**

使用预生成数组而非随机生成，保证关卡设计可控、可通关：
- 区域0（0-1200px, 大堂/腾讯起点）：地面连续，少量浮空平台（教学级跳台），低障碍obs_low_gate，放置微信道具
- 区域1（1200-2400px, 微信区）：双层浮空平台，低障碍obs_low_folders+obs_low_balloons，高障碍obs_high_pipes，放置QQ道具，电池x1
- 区域2（2400-3600px, QQ区）：三层浮空平台组合，低障碍obs_low_servers，高障碍obs_high_ice，空中电缆obs_cable_plug横亘（需要蹲下过），放置游戏道具，电池x1
- 区域3（3600-4800px, 游戏区）：难度提升，平台间距增大，低障碍obs_low_blocks+obs_low_folders，高障碍obs_high_arcade+obs_high_glass，需要二段跳跨越沟壑，放置云道具，电池x2
- 区域4（4800-6000px, 云/服务区）：中等高度平台，低障碍obs_low_balloons+obs_low_gate，高障碍obs_high_news，放置内容道具，电池x1
- 区域5（6000-7200px, 内容区）：高低平台交错，低障碍obs_low_servers+obs_low_blocks，高障碍obs_high_pipes+obs_high_ice，放置技术道具，电池x2
- 区域6（7200-8000px, 维修区/终点）：简单平台，放置ui_penguin_fixed/企鹅标志，到达即胜利

每个道具放置在**必须跳跃才能到达**的平台上，不是随手可捡，确保有平台跳跃的挑战感。
平台高度差控制在80-160px（玩家跳跃高度约180px，二段跳约320px，保证可达）。
平台间距控制在100-250px（玩家水平速度350px/s，跳跃滞空约0.6s，保证可跨）。
地面沟壑宽度不超过200px（可跳过）。

**碰撞与物理：**
- 平台碰撞：Entity基类已有，重力+地面检测
- 道具碰撞：AABB检测，碰到即收集+playPickup动画+粒子+音效
- 障碍物碰撞：AABB检测，碰到扣20体力+hurt动画+击退(短暂无敌1秒)
- 掉落：y>1200视为掉出地图，扣30体力并重置到最近地面

**体力系统：**
- 初始100，最大100
- 碰障碍-20，掉出-30
- 收集电池+15
- 体力<=0 → die动画 → GameOver
- 体力条颜色：绿(>60)、黄(>30)、橙(>15)、红(<=15)

**胜利条件：**
- 收集齐6个事业群道具 → 显示ui_penguin_fixed + victory动画 → WinScene

---

## Task 6b: 实现可玩的XPengRunScene（小鹏充电桩-自动跑酷）

**Files:**
- Modify: `js/scenes/XPengRunScene.js`

Alpha核心玩法2——强制卷轴自动跑酷（不同设计理念）：

**设计理念：** 玩家驾驶（扮演工程师在充电桩区域奔跑充电），自动向右奔跑，速度递增，通过跳跃和下蹲躲避激光/电缆/损坏充电桩障碍，收集电池维持体力，坚持越久分数越高。

**基础框架：**
- 背景：bg_xpeng_stage1，双层视差滚动（远景慢、近景快）
- 地面：platform_tiles.png，固定y=900
- 玩家：Player实例，强制vx = runSpeed（自动向右），初始位置(300, 800)
- 相机：固定跟随，玩家始终在x=300位置，世界向左滚动
- 速度：初始400px/s，每10秒+50px/s，最大900px/s

**控制：**
- 空格/W/↑：跳跃（支持二段跳，躲避地面障碍/电缆）
- ↓/S/C：下蹲/滑铲（降低碰撞盒，躲避低空激光/电缆）
- ←→/AD：不控制移动（自动跑），但可微调前后位置（±100px范围）
- ESC：暂停

**障碍物（从素材集02中选取）：**
- 地面障碍：obs_charger_normal/damaged（充电桩，需跳跃）
- 空中障碍：obs_laser_sphere（激光球，悬浮在不同高度，需下蹲或跳跃）
- 电缆障碍：obs_cable_1/2（弯曲电缆从中垂下，需下蹲）
- 混合：激光+电缆组合
- 生成间隔：随速度提升而缩短（初始2秒，最小0.8秒）
- 所有障碍物从右侧屏幕外生成，向左移动，离开左侧销毁

**收集品：**
- 蓝色电池（stamina_battery）：恢复15体力
- 金色星星（prop_star如有）：加分
- 电池每隔3-6秒随机生成

**体力系统：**
- 初始100
- 碰障碍-25
- 收集电池+15
- 时间衰减：每秒-1（鼓励收集电池）
- 体力<=0 → die → GameOver
- 体力条颜色同腾讯关卡

**难度递增：**
- 速度递增
- 障碍物密度递增
- 激光/充电桩组合变多
- 电池出现概率略降

**胜利/失败：**
- 体力耗尽 → GameOver
- Alpha版本：坚持120秒（2分钟，速度从400递增到900，保证足够游玩时长） → WinScene（充电成功，显示ui_penguin_fixed或ui_xpeng_car）

---

## Task 7: 更新HUD

**Files:**
- Modify: `js/ui/HUD.js`

使用新UI素材实现游戏内HUD，支持两种关卡模式：

**腾讯关卡HUD：**
- 左上角：体力条（ui_stamina_bar_bg + 对应颜色fill）+ 百分比文字
- 上方居中：6个道具槽（ui_prop_slot_empty/filled），收集道具时依次点亮，显示道具图标
- 右上角：暂停按钮（复用btn_settings或简单文字按钮）
- 道具槽下方显示当前区域名（如"腾讯大堂→微信区"）

**小鹏关卡HUD：**
- 左上角：体力条
- 右上角：速度表（显示当前速度km/h，用数字表示）+ 时间/距离
- 底部中央：已收集电池数/距离进度条

**通用：**
- 低体力时（<15%）体力条闪烁+红色脉动
- 受伤时屏幕短暂闪红

---

## Task 8: 更新BootScene、MainMenuScene和CreditsScene（制作人员名单）

**Files:**
- Modify: `js/scenes/BootScene.js`（确保加载完成提示）
- Modify: `js/scenes/MainMenuScene.js`（播放BGM、按钮功能、Credits按钮）
- Create: `js/scenes/CreditsScene.js`（制作人员名单场景）
- Modify: `js/main.js`（注册CreditsScene、BGM启动）
- Modify: `js/config.js`（添加CREDITS场景）

主菜单场景：
- 播放BGM_ADVENTURE（循环）
- "开始游戏"按钮→CharacterSelectScene
- "操作说明"按钮→弹出操作提示框（使用ui_dialog_box，显示按键说明，点击/ESC关闭）
- "制作人员"按钮→CreditsScene
- "结束游戏"按钮→弹出确认框/返回（浏览器内无法关闭，显示"感谢游玩"）
- 设置按钮→简单提示（Alpha版本暂不实现设置面板）
- 背景ping-pong正常工作

CreditsScene（制作人员名单）：
- 背景：半透明黑+动态主菜单背景
- 使用ui_dialog_box风格面板
- 标题："制作人员"
- 名单：
  - 制作人：李钢宝乐德
  - 美术：许铭睿、吴安懒、王再亮
  - 音乐：叶昱翔
- 底部"返回主菜单"按钮
- 滚动或渐入动画效果
- ESC/点击返回主菜单

操作说明弹窗（临时覆盖层，不单独场景）：
- 在MainMenuScene中渲染
- 使用ui_dialog_box背景
- 文字内容：
  - ←→ / AD：移动
  - 空格 / W / ↑：跳跃（支持二段跳）
  - ↓ / S / C：下蹲
  - ESC：暂停
  - 收集6个事业群道具通关腾讯关卡
  - 躲避障碍收集电池维持体力

---

## Task 9: 音效系统（Web Audio API合成音效）

**Files:**
- Modify: `js/engine/AudioManager.js`（添加程序化音效生成）
- Modify: `js/config.js`（注册SFX音效配置）

由于目前没有独立的SFX音频文件，使用Web Audio API生成8-bit风格的程序化音效：

```javascript
// AudioManager新增方法
_generateBeep(freq, duration, type = 'square', vol = 0.3) {
    // 使用OscillatorNode生成简单音效
}
```

需要的音效：
- `BUTTON_HOVER`：高频短促beep（800Hz, 0.05s）
- `BUTTON_CLICK`：中频beep（500Hz→300Hz, 0.1s，下降音）
- `JUMP`：上升滑音（300Hz→600Hz, 0.15s）
- `DOUBLE_JUMP`：更高滑音（400Hz→800Hz, 0.12s）
- `LAND`：低频thump（100Hz, 0.1s, 噪声）
- `COLLECT`：欢快上升双音（600→800→1000Hz, 0.15s）
- `COLLECT_BATTERY`：电流滋滋声+上升音
- `HURT`：不和谐下降音（300→100Hz, 0.3s）
- `DIE`：死亡下降音（400→50Hz, 0.6s）
- `VICTORY`：胜利旋律（简单琶音 C-E-G-C）
- `LASER_WARNING`：高频警报（交替800/600Hz）
- `TRANSITION`：whoosh音效

同时保留播放外部音频文件的能力，后续有真实音效文件时直接替换CONFIG路径即可。

---

## Task 10: GameOverScene和WinScene更新

**Files:**
- Modify: `js/scenes/GameOverScene.js`
- Modify: `js/scenes/WinScene.js`

GameOverScene：
- 使用ui_dialog_box作为面板背景
- "体力耗尽，任务失败"文字
- btn_restart（重新开始）、btn_menu（返回主菜单）
- 显示本次游玩时间/收集数统计
- 播放DIE音效

WinScene（根据levelType显示不同内容）：
- 腾讯关卡：ui_penguin_fixed展示 + "恭喜通关！你修复了智能企鹅！"
- 小鹏关卡：ui_xpeng_car展示 + "充电成功！小鹏汽车继续出发！"
- 显示通关时间/得分统计
- btn_menu返回主菜单
- 播放VICTORY音效

---

## Task 11: 文档同步

**Files:**
- Modify: `素材需求清单.md`（更新已完成素材列表）
- Modify: `.trae/documents/卓越工程师大冒险-完整开发计划.md`（更新Alpha进度）

标记已完成的素材和功能，列出剩余待做项。

---

## Task 12: 测试与Bug修复

**Files:**
- 所有修改的文件

- [ ] 启动http-server，浏览器测试完整流程：启动→主菜单→角色选择→关卡选择→腾讯关卡→游戏中→游戏结束/胜利
- [ ] 测试小鹏关卡：进入→自动跑→跳跃/下蹲躲避→收集电池→速度递增→失败/胜利
- [ ] 测试CreditsScene：制作人员名单显示正确，ESC/返回按钮正常
- [ ] 测试操作说明弹窗：内容正确，ESC/点击关闭
- [ ] 验证角色动画正确播放（idle/run/run_left/run_right/jump_start/airborne/landing/crouch/hurt/death/pickup/operate/victory）
- [ ] 验证背景ping-pong循环（01→08→01无跳帧，云朵自然往返）
- [ ] 验证BGM正常播放（循环无间断）
- [ ] 验证音效：按钮hover/click、跳跃、二段跳、落地、收集道具、收集电池、受伤、死亡、胜利
- [ ] 验证腾讯关卡：平台跳跃、6道具收集、低/高障碍物、体力条变色、地形生成、区域过渡（至少2分钟游戏长度）
- [ ] 验证小鹏关卡：自动滚动、速度递增（400→900）、激光/电缆/充电桩障碍、电池收集、体力衰减、坚持120秒胜利
- [ ] 验证HUD：体力条颜色变化、道具槽点亮、速度表、暂停按钮
- [ ] 验证所有按钮响应（键盘+鼠标）
- [ ] 验证ESC暂停菜单（继续/重新开始/返回主菜单）
- [ ] 对照素材利用清单，确认所有✅标记的素材都在游戏中实际出现
- [ ] 修复发现的渲染/逻辑/音效Bug

---

## 风险与注意事项

1. **角色动画帧尺寸不统一**：男92×79、女112×80，Player的碰撞盒(w,h)与动画帧渲染尺寸需要协调，以动画帧实际像素为准进行缩放
2. **素材裁剪精度**：Python自动分割可能无法完美分离每个元素（特别是间距不均匀的情况），需要手动微调裁剪坐标
3. **障碍物碰撞盒**：障碍物图片是像素风非矩形，Alpha版本使用AABB矩形碰撞即可
4. **BGM循环**：`科技冒险双关.mp3` 需要确认时长足够，循环点是否自然
5. **性能**：Canvas 2D绘制大量元素时注意drawImage调用次数，背景/平台使用瓦片缓存
6. **AssetLoader加载顺序**：manifest中声明的所有文件必须存在，否则onerror导致占位图但不崩溃

---

## 素材利用清单（必须全部在游戏中出现）

### UI素材（全部使用）
- ✅ logo.png → BootScene + MainMenuScene标题
- ✅ btn_start.png → MainMenuScene开始游戏按钮
- ✅ btn_help.png → MainMenuScene操作说明按钮
- ✅ btn_credits.png → MainMenuScene制作人员按钮
- ✅ btn_end.png → MainMenuScene结束游戏按钮
- ✅ btn_settings.png → MainMenuScene设置按钮
- ✅ ui_gender_male.png → CharacterSelectScene男性头像
- ✅ ui_gender_female.png → CharacterSelectScene女性头像
- ✅ ui_stamina_bar_bg.png + 4色fill → HUD体力条（两关卡通用）
- ✅ ui_prop_slot_empty/filled.png → HUD道具槽（腾讯关卡）
- ✅ ui_card_tencent.png → LevelSelectScene腾讯关卡卡片
- ✅ ui_card_xpeng.png → LevelSelectScene小鹏关卡卡片
- ✅ ui_penguin_broken.png → 腾讯关卡开场/企鹅修复前
- ✅ ui_penguin_fixed.png → 腾讯关卡胜利画面
- ✅ ui_xpeng_car.png → 小鹏关卡胜利画面
- ✅ ui_dialog_box.png → 操作说明弹窗+暂停菜单+对话框
- ✅ btn_restart.png → GameOver/暂停菜单重开按钮
- ✅ btn_menu.png → GameOver/暂停菜单返回按钮
- ✅ btn_continue.png → 暂停菜单继续按钮
- ✅ lock_icon.png → （备用）

### 背景素材
- ✅ bg_frame_01~08.png → MainMenuScene/CreditsScene/LevelSelectScene动态背景（ping-pong）
- ✅ bg_tencent_lobby.png → TencentLobbyScene背景
- ✅ bg_xpeng_stage1.png → XPengRunScene背景
- ⏳ 其他区域背景(bg_tencent_wechat/qq/games/cloud/content/tech) → 腾讯关卡区域过渡时切换背景（远景层）
- ⏳ bg_char_select.png → CharacterSelectScene（可选，若动态背景不够则叠加半透明层）
- ⏳ bg_xpeng_stage2/ending.png → 暂不使用（留待后续版本）

### 角色素材
- ✅ male_spritesheet.png + male_anims.json → 男性玩家14个动画全部使用
- ✅ female_spritesheet.png + female_anims.json → 女性玩家14个动画全部使用

### 道具素材
- ✅ prop_wechat.png → 腾讯关卡微信区道具
- ✅ prop_qq.png → QQ区道具
- ✅ prop_games.png → 游戏区道具
- ✅ prop_cloud.png → 云区道具
- ✅ prop_content.png → 内容区道具
- ✅ prop_tech.png → 技术区道具
- ✅ stamina_battery.png → 两关卡体力恢复道具
- ✅ prop_coin/prop_star.png → 小鹏关卡加分/奖励（可选）

### 障碍物素材（两关卡共使用约15种）
- ✅ obs_low_barrier系列(gate/folders/balloons/servers/blocks) → 腾讯关卡地面低障碍
- ✅ obs_high_wall系列(glass/ice/arcade/news/pipes) → 腾讯关卡空中高障碍
- ✅ obs_laser_sphere/cross → 小鹏关卡激光障碍
- ✅ obs_cable_1/2/plug/red → 小鹏关卡电缆障碍
- ✅ obs_charger_normal/damaged/burning → 小鹏关卡充电桩障碍（normal=跳跃，damaged=漏电，burning=大块障碍）
- ⏹ obs_cones/barrier_full/wall_full/gate_full/spike_full等 → 备用，后续版本使用
- ⏹ obs_alarm/battery_pack/energy_core/machinery/moving_platform等 → 备用

### 瓦片
- ✅ platform_tiles.png → 两关卡地面+平台

### 音频
- ✅ bgm_adventure.mp3（科技冒险双关.mp3） → 全游戏BGM

### 3387502ef7d...jpg（Q版男女像素图）
- ✅ 用作CharacterSelectScene小头像/装饰

---
