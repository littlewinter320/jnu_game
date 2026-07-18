// ====================================================================
// 《卓越工程师的大冒险》 游戏入口
// ====================================================================
// 所有模块已经通过 <script> 标签按依赖顺序加载到全局作用域中。
// 此处实例化各个子系统并启动主循环。
// ====================================================================

(function () {
    'use strict';

    // -------------------- 实例化子系统 --------------------
    const canvas     = document.getElementById('gameCanvas');
    const renderer   = new Renderer(canvas);
    const input      = new InputHandler(canvas, renderer);
    const audio      = new AudioManager();
    const particles  = new ParticleSystem();
    const sceneMgr   = new SceneManager(renderer, input, audio, particles);
    const assets     = new AssetLoader();

    // -------------------- 注册场景 --------------------
    // 按 CONFIG.SCENES 顺序注册，保证索引对应
    sceneMgr.register('BOOT',            () => new BootScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('MAIN_MENU',       () => new MainMenuScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('CHARACTER_SELECT',() => new CharacterSelectScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('LEVEL_SELECT',    () => new LevelSelectScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('TENCENT_INTRO',   () => new TencentIntroScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('TENCENT_LOBBY',   () => new TencentLobbyScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('XPENG_INTRO',     () => new XPengIntroScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('XPENG_RUN',       () => new XPengRunScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('GAME_OVER',       () => new GameOverScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));
    sceneMgr.register('WIN',             () => new WinScene(renderer, input, audio, particles, sceneMgr.changeScene.bind(sceneMgr)));

    // -------------------- 主循环 --------------------
    let lastTime = performance.now();
    function gameLoop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.05); // 最大 50ms 防止跳帧
        lastTime = now;

        // 更新帧计数（给粒子/动画用）
        renderer._lastDt = dt;

        sceneMgr.update(dt);
        renderer.beginFrame(dt);
        sceneMgr.render();
        renderer.endFrame();

        requestAnimationFrame(gameLoop);
    }

    // 暴露到全局，方便调试/场景内部使用
    window.Game = {
        canvas, renderer, input, audio, particles, sceneMgr, assets,
        state: sceneMgr.gameState
    };

    // -------------------- 启动流程 --------------------
    // 1. AssetLoader 加载 manifest 中声明的所有素材（含自适应缩放逻辑）
    // 2. 加载完成后把图片同步到 renderer.images，保持与 CONFIG.ASSETS.IMAGES 同名键映射
    //    这样所有已有场景代码（MainMenuScene 等）无需修改即可直接使用
    // 3. 启动主循环，进入 BOOT 场景

    const KEY_MAP = {
        // UI (小写→大写映射)
        'logo': 'LOGO', 'btn_start': 'BTN_START', 'btn_end': 'BTN_END',
        'btn_help': 'BTN_HELP', 'btn_credits': 'BTN_CREDITS', 'btn_settings': 'BTN_SETTINGS',
        'start_illustration': 'START_ILLUSTRATION',
        'ui_gender_male': 'UI_GENDER_MALE', 'ui_gender_female': 'UI_GENDER_FEMALE',
        'ui_stamina_bar_bg': 'UI_STAMINA_BAR_BG', 'ui_stamina_bar_fill_green': 'UI_STAMINA_BAR_FILL_GREEN',
        'ui_stamina_bar_fill_yellow': 'UI_STAMINA_BAR_FILL_YELLOW', 'ui_stamina_bar_fill_orange': 'UI_STAMINA_BAR_FILL_ORANGE',
        'ui_stamina_bar_fill_red': 'UI_STAMINA_BAR_FILL_RED',
        'ui_prop_slot_empty': 'UI_PROP_SLOT_EMPTY', 'ui_prop_slot_filled': 'UI_PROP_SLOT_FILLED',
        'ui_card_tencent': 'UI_CARD_TENCENT', 'ui_card_xpeng': 'UI_CARD_XPENG', 'ui_card_back': 'UI_CARD_BACK',
        'ui_penguin_broken': 'UI_PENGUIN_BROKEN', 'ui_penguin_fixed': 'UI_PENGUIN_FIXED',
        'ui_xpeng_car': 'UI_XPENG_CAR', 'ui_dialog_box': 'UI_DIALOG_BOX',
        'btn_restart': 'BTN_RESTART', 'btn_menu': 'BTN_MENU', 'btn_continue': 'BTN_CONTINUE',
        'lock_icon': 'LOCK_ICON', 'star_empty': 'STAR_EMPTY', 'star_filled': 'STAR_FILLED',
        // 背景
        'bg_main_menu': 'BG_MAIN_MENU', 'bg_character_select': 'BG_CHARACTER_SELECT',
        'bg_level_select': 'BG_LEVEL_SELECT', 'bg_tencent_lobby': 'BG_TENCENT_LOBBY',
        'bg_tencent_wechat': 'BG_TENCENT_WECHAT', 'bg_tencent_qq': 'BG_TENCENT_QQ',
        'bg_tencent_games': 'BG_TENCENT_GAMES', 'bg_tencent_cloud': 'BG_TENCENT_CLOUD',
        'bg_tencent_content': 'BG_TENCENT_CONTENT', 'bg_tencent_tech': 'BG_TENCENT_TECH',
        'bg_tencent_repair': 'BG_TENCENT_REPAIR', 'bg_xpeng_stage1': 'BG_XPENG_STAGE1',
        'bg_xpeng_stage2': 'BG_XPENG_STAGE2', 'bg_xpeng_ending': 'BG_XPENG_ENDING',
        // 角色
        'male_idle': 'MALE_IDLE', 'male_run': 'MALE_RUN', 'male_jump': 'MALE_JUMP',
        'male_crouch': 'MALE_CROUCH', 'male_death': 'MALE_DEATH',
        'female_idle': 'FEMALE_IDLE', 'female_run': 'FEMALE_RUN', 'female_jump': 'FEMALE_JUMP',
        'female_crouch': 'FEMALE_CROUCH', 'female_death': 'FEMALE_DEATH',
        // 道具
        'prop_wechat': 'PROP_WECHAT', 'prop_qq': 'PROP_QQ', 'prop_games': 'PROP_GAMES',
        'prop_cloud': 'PROP_CLOUD', 'prop_content': 'PROP_CONTENT', 'prop_tech': 'PROP_TECH',
        'stamina_battery': 'STAMINA_BATTERY'
    };

    function syncImagesToRenderer() {
        // 把 assets 中所有加载好的图片，按 KEY_MAP 映射到 renderer.images[大写键名]
        renderer.images = renderer.images || {};
        for (const [lowerKey, upperKey] of Object.entries(KEY_MAP)) {
            const cat = assets.images;
            // 查找分类
            for (const section of ['ui', 'backgrounds', 'characters', 'props']) {
                if (cat[section] && cat[section][lowerKey]) {
                    const entry = cat[section][lowerKey];
                    if (entry.image) renderer.images[upperKey] = entry.image;
                    break;
                }
            }
        }
    }

    // -------------------- 显示加载进度 --------------------
    const loaderEl = document.getElementById('loader');
    const progressText = loaderEl ? loaderEl.querySelector('.loader-text') : null;
    function showProgress(p) {
        if (progressText) progressText.textContent = `加载素材... ${Math.round(p * 100)}%`;
    }

    assets.loadAll(showProgress).then(() => {
        syncImagesToRenderer();
        if (loaderEl) loaderEl.style.display = 'none';
        requestAnimationFrame(gameLoop);
        sceneMgr.changeScene(CONFIG.SCENES.BOOT);
        console.log('[卓越工程师大冒险] 游戏已启动，已加载素材分类：',
            Object.keys(assets.images).map(k => `${k}:${Object.keys(assets.images[k]).length}`).join(', '));
    }).catch(err => {
        console.error('素材加载部分失败，使用占位图模式继续：', err);
        // 即使加载失败也启动游戏，占位图会自动显示
        if (loaderEl) loaderEl.style.display = 'none';
        requestAnimationFrame(gameLoop);
        sceneMgr.changeScene(CONFIG.SCENES.BOOT);
    });

})();
