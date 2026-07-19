# 《卓越工程师大冒险》Alpha最终完善计划

> **Goal:** 在现有引擎基础上，完成可玩的Alpha版本——完整游戏流程（Boot→主菜单→角色选择→关卡选择→腾讯横版平台跑酷→小鹏自动跑酷→胜利/失败），包含制作人员名单、程序化音效、HUD、体力系统、地形生成、障碍物、道具收集。每个关卡保证1-2分钟游玩长度，**所有已处理素材充分利用**。

**当前状态：**
- ✅ 引擎核心（GameLoop/Renderer/Input/Collision/Audio/SceneManager/Particle/AssetLoader）已完成
- ✅ Player实体（14个动画状态机、二段跳、下蹲、受伤/拾取/胜利动画）已完成
- ✅ AudioManager（Web Audio程序化音效+BGM播放）已完成
- ✅ 素材全部处理入库（UI/背景/角色spritesheet/道具/障碍物/瓦片）
- ✅ MainMenuScene（ping-pong背景、按钮、帮助/结束弹窗）已完成
- ✅ CONFIG配置完整（物理参数、关卡参数、SFX/BGM配置）
- ❌ CharacterSelect/LevelSelect/TencentLobby/XPengRun/GameOver/Win/Credits场景需实现/重写
- ❌ HUD需完善
- ❌ 地形生成、碰撞逻辑、胜负判定需在场景中实现

**完整游戏流程：**
```
BootScene(加载)
  → MainMenuScene(开始/说明/制作人员/结束 + BGM + ping-pong背景)
    → CharacterSelectScene(男/女选择 + idle动画预览)
      → LevelSelectScene(腾讯/小鹏卡片选择)
        → TencentIntroScene(简单介绍，可跳过)
          → TencentLobbyScene(横版平台跑酷：收集6事业群道具通关，约2分钟)
        → XPengIntroScene(简单介绍，可跳过)
          → XPengRunScene(自动跑酷：速度递增/体力系统/电池/激光电缆障碍，坚持120秒)
            → WinScene/GameOverScene(胜利/失败 + 重开/返回)
    → CreditsScene(制作人员名单：制作人/美术/音乐)
```

---

## Task 1: 完善CharacterSelectScene（角色选择）

**Files:**
- Modify: `js/scenes/CharacterSelectScene.js`

**实现内容：**
1. 背景：复用BG_MAIN_MENU（ping-pong动态背景）+ 半透明深色遮罩
2. 标题："选择你的工程师"（居中上方，发光效果）
3. 左侧男性角色卡片：
   - 使用CHAR_SELECT_MALE_PIXEL作为头像/立绘
   - 下方显示男性spritesheet的idle动画预览（小尺寸）
   - 选中时蓝色发光边框+放大1.08x
4. 右侧女性角色卡片：
   - 使用CHAR_SELECT_FEMALE_PIXEL作为头像/立绘
   - 下方显示女性spritesheet的idle动画预览
   - 选中时粉色/紫色发光边框+放大1.08x
5. 交互：
   - 键盘←→切换选择，空格/回车确认
   - 鼠标点击卡片选择
   - ESC返回主菜单
6. 确认后传gender数据('male'/'female')到LevelSelectScene
7. 按钮hover/click音效

---

## Task 2: 完善LevelSelectScene（关卡选择）

**Files:**
- Modify: `js/scenes/LevelSelectScene.js`

**实现内容：**
1. 背景：BG_MAIN_MENU动态背景
2. 标题："选择关卡"
3. 左侧腾讯卡片（UI_CARD_TENCENT）：
   - 卡片图片+下方文字"腾讯大厦大堂"
   - 星级难度（3星）
   - 描述："横版平台跑酷，收集6大事业群道具修复智能企鹅"
4. 右侧小鹏卡片（UI_CARD_XPENG）：
   - 卡片图片+下方文字"小鹏充电桩"
   - 星级难度（4星）
   - 描述："自动奔跑，躲避激光电缆障碍，收集电池坚持120秒"
5. 交互：
   - 键盘←→切换选中，空格/回车进入
   - 鼠标点击卡片进入
   - 卡片hover放大+发光
   - ESC返回角色选择
6. 腾讯卡片→TENCENT_INTRO→TENCENT_LOBBY
7. 小鹏卡片→XPENG_INTRO→XPENG_RUN
8. 不锁定，两关均可直接进入

---

## Task 3: 实现Intro场景（TencentIntroScene + XPengIntroScene）

**Files:**
- Modify: `js/scenes/TencentIntroScene.js`
- Modify: `js/scenes/XPengIntroScene.js`

**实现内容（两个场景共用逻辑模板）：**
1. 背景：对应关卡背景图（BG_TENCENT_LOBBY或BG_XPENG_STAGE1）
2. 中央UI_DIALOG_BOX对话框：
   - 腾讯：标题"腾讯大厦大堂"，文字"智能企鹅出现故障！\n穿越六大事业群区域，收集道具修复企鹅吧！\n\n← →移动  空格跳跃（二段跳）  ↓下蹲\n按空格开始"
   - 小鹏：标题"小鹏充电桩"，文字"充电站发生故障！\n在激光与电缆间奔跑，收集电池维持体力，坚持120秒！\n\n空格/↑跳跃（二段跳）  ↓下蹲\n按空格开始"
3. 按空格/回车/点击→进入对应游戏场景
4. 按ESC返回LevelSelect
5. 3秒后自动按空格开始（可选，或者必须按键开始）
6. BGM持续播放

---

## Task 4: 实现CreditsScene（制作人员名单）

**Files:**
- Modify: `js/scenes/CreditsScene.js`（创建新文件，当前可能不存在）
- Modify: `js/main.js`（注册CreditsScene）
- Modify: `js/config.js`（确认CREDITS场景已注册）

**实现内容：**
1. 背景：BG_MAIN_MENU动态背景 + 半透明黑色遮罩(0.7透明度)
2. 中央UI_DIALOG_BOX面板（600×500）：
   - 标题："制作人员"（金色/黄色发光）
   - 名单内容：
     ```
     制作人：李钢宝乐德

     美术：许铭睿
           吴安懒
           王再亮

     音乐：叶昱翔
     ```
3. 底部BTN_MENU按钮："返回主菜单"
4. 动画：名单逐行渐入（从透明到不透明，每行间隔0.3秒）
5. 交互：
   - 点击BTN_MENU或按ESC/空格返回MainMenuScene
   - 点击面板外区域也返回
6. 播放轻柔背景氛围（可选，BGM保持播放即可）

---

## Task 5: 完善HUD（ui/HUD.js）

**Files:**
- Modify: `js/ui/HUD.js`

**实现统一HUD类，支持两种关卡模式：**

**腾讯关卡HUD：**
1. 左上角：体力条
   - 背景UI_STAMINA_BAR_BG
   - 填充根据体力百分比选择：>60绿、>30黄、>15橙、≤15红
   - 体力条右侧显示百分比数字（如"75%"）
   - 低体力(≤15%)时闪烁动画
2. 上方居中：6个道具槽
   - 使用UI_PROP_SLOT_EMPTY作为空槽
   - 收集道具后槽位变为UI_PROP_SLOT_FILLED，并在槽内显示对应道具图标
   - 槽位从左到右依次点亮：微信→QQ→游戏→云→内容→技术
3. 上方道具槽下方：当前区域名（如"腾讯大堂 → 微信事业群"）
4. 右上角：暂停提示（"ESC暂停"文字或BTN_SETTINGS图标）

**小鹏关卡HUD：**
1. 左上角：体力条（同腾讯）
2. 右上角：
   - 速度显示（当前速度km/h，从400px/s换算：px/s * 0.1 = km/h显示值）
   - 时间/距离：已坚持时间"01:23"倒计时/正计时
3. 底部中央：进度条（显示120秒进度，从0到满）+ 电池收集数
4. 低体力时屏幕边缘红色渐变闪烁

**通用：**
- 受伤时全屏半透红色闪帧（0.2秒）
- 体力条颜色切换平滑

---

## Task 6: 实现TencentLobbyScene（腾讯大堂-横版平台跑酷）【核心】

**Files:**
- Modify: `js/scenes/TencentLobbyScene.js`（完全重写，当前只是占位符）

**关卡设计：**
- 总长度：9000px（按移动速度380px/s，纯跑步需24秒，加上平台跳跃/收集/绕路保证1.5-2分钟）
- 地面y=920，使用PLATFORM_TILES瓦片水平铺满
- 7个区域，每区域约1300px，区域切换时背景层切换到对应BG_TENCENT_*
- 终点区域（8500-9000px）：bg_tencent_repair背景+UI_PENGUIN_FIXED标志

**预生成关卡数据（确定性设计，保证可通关）：**

使用预定义数组而非完全随机，确保关卡设计合理：

```javascript
// 关卡数据结构：{type, x, y, w, h, variant}
// type: 'platform' | 'low_obstacle' | 'high_obstacle' | 'prop' | 'battery' | 'ground_gap'
const LEVEL_DATA = [
  // 区域0：大堂(0-1300px) - 教学区，简单平台+低障碍
  {type: 'platform', x: 400, y: 780, w: 240, h: 48},
  {type: 'prop', x: 500, y: 720, prop: 'wechat'},
  {type: 'low_obstacle', x: 800, y: 872, obs: 'OBS_LOW_GATE'},
  {type: 'platform', x: 1000, y: 700, w: 240, h: 48},
  {type: 'battery', x: 1100, y: 640},
  // ... 完整7区域数据
];
```

**区域详细设计：**
1. **大堂区(0-1300px)**：简单单层平台+低障碍，教学跳跃+下蹲，放置微信道具
2. **微信区(1300-2600px)**：双层平台+低文件夹/气球障碍+高玻璃墙，放置QQ道具+1电池
3. **QQ区(2600-3900px)**：三层冰晶平台+低服务器+高冰墙，放置游戏道具+1电池
4. **游戏区(3900-5200px)**：平台间距增大，低方块+文件夹，高街机+玻璃墙，需要二段跳跨沟壑，放置云道具+2电池
5. **云区(5200-6500px)**：中等高度平台+低气球/门，高新闻屏幕墙，放置内容道具+1电池
6. **内容区(6500-7800px)**：高低平台交错+低服务器/方块，高管道/冰墙，放置技术道具+2电池
7. **修复区(7800-9000px)**：简单平台直达企鹅修复台

**物理与控制：**
- ←→/AD：左右移动（vx=±MOVE_SPEED）
- 空格/W/↑：跳跃（支持二段跳）
- ↓/S/C：下蹲（碰撞盒高度降低40%，可过低障碍）
- ESC：暂停（弹出对话框：继续/重开/返回主菜单）
- 重力：CONFIG.GRAVITY
- 平台碰撞：从上方落下时站在平台上（CollisionSystem.platformCollision）
- 地面：y=920为地面，超出y>1100视为掉落

**碰撞系统：**
- 平台：站立碰撞
- 道具：AABB碰撞即收集（播放COLLECT音效+粒子+道具槽点亮+stamina+5）
- 障碍物：AABB碰撞扣20体力+受伤无敌1秒+击退+HURT音效+屏幕闪红
- 电池：收集+15体力+COLLECT_BATTERY音效+粒子
- 掉落(y>1100)：扣30体力+传送回最近地面点+屏幕震动

**相机：**
- 水平跟随玩家x，相机x = player.x - 500
- 相机左边界clamp在0，右边界clamp在LEVEL_LENGTH - CANVAS_WIDTH + 200
- 垂直方向不跟随（固定）

**背景滚动（视差）：**
- 远景层（天空/建筑）：0.3x速度
- 中景层（装饰）：0.6x速度
- 近景（地面瓦片）：1x速度（与相机同步）
- 区域切换时背景图淡入淡出切换

**胜负条件：**
- 胜利：到达x>8800且收集齐6个道具→播放victory动画+VICTORY音效→WinScene(type='tencent')
- 失败：体力≤0→播放death动画+DIE音效→GameOverScene(level='tencent', stats)

---

## Task 7: 实现XPengRunScene（小鹏充电桩-自动跑酷）【核心】

**Files:**
- Modify: `js/scenes/XPengRunScene.js`（完全重写，重新设计玩法）

**玩法设计（用户要求换一种设计理念但仍是跑酷）：**
玩家在故障的小鹏充电桩区域自动向右奔跑，速度逐渐加快。通过跳跃躲避地面障碍（充电桩），下蹲躲避空中障碍（激光球/电缆），在三条跑道间切换。体力随时间缓慢消耗，被障碍物击中大幅扣体力，收集蓝色电池恢复体力。坚持120秒即充电成功通关。

**关键差异（与腾讯关卡对比）：**
- 自动向右移动（玩家不控制左右方向）
- 3条跑道（上/中/下？或者前/中/后三车道？选择三车道垂直切换：上/中/下三条高度的跑道）
- 强制卷轴：世界向左滚动，速度从400→900px/s递增
- 速度表显示+倒计时/正计时

**基础框架：**
- 背景：BG_XPENG_STAGE1，双层视差滚动（远景0.3x，近景1x）
- 地面y=900，使用PLATFORM_TILES铺满
- 三条跑道（垂直高度层）：
  - 跑道0（地面）：y=820（站立高度）
  - 跑道1（低空）：y=680（跳跃到空中平台）
  - 跑道2（高空）：y=540（二段跳到达的高度）
- 玩家初始位置：(400, 820)，跑道0
- 速度：初始400px/s，每10秒+50px/s，上限900px/s
- 游戏时长：120秒

**控制：**
- 空格/W/↑：跳跃（支持二段跳，切换到更高跑道）
- ↓/S：下蹲/快速下降（降低高度，回到低跑道）
- 跑道切换：跳跃自动上升跑道，下蹲自动下降跑道（简化控制，不需要←→切换车道）
  - 或者采用：↑跳、↓蹲、←→切换三车道（水平三车道，更经典的跑酷设计）
  
**最终决定采用：水平3车道设计**（更经典的地铁跑酷/神庙逃亡模式，但用Canvas 2D侧视角实现）
- 3条水平车道（y坐标不同）：车道0(820)/车道1(720)/车道2(620)
- ↑/W：切换到上一车道（更高位置，视觉上像是跳跃到平台）
- ↓/S：切换到下一车道（更低位置）
- 空格：跳跃（在当前车道内向上跳，躲避地面障碍/缺口）
- 这样既有车道切换，又有跳跃下蹲，玩法丰富

重新设计为：**侧视角自动卷轴 + 垂直3层跑道 + 跳跃/下蹲**

**最终控制方案：**
- 自动向右跑（vx = runSpeed）
- 空格/↑：跳跃（当前层内，可二段跳）
- ↓/S：下蹲滑铲（碰撞盒变矮，躲避空中障碍）
- W/↑（短按后接↑？不，简化：用↑跳跃，↓下蹲，W/S切换上下跑道）

**最简控制方案（玩家容易上手）：**
- 空格/↑：跳跃（支持二段跳，躲避地面障碍/充电桩）
- ↓/S：下蹲（碰撞盒变矮40%，躲避低空激光/电缆）
- 没有跑道切换，只有一条道，但障碍分高/中/低三种高度，需要跳跃或下蹲躲避——这是最简单最经典的Canabalt/Flappy Bird类跑酷

**就用这个：单车道垂直分层障碍自动跑酷**
- 地面固定y=900，玩家在地面层自动右跑
- 障碍物三类：
  1. 地面障碍（充电桩OBS_CHARGER_NORMAL/DAMAGED/BURNING）：需要跳跃越过
  2. 空中障碍（激光球OBS_LASER_SPHERE、电缆OBS_CABLE_1/2/PLUG）：悬浮在空中，需要下蹲穿过
  3. 高低组合（激光+电缆+充电桩组合）：需要精确跳跃+下蹲时机
- 电池OBS_STAMINA_BATTERY：悬浮在不同高度，跳起来收集

**障碍物生成（基于时间间隔，随速度递增密度增加）：**
- 生成间隔：初始1.8秒，随速度递减到0.7秒（速度越快障碍越密）
- 每次生成随机选择1-3个障碍组合：
  - 单个充电桩（地面，跳）
  - 单个激光球（空中高，蹲/不动）
  - 单个电缆（空中低，蹲）
  - 充电桩+激光球组合（先跳后蹲）
  - 双激光球（连续蹲）
  - 电池（奖励，可选位置）
- 所有障碍物从x=2000（屏幕外右侧）生成，随世界向左移动，x<=-100时销毁
- 保证同一时刻屏幕上最多3-4个障碍，避免不可能通过的组合

**电池生成：**
- 间隔5-8秒随机生成
- 位置：y=600-800随机（需要跳起来吃）
- 恢复15体力

**体力系统：**
- 初始100
- 时间衰减：每秒-1（缓慢消耗，鼓励收集电池）
- 碰障碍：-25
- 收集电池：+15
- 体力≤0 → death → GameOver
- 体力条颜色同腾讯关卡

**难度递增：**
- 速度：400→900px/s（每10秒+50）
- 障碍生成间隔：1.8s→0.7s（线性递减）
- 速度>600后开始出现高低组合障碍
- 速度>750后障碍间隔更小，需要连续跳跃/下蹲

**胜利条件：**
- 存活120秒 → 播放victory+充电成功动画→WinScene(type='xpeng')
- 时间到后速度停止递增，保持当前速度再跑3秒作为收尾

**失败条件：**
- 体力≤0 → GameOverScene
- 显示坚持时间、收集电池数

**视觉效果：**
- 速度>600时，周期性发射速度线粒子（ParticleSystem.emitSpeedLines）
- 低体力(<15%)时屏幕边缘红色渐变闪烁+心跳感
- 受伤时屏幕闪红+粒子爆炸
- 收集电池时蓝色光圈粒子
- 背景视差滚动

---

## Task 8: 完善GameOverScene和WinScene

**Files:**
- Modify: `js/scenes/GameOverScene.js`
- Modify: `js/scenes/WinScene.js`

**GameOverScene：**
1. 背景：对应关卡背景+半透明黑色遮罩(0.75)
2. 中央UI_DIALOG_BOX面板：
   - 标题："任务失败"（红色）
   - 文字：（根据关卡类型）
     - 腾讯："体力耗尽，智能企鹅还在等待修复..."
     - 小鹏："体力耗尽，充电失败..."
   - 统计：游玩时间、收集道具数/电池数
3. 按钮：
   - BTN_RESTART："重新开始"（重新进入当前关卡）
   - BTN_MENU："返回主菜单"
4. 播放DIE音效
5. 交互：键盘/鼠标点击按钮

**WinScene：**
1. 背景：对应关卡背景+半透明金色遮罩/光效
2. 中央面板：
   - 腾讯关卡：UI_PENGUIN_FIXED展示（大尺寸居中），标题"恭喜通关！"，文字"你成功修复了智能企鹅！"
   - 小鹏关卡：UI_XPENG_CAR展示，标题"充电成功！"，文字"小鹏汽车充满能量，继续出发！"
3. 统计：通关时间、评分（简单星级：根据剩余体力/收集数）
4. BTN_MENU按钮："返回主菜单"
5. 播放VICTORY音效+彩色粒子爆发
6. 企鹅/汽车有轻微上下浮动动画

---

## Task 9: 暂停系统（集成到两个游戏场景）

**Files:**
- TencentLobbyScene.js 和 XPengRunScene.js 中集成

**暂停菜单：**
- 按ESC触发
- 时间冻结（dt不更新，障碍物/玩家停止运动）
- 半透明黑色遮罩+UI_DIALOG_BOX
- 三个按钮：
  - BTN_CONTINUE："继续游戏"（恢复游戏）
  - BTN_RESTART："重新开始"（重置当前关卡）
  - BTN_MENU："返回主菜单"
- 点击按钮/按键响应
- 暂停时BGM音量降低或暂停

---

## Task 10: 完善AssetLoader和引擎边界情况

**Files:**
- Modify: `js/engine/AssetLoader.js`（确认角色动画、背景ping-pong、sprite获取都正常）
- Modify: `js/engine/SceneManager.js`（确认场景切换过渡、数据传递正常）
- Modify: `js/main.js`（注册CreditsScene、确保所有场景传递正确参数）

**检查项：**
1. AssetLoader.drawCharacter使用精确帧坐标（已修复但需验证）
2. AssetLoader.drawBackground ping-pong循环正确（01→08→01）
3. 场景切换时场景数据传递（gender、levelType等）
4. 所有sprite key在manifest中存在且文件路径正确
5. Player动画名映射正确（jump→jump_start等）
6. BGM在场景切换时正确切换/持续播放

---

## Task 11: 文档同步

**Files:**
- Modify: `素材需求清单.md`（标记已完成项，更新素材使用映射）
- Modify: `.trae/documents/卓越工程师大冒险-完整开发计划.md`（更新Alpha完成进度）

更新内容：
- 标记所有已处理入库的素材
- 标记所有已实现的功能
- 列出Alpha版本的已知限制（Phase 2待做项：激光交叉/电缆触手/企鹅Boss/天气变化/多周目解锁等）

---

## Task 12: 测试与Bug修复

**测试清单（浏览器中完整流程测试）：**

**基础流程：**
- [ ] 启动http-server，页面加载无报错
- [ ] BootScene加载进度条正常→进入MainMenu
- [ ] MainMenu背景ping-pong正常（01-08-01循环流畅）
- [ ] BGM开始播放（需要点击一次后，浏览器自动播放策略）
- [ ] 四个按钮hover音效、click音效正常
- [ ] "操作说明"弹窗内容正确，ESC/点击关闭
- [ ] "制作人员"→CreditsScene，名单显示正确（李钢宝乐德/许铭睿/吴安懒/王再亮/叶昱翔），返回正常
- [ ] "结束游戏"→感谢弹窗，关闭正常
- [ ] "开始游戏"→CharacterSelectScene

**角色选择：**
- [ ] 男女角色卡片显示正确，idle动画预览正常
- [ ] ←→切换选中，发光边框正常
- [ ] 鼠标点击选择正常
- [ ] 空格/回车确认→LevelSelectScene
- [ ] ESC返回主菜单

**关卡选择：**
- [ ] 两张卡片显示正确
- [ ] ←→/鼠标选择
- [ ] 选择腾讯→TencentIntro→按空格→TencentLobby
- [ ] 返回→选择小鹏→XPengIntro→按空格→XPengRun

**腾讯大堂关卡：**
- [ ] 玩家可左右移动，跑步动画正确（方向对应）
- [ ] 跳跃（单跳+二段跳）动画和音效正确
- [ ] 下蹲动画正确，碰撞盒变矮
- [ ] 落地音效正确
- [ ] 平台可以站立，重力正常
- [ ] 障碍物（低/高）碰撞扣体力，受伤无敌帧+闪红
- [ ] 道具收集：6个事业群道具依次点亮道具槽，音效+粒子
- [ ] 电池收集恢复体力
- [ ] 区域名随进度更新
- [ ] 背景视差滚动正常，区域切换背景变化
- [ ] 相机水平跟随正常
- [ ] 体力条颜色随体力变化（绿→黄→橙→红）
- [ ] 低体力闪烁正常
- [ ] ESC暂停菜单：继续/重开/返回主菜单都正常
- [ ] 收集齐6道具到达终点→WinScene（企鹅修复画面）
- [ ] 体力耗尽→GameOverScene
- [ ] 游戏时长至少1.5分钟（从起点到终点正常跑需要90秒以上）

**小鹏充电桩关卡：**
- [ ] 玩家自动向右奔跑，跑步动画正确
- [ ] 空格/↑跳跃（二段跳），跳跃/落地音效
- [ ] ↓/S下蹲，下蹲动画和碰撞盒正确
- [ ] 充电桩（地面障碍）需要跳跃躲避
- [ ] 激光球/电缆（空中障碍）需要下蹲躲避
- [ ] 障碍碰撞扣体力+受伤效果
- [ ] 电池收集恢复体力
- [ ] 速度随时间递增（400→900），HUD速度表更新
- [ ] 速度快时出现速度线效果
- [ ] 障碍密度随速度增加
- [ ] 体力随时间缓慢衰减
- [ ] 体力条颜色变化、低体力警告
- [ ] ESC暂停菜单正常
- [ ] 坚持120秒→WinScene（汽车画面）
- [ ] 体力耗尽→GameOverScene
- [ ] 游戏时长保证120秒可通关

**胜利/失败场景：**
- [ ] WinScene显示正确（企鹅/汽车），VICTORY音效，粒子效果
- [ ] GameOverScene显示正确，DIE音效
- [ ] 重开按钮正常
- [ ] 返回主菜单按钮正常

**素材利用检查：**
- [ ] 所有UI素材（logo/buttons/cards/dialog/bars/slots/penguin/car/portraits）在游戏中实际出现
- [ ] 所有背景（bg_frame_01-08、bg_tencent_lobby/wechat/qq/games/cloud/content/tech/repair、bg_xpeng_stage1）被使用
- [ ] 男女角色spritesheet所有动画状态被使用
- [ ] 6个事业群道具+电池被使用
- [ ] 障碍物（low系列5种、high系列5种、laser/cable/charger系列8种）在关卡中出现
- [ ] platform_tiles.png作为地面和平台贴图使用
- [ ] BGM正常循环播放
- [ ] 12种SFX音效都在正确时机触发

---

## 风险与注意事项

1. **关卡设计合理性**：预生成腾讯关卡数据时要确保平台间距和高度在跳跃可达范围内（单跳约180px高，二段跳约320px高，水平跳跃距离约200-250px）
2. **小鹏关卡障碍组合**：确保不出现无法躲避的死局（如高障碍+低障碍同时出现没有空隙）
3. **性能**：Canvas 2D绘制时注意，离屏障碍物/平台及时销毁，避免drawImage调用过多
4. **角色动画帧尺寸**：男女角色帧尺寸不同（男~92×79，女~112×80），Player的render中已动态适配，需验证
5. **浏览器自动播放策略**：BGM需要用户首次交互后才能播放，MainMenu中第一次点击时resume AudioContext
6. **ESC暂停时输入状态清空**：避免暂停期间按键累积导致恢复后瞬间触发动作
7. **场景切换数据传递**：gender和levelType需要正确在场景间传递（SceneManager的sceneData机制）
8. **像素整数对齐**：渲染时坐标取整，避免sub-pixel模糊

---

## 素材利用清单（验证全部使用）

### UI（全部使用）
- logo.png → BootScene+MainMenu标题
- btn_start/help/credits/end/settings → MainMenu按钮
- ui_gender_male/female → CharacterSelect角色卡片
- char_select_male/female_pixel → CharacterSelect立绘
- ui_stamina_bar_bg + 4色fill → 两关卡HUD体力条
- ui_prop_slot_empty/filled → 腾讯关卡HUD道具槽
- ui_card_tencent/xpeng → LevelSelect关卡卡片
- ui_dialog_box → Intro/暂停/帮助/结束/GameOver/Win/Credits弹窗
- btn_restart/menu/continue → 暂停/结算界面按钮
- ui_penguin_broken → 腾讯关卡开场暗示
- ui_penguin_fixed → 腾讯WinScene
- ui_xpeng_car → 小鹏WinScene
- lock_icon → 备用（Alpha不显示锁定）

### 背景
- bg_frame_01-08 → MainMenu/Credits/LevelSelect/CharacterSelect动态背景（ping-pong）
- bg_tencent_lobby/wechat/qq/games/cloud/content/tech/repair → 腾讯关卡7区域背景
- bg_xpeng_stage1 → 小鹏关卡背景

### 角色
- male_spritesheet + male_anims.json → 男性角色14动画
- female_spritesheet + female_anims.json → 女性角色14动画

### 道具
- prop_wechat/qq/games/cloud/content/tech → 腾讯关卡6个收集道具
- stamina_battery → 两关卡体力恢复道具
- prop_coin/star → 小鹏关卡加分（可选，Alpha版本可以不使用或作为电池的视觉变体）

### 障碍物（共18种）
- 腾讯低障碍：OBS_LOW_GATE/FOLDERS/BALLOONS/SERVERS/BLOCKS
- 腾讯高障碍：OBS_HIGH_GLASS/ICE/ARCADE/NEWS/PIPES
- 小鹏地面障碍：OBS_CHARGER_NORMAL/DAMAGED/BURNING
- 小鹏空中障碍：OBS_LASER_SPHERE/OBS_CABLE_1/OBS_CABLE_2/OBS_CABLE_PLUG

### 瓦片
- platform_tiles.png → 两关卡地面和平台

### 音频
- bgm_adventure.mp3 → 全游戏BGM
- Web Audio合成SFX → 12种音效全部使用
