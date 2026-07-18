// 全局配置常量
const CONFIG = {
    // 画布基准分辨率
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,

    // 物理参数
    GRAVITY: 2400,
    MAX_FALL_SPEED: 1200,

    // 玩家参数
    PLAYER: {
        JUMP_FORCE: -750,
        DOUBLE_JUMP_FORCE: -600,
        MOVE_SPEED: 400,
        CROUCH_SPEED: 200,
        MAX_STAMINA: 100,
        STAMINA_DRAIN_RATE: 2,      // 每秒消耗体力
        STAMINA_RECOVER_RATE: 15,   // 电池恢复体力
        WIDTH: 96,
        HEIGHT: 96
    },

    // 按键配置
    KEYS: {
        UP: 'ArrowUp',
        DOWN: 'ArrowDown',
        LEFT: 'ArrowLeft',
        RIGHT: 'ArrowRight',
        JUMP: 'Space',
        CROUCH: 'KeyC',
        ENTER: 'Enter',
        ESC: 'Escape',
        W: 'KeyW',
        A: 'KeyA',
        S: 'KeyS',
        D: 'KeyD'
    },

    // 腾讯关卡参数
    TENCENT: {
        AREAS: ['lobby', 'wechat', 'qq', 'games', 'cloud', 'content', 'tech', 'repair'],
        AREA_NAMES: {
            lobby: '腾讯大堂',
            wechat: '微信事业群',
            qq: 'QQ社交区',
            games: '互动娱乐区',
            cloud: '云与智慧产业区',
            content: '平台内容区',
            tech: '技术工程区',
            repair: '企鹅修复台'
        },
        SCROLL_SPEED: 300,
        PROP_COUNT: 6  // 六大事业群道具
    },

    // 小鹏关卡参数
    XPENG: {
        LANES_STAGE1: 3,
        LANES_STAGE2: 6,
        STAGE1_BASE_SPEED: 400,
        STAGE1_MAX_SPEED: 900,
        STAGE1_SPEED_INCREASE: 50,    // 每次提速增量
        STAGE1_DURATION: 240,         // 阶段一总时长（秒）
        STAGE2_SPEED: 700,
        STAGE2_DURATION: 150,         // 阶段二总时长（秒）
        BATTERY_SPAWN_INTERVAL: 8     // 电池生成间隔（秒）
    },

    PARTICLES: {
        MAX_COUNT: 200,
        JUMP_COUNT: 8,
        COLLECT_COUNT: 15,
        EXPLOSION_COUNT: 30,
        LOW_STAMINA_COUNT: 3
    },

    SCENES: {
        BOOT: 'BOOT',
        MAIN_MENU: 'MAIN_MENU',
        CHARACTER_SELECT: 'CHARACTER_SELECT',
        LEVEL_SELECT: 'LEVEL_SELECT',
        TENCENT_INTRO: 'TENCENT_INTRO',
        TENCENT_LOBBY: 'TENCENT_LOBBY',
        XPENG_INTRO: 'XPENG_INTRO',
        XPENG_RUN: 'XPENG_RUN',
        GAME_OVER: 'GAME_OVER',
        WIN: 'WIN'
    },

    ASSETS: {
        SOUNDS: { BGM: {}, SFX: {} }
    }
};
