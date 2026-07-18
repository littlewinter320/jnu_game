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
        sceneMgr.render();
        input.endFrame();

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
        'LOGO': 'LOGO',
        'BTN_START': 'BTN_START', 'BTN_END': 'BTN_END',
        'BTN_HELP': 'BTN_HELP', 'BTN_CREDITS': 'BTN_CREDITS',
        'BTN_SETTINGS': 'BTN_SETTINGS',
        'BG_MAIN_MENU': 'BG_MAIN_MENU', 'BG_MAIN': 'BG_MAIN_MENU'
    };

    function syncImagesToRenderer() {
        renderer.images = renderer.images || {};
        // 直接同步 ui/backgrounds 下所有已加载图片
        for (const section of ['ui', 'backgrounds', 'props', 'puzzles', 'obstacles']) {
            const items = assets.images[section];
            if (!items) continue;
            for (const [key, entry] of Object.entries(items)) {
                if (entry.image) renderer.images[key] = entry.image;
            }
        }
        // 别名映射（兼容旧代码中的键名）
        const aliases = { 'BG_MAIN_MENU': ['BG_MAIN'] };
        for (const [src, dsts] of Object.entries(aliases)) {
            if (renderer.images[src]) {
                for (const dst of dsts) {
                    if (!renderer.images[dst]) renderer.images[dst] = renderer.images[src];
                }
            }
        }
    }

    // -------------------- 显示加载进度 --------------------
    const loaderEl = document.getElementById('loading-overlay');
    const progressBar = document.getElementById('loading-bar');
    const progressText = document.getElementById('loading-text');
    function showProgress(p) {
        if (progressBar) progressBar.style.width = `${Math.round(p * 100)}%`;
        if (progressText) progressText.textContent = `正在加载资源... ${Math.round(p * 100)}%`;
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
