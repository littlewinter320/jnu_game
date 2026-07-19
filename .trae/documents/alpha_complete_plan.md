# 《卓越工程师大冒险》Alpha 完整版执行计划

## 一、项目现状分析

### 已完成模块
- ✅ 引擎核心：GameLoop、Renderer、InputHandler、CollisionSystem、AudioManager（含程序化SFX）、SceneManager、ParticleSystem、AssetLoader（含ping-pong背景动画）
- ✅ 实体系统：Entity、Player（含完整动画状态机）、Obstacle、Collectible、Platform
- ✅ 场景框架：BootScene、MainMenuScene（8帧ping-pong动态背景）、CreditsScene（制作人员名单已完成）
- ✅ 素材：BGM已统一为`科技冒险双关.mp3`，UI、背景、角色spritesheet、props、obstacles均已入库
- ✅ 基础HUD框架已存在

### 待完成核心工作
1. Props贴图背景彻底去白
2. CharacterSelectScene完善（使用角色选择立绘+待机动画）
3. LevelSelectScene完善（腾讯/小鹏双卡片选择）
4. Intro场景实现（两个关卡的开场介绍）
5. TencentLobbyScene完整实现（横版跑酷、平台跳跃、6道具收集、≥80秒流程）
6. XPengRunScene完整实现（3车道自动跑酷、体力系统、电池收集、速度递增、≥70秒流程）
7. GameOverScene/WinScene完善
8. HUD升级（使用真实UI素材）
9. 全流程音效整合
10. 测试与Bug修复、文档同步

---

## 二、详细执行步骤

### Phase 0: 素材最终处理
**目标：确保所有props贴图无白底，优化去背效果**
- [ ] 运行并优化`scripts/fix_props_bg.py`，使用flood fill边缘检测+alpha羽化替代简单阈值
- [ ] 验证所有prop图片（prop_wechat/qq/games/cloud/content/tech.png + stamina_battery.png）背景透明
- [ ] 验证障碍物图片背景透明

### Phase 1: 菜单流程完善
**目标：完整的角色选择→关卡选择流程**

#### Step 1.1: CharacterSelectScene 完善
- 文件：`js/scenes/CharacterSelectScene.js`
- 修改内容：
  - 使用`bg_char_select.png`作为背景
  - 男女角色使用spritesheet idle动画实时播放（而非静态图）
  - 左右选择时的高亮光效+粒子特效
  - 使用`ui_gender_male.png`/`ui_gender_female.png`作为选择框装饰
  - 确认按钮（空格/回车）带缩放反馈
  - ESC返回主菜单

#### Step 1.2: LevelSelectScene 完善
- 文件：`js/scenes/LevelSelectScene.js`
- 修改内容：
  - 使用`bg_level_select.png`作为背景
  - 两张卡片：左侧腾讯（ui_card_tencent.png）、右侧小鹏（ui_card_xpeng.png）
  - 卡片悬停放大+发光效果
  - 点击/左右选择+回车确认进入对应Intro场景
  - 显示关卡简介文字
  - ESC返回角色选择

#### Step 1.3: Intro场景实现
- 文件：`js/scenes/TencentIntroScene.js`、`js/scenes/XPengIntroScene.js`
- 内容：
  - 显示对应关卡背景+关卡名称+操作提示
  - 文字逐行淡入动画
  - 3秒后自动进入关卡，或按空格/回车跳过
  - 播放BGM

### Phase 2: 腾讯大堂关卡（TencentLobbyScene）
**目标：横版卷轴平台跳跃跑酷，收集6大事业群道具，时长≥80秒**

#### Step 2.1: 关卡配置
- 文件：`js/config.js` TENCENT部分
- 参数：
  - 关卡总长度：12000px（保证80秒@150px/s滚动速度）
  - 地面Y坐标：920px
  - 玩家移动速度：350px/s（可控左右移动）
  - 重力和跳跃参数已在CONFIG.PLAYER中
  - 6个道具位置按区域分布在关卡中（1500px间隔）

#### Step 2.2: 地形与平台生成
- 文件：`js/scenes/TencentLobbyScene.js`
- 实现：
  - 地面：连续平台，使用platform_tiles.png平铺
  - 浮空平台：不同高度随机生成（高度300-700px，宽度120-240px）
  - 平台类型：普通平台、移动平台（左右浮动）
  - 区域背景切换：经过特定X坐标时切换背景（lobby→wechat→qq→games→cloud→content→tech）
  - 视差滚动：远景层慢速、中景层中速、前景快速

#### Step 2.3: 障碍物系统
- 障碍物类型（使用已有obstacles贴图）：
  - 低矮障碍（obs_low_barrier/obs_low_folders/obs_low_servers）：需要跳跃越过（y=820左右）
  - 高墙障碍（obs_high_wall/obs_high_pipes/obs_high_glass）：需要跳跃或找平台绕
  - 激光（obs_laser_beam）：水平激光，需要下蹲通过
  - 数据墙/服务器堆：碰撞掉血
- 碰撞逻辑：AABB碰撞，撞到扣20体力+击退+短暂无敌帧

#### Step 2.4: 道具收集
- 6个事业群道具按顺序排列：wechat(1500px) → qq(3000px) → games(4800px) → cloud(6500px) → content(8200px) → tech(10000px)
- 道具悬浮上下浮动+发光
- 收集时：播放COLLECT音效+粒子爆发+HUD道具槽点亮
- 收集全部6个后触发胜利（到达终点12000px）

#### Step 2.5: 玩家控制
- WASD/方向键：左右移动
- 空格/W/↑：跳跃（支持二段跳）
- S/↓：下蹲（躲避低矮激光）
- 摄像机跟随玩家，X坐标锁定玩家在屏幕1/3位置

#### Step 2.6: 胜负判定
- 胜利条件：收集全部6个道具并到达关卡终点X=12000
- 失败条件：体力≤0（多次碰撞掉血）
- 结束时切换到WinScene/GameOverScene

### Phase 3: 小鹏充电桩关卡（XPengRunScene）
**目标：3车道自动跑酷，体力系统，电池收集，速度递增，时长≥70秒**

#### Step 3.1: 关卡配置
- 文件：`js/config.js` XPENG部分
- 参数：
  - 固定玩家X位置：300px（自动向前跑）
  - 初始速度：400px/s，每10秒+50px/s，最高900px/s
  - 3条车道：Y坐标分别为820/700/580（上中下/左中右）
  - 车道切换：↑/↓键或W/S键切换车道，带平滑过渡动画
  - 体力：初始100，每秒自然消耗1%，撞障碍扣25%
  - 电池：随机生成（间隔3-6秒），碰到+15%体力
  - 关卡时长：70秒强制结束进入胜利（坚持到最后即胜利）

#### Step 3.2: 障碍物生成
- 文件：`js/scenes/XPengRunScene.js`
- 障碍物类型：
  - 地面障碍（obs_cones/obs_low_gate/obs_charger_normal）：需要跳跃（空格/↑）
  - 高空障碍（obs_laser_beam/obs_cable_red）：需要下蹲（S/↓）
  - 车道障碍（obs_charger/obs_machinery/obs_warning_light）：需要左右切换车道
- 生成逻辑：
  - 每隔1.0-2.5秒生成一组障碍
  - 速度越快生成间隔越短
  - 保证至少有一条车道可通行
  - 障碍物从右侧屏幕外生成，向左移动（自动卷轴视觉）

#### Step 3.3: 电池收集
- 体力电池（stamina_battery.png）随机出现在某条车道
- 悬浮发光+旋转动画
- 碰到时：播放COLLECT_BATTERY音效+蓝色粒子+体力恢复15%
- 低体力时（<30%）边缘红色闪烁警告+心跳音效

#### Step 3.4: 速度递增与难度曲线
- 0-20秒：速度400-500，障碍少，间隔长
- 20-45秒：速度500-700，障碍密度增加，出现激光/电缆
- 45-70秒：速度700-900，障碍密集，组合障碍（跳+切车道）
- 每次提速时：播放SPEED_UP音效+速度线粒子特效

#### Step 3.5: 玩家动作
- 自动向前跑（无需按方向键）
- 空格/↑：跳跃（躲避地面障碍）
- S/↓：下蹲滑铲（躲避空中激光/电缆）
- ←/→或A/D：切换车道
- 跳跃/下蹲都有对应动画（jump_start/crouch）

#### Step 3.6: 胜负判定
- 胜利条件：坚持70秒到达终点
- 失败条件：体力≤0
- 结束后进入WinScene/GameOverScene

### Phase 4: HUD与UI完善
**目标：使用真实UI素材，不使用代码绘制的矩形**

#### Step 4.1: HUD.js 重构
- 文件：`js/ui/HUD.js`
- 修改内容：
  - 体力条：使用ui_stamina_bar_bg.png作为槽，根据体力比例选择ui_stamina_bar_fill_green/yellow/orange/red.png填充
  - 道具槽：使用ui_prop_slot_empty.png（空槽）和ui_prop_slot_filled.png（已填充）
  - 道具图标：使用实际的prop_*.png图片而非代码绘制图形
  - 显示当前区域名称（腾讯）或速度/剩余时间（小鹏）
  - 低体力时体力条闪烁红色

### Phase 5: 结算场景完善
#### Step 5.1: GameOverScene
- 文件：`js/scenes/GameOverScene.js`
- 内容：
  - 半透明黑色背景
  - "任务失败"红色标题
  - 失败原因（体力耗尽/碰撞过多）
  - 两个按钮：btn_restart.png（重新开始）、btn_menu.png（返回主菜单）
  - 播放失败音效DIE

#### Step 5.2: WinScene
- 文件：`js/scenes/WinScene.js`
- 内容：
  - 胜利粒子特效（金色/彩色星星）
  - "任务完成！"金色标题
  - 显示收集道具数/用时/评价
  - 企鹅修复动画（ui_penguin_broken→ui_penguin_fixed渐变）
  - 两个按钮：btn_continue.png（继续/下一关）、btn_menu.png
  - 播放胜利音效VICTORY

### Phase 6: 音效整合与优化
**文件：js/engine/AudioManager.js**
- 确保所有SFX在正确时机触发：
  - BUTTON_HOVER：鼠标悬停菜单按钮
  - BUTTON_CLICK：点击按钮/确认
  - JUMP/DOUBLE_JUMP：跳跃/二段跳
  - LAND：落地
  - COLLECT：收集事业群道具
  - COLLECT_BATTERY：收集电池
  - HURT：受伤
  - DIE：死亡
  - VICTORY：胜利
  - TRANSITION：场景切换
  - LASER_WARNING：激光预警
- BGM在关卡开始时播放，关卡结束时淡出

### Phase 7: 测试与同步
- [ ] 启动本地服务器测试完整流程：Boot→主菜单→角色选择→关卡选择→Intro→关卡1→结算→关卡2→结算→Credits
- [ ] 验证每个关卡时长≥1分钟
- [ ] 验证所有素材被使用（无遗漏素材）
- [ ] 验证地形生成合理，无不可通过的死路
- [ ] 验证男女角色动画正确（idle/run/jump/crouch/death/victory）
- [ ] 修复所有控制台报错
- [ ] 更新`素材需求清单.md`标记已使用素材
- [ ] 更新`卓越工程师大冒险-完整开发计划.md`标记Alpha完成

---

## 三、关键技术实现要点

### 1. 腾讯关卡平台生成算法
```
- 地面始终连续（无坑洞，避免新手卡关）
- 浮空平台每隔300-600px生成一组
- 平台高度范围：y=400~800px
- 道具放置在平台上或跳跃可达位置
- 障碍物放置在地面或平台间，保证有解法（跳/蹲/绕）
```

### 2. 小鹏关卡车道系统
```
- 3车道Y坐标：[820, 700, 580]（地面、中、高）
- 车道切换用lerp平滑过渡（0.15秒完成切换）
- 障碍物标记所属车道，玩家当前车道与障碍车道重叠时才判定碰撞
- 跳跃时玩家Y上移-180px，下蹲时高度减半
```

### 3. 摄像机系统（腾讯关）
```
- cameraX = player.x - CONFIG.CANVAS_WIDTH / 3
- 限制cameraX >= 0 且 cameraX <= levelLength - CANVAS_WIDTH
- 所有世界坐标物体绘制时减去cameraX
```

### 4. 自动卷轴（小鹏关）
```
- 不移动摄像机，而是所有障碍物/电池向左移动（speed * dt）
- 玩家固定X=300，通过切换车道改变Y
- 已移出屏幕左侧的物体回收
- 对象池优化：预创建20个障碍+10个电池复用
```

---

## 四、预期文件修改清单

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `scripts/fix_props_bg.py` | 修改 | 优化去白底算法 |
| `js/config.js` | 修改 | 补充关卡参数 |
| `js/scenes/CharacterSelectScene.js` | 重写 | 完整角色选择 |
| `js/scenes/LevelSelectScene.js` | 重写 | 卡片式关卡选择 |
| `js/scenes/TencentIntroScene.js` | 重写 | 腾讯开场 |
| `js/scenes/XPengIntroScene.js` | 重写 | 小鹏开场 |
| `js/scenes/TencentLobbyScene.js` | 重写 | 完整横版跑酷 |
| `js/scenes/XPengRunScene.js` | 重写 | 完整自动跑酷 |
| `js/scenes/GameOverScene.js` | 完善 | 失败结算 |
| `js/scenes/WinScene.js` | 完善 | 胜利结算 |
| `js/ui/HUD.js` | 重写 | 使用真实UI素材 |
| `素材需求清单.md` | 更新 | 标记已使用 |
| `卓越工程师大冒险-完整开发计划.md` | 更新 | 标记Alpha完成 |

---

## 五、风险与应对

1. **角色动画名称不匹配**：已检查Player.js中_resolveAnimName使用的名称（idle/run_right/run_left/jump_start/airborne/landing/crouch/crouch_walk/hurt/death/pickup/victory），将与spritesheet JSON中的键名对齐，缺失动画用idle兜底。

2. **难度过高导致卡关**：Alpha版本采用宽松设计——体力上限100、碰撞伤害25、电池恢复15、初始4条命等价血量、障碍物保证有解。

3. **素材尺寸不一致**：AssetLoader已有自适应缩放逻辑，渲染时统一按配置的宽高绘制。

4. **性能问题**：粒子数量上限200，不可见物体回收，对象池复用，避免每帧创建对象。
