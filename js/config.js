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

    // 粒子系统
    PARTICLES: {
        MAX_COUNT: 200,
        JUMP_COUNT: 8,
        COLLECT_COUNT: 15,
        EXPLOSION_COUNT: 30,
        LOW_STAMINA_COUNT: 3
    },

    // 场景名称
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

    // 资源路径
    ASSETS: {
        IMAGES: {
            // 已有UI素材
            LOGO: '游戏素材/jnu_game/开始界面/卓越工程师_UI界面素材_像素风/ui_assets_pack/01_游戏Logo_卓越工程师的大冒险.png',
            BTN_START: '游戏素材/jnu_game/开始界面/卓越工程师_UI界面素材_像素风/ui_assets_pack/02_开始游戏按钮.png',
            BTN_END: '游戏素材/jnu_game/开始界面/卓越工程师_UI界面素材_像素风/ui_assets_pack/03_结束游戏按钮.png',
            BTN_HELP: '游戏素材/jnu_game/开始界面/卓越工程师_UI界面素材_像素风/ui_assets_pack/04_操作说明按钮.png',
            BTN_CREDITS: '游戏素材/jnu_game/开始界面/卓越工程师_UI界面素材_像素风/ui_assets_pack/05_制作人员按钮.png',
            BTN_SETTINGS: '游戏素材/jnu_game/开始界面/卓越工程师_UI界面素材_像素风/ui_assets_pack/06_设置按钮.png',
            BG_MAIN: '游戏素材/jnu_game/开始界面/开始界面背景.png',

            // 角色贴图（待用户提供）
            MALE_IDLE: 'assets/images/characters/male_idle.png',
            MALE_RUN: 'assets/images/characters/male_run.png',
            MALE_JUMP: 'assets/images/characters/male_jump.png',
            MALE_CROUCH: 'assets/images/characters/male_crouch.png',
            MALE_DEATH: 'assets/images/characters/male_death.png',
            FEMALE_IDLE: 'assets/images/characters/female_idle.png',
            FEMALE_RUN: 'assets/images/characters/female_run.png',
            FEMALE_JUMP: 'assets/images/characters/female_jump.png',
            FEMALE_CROUCH: 'assets/images/characters/female_crouch.png',
            FEMALE_DEATH: 'assets/images/characters/female_death.png',

            // 背景贴图（待用户提供）
            BG_CHAR_SELECT: 'assets/images/backgrounds/bg_character_select.png',
            BG_LEVEL_SELECT: 'assets/images/backgrounds/bg_level_select.png',
            BG_TENCENT_LOBBY: 'assets/images/backgrounds/bg_tencent_lobby.png',
            BG_TENCENT_WECHAT: 'assets/images/backgrounds/bg_tencent_wechat.png',
            BG_TENCENT_QQ: 'assets/images/backgrounds/bg_tencent_qq.png',
            BG_TENCENT_GAMES: 'assets/images/backgrounds/bg_tencent_games.png',
            BG_TENCENT_CLOUD: 'assets/images/backgrounds/bg_tencent_cloud.png',
            BG_TENCENT_CONTENT: 'assets/images/backgrounds/bg_tencent_content.png',
            BG_TENCENT_TECH: 'assets/images/backgrounds/bg_tencent_tech.png',
            BG_TENCENT_REPAIR: 'assets/images/backgrounds/bg_tencent_repair.png',
            BG_XPENG_STAGE1: 'assets/images/backgrounds/bg_xpeng_stage1.png',
            BG_XPENG_STAGE2: 'assets/images/backgrounds/bg_xpeng_stage2.png',
            BG_XPENG_ENDING: 'assets/images/backgrounds/bg_xpeng_ending.png',

            // 道具贴图（待用户提供）
            PROP_WECHAT: 'assets/images/props/prop_wechat.png',
            PROP_QQ: 'assets/images/props/prop_qq.png',
            PROP_GAMES: 'assets/images/props/prop_games.png',
            PROP_CLOUD: 'assets/images/props/prop_cloud.png',
            PROP_CONTENT: 'assets/images/props/prop_content.png',
            PROP_TECH: 'assets/images/props/prop_tech.png',
            STAMINA_BATTERY: 'assets/images/props/stamina_battery.png',

            // 障碍贴图（待用户提供）
            OBSTACLE_DIALOG: 'assets/images/obstacles/obstacle_dialog.png',
            OBSTACLE_EMOJI: 'assets/images/obstacles/obstacle_emoji.png',
            OBSTACLE_PLATFORM: 'assets/images/obstacles/obstacle_pixel_platform.png',
            OBSTACLE_DATA_STREAM: 'assets/images/obstacles/obstacle_data_stream.png',
            OBSTACLE_TIMELINE: 'assets/images/obstacles/obstacle_video_timeline.png',
            OBSTACLE_GEAR: 'assets/images/obstacles/obstacle_gear.png',
            OBSTACLE_STEAM: 'assets/images/obstacles/obstacle_steam_pipe.png',
            OBSTACLE_LOW: 'assets/images/obstacles/obstacle_low_barrier.png',
            OBSTACLE_HIGH: 'assets/images/obstacles/obstacle_high_wall.png',
            OBSTACLE_DATA_WALL: 'assets/images/obstacles/obstacle_data_wall.png',
            OBSTACLE_GAP: 'assets/images/obstacles/obstacle_gap.png',
            OBSTACLE_ROBOT: 'assets/images/obstacles/obstacle_robot.png',
            OBSTACLE_VORTEX: 'assets/images/obstacles/obstacle_vortex.png',
            OBSTACLE_LASER_FENCE: 'assets/images/obstacles/obstacle_laser_fence.png',
            LASER_GROUND: 'assets/images/obstacles/laser_ground.png',
            LASER_AIR: 'assets/images/obstacles/laser_air.png',
            LASER_CROSS: 'assets/images/obstacles/laser_cross.png',
            LASER_TRACKING: 'assets/images/obstacles/laser_tracking.png',
            LASER_ROTATING: 'assets/images/obstacles/laser_rotating.png',
            OBSTACLE_CABLE: 'assets/images/obstacles/obstacle_cable.png',
            OBSTACLE_CHARGING: 'assets/images/obstacles/obstacle_charging_pile.png',

            // UI贴图（待用户提供）
            UI_MALE: 'assets/images/ui/ui_gender_male.png',
            UI_FEMALE: 'assets/images/ui/ui_gender_female.png',
            UI_STAMINA_BG: 'assets/images/ui/ui_stamina_bar_bg.png',
            UI_STAMINA_GREEN: 'assets/images/ui/ui_stamina_bar_fill_green.png',
            UI_STAMINA_YELLOW: 'assets/images/ui/ui_stamina_bar_fill_yellow.png',
            UI_STAMINA_ORANGE: 'assets/images/ui/ui_stamina_bar_fill_orange.png',
            UI_STAMINA_RED: 'assets/images/ui/ui_stamina_bar_fill_red.png',
            UI_PROP_EMPTY: 'assets/images/ui/ui_prop_slot_empty.png',
            UI_PROP_FILLED: 'assets/images/ui/ui_prop_slot_filled.png',
            UI_CARD_TENCENT: 'assets/images/ui/ui_card_tencent.png',
            UI_CARD_XPENG: 'assets/images/ui/ui_card_xpeng.png',
            UI_CARD_BACK: 'assets/images/ui/ui_card_back.png',
            UI_PENGUIN_BROKEN: 'assets/images/ui/ui_penguin_broken.png',
            UI_PENGUIN_FIXED: 'assets/images/ui/ui_penguin_fixed.png',
            UI_XPENG_CAR: 'assets/images/ui/ui_xpeng_car.png',
            UI_DIALOG_BOX: 'assets/images/ui/ui_dialog_box.png'
        },
        SOUNDS: {
            BGM: {
                MAIN_MENU: 'assets/sounds/bgm/bgm_main_menu.mp3',
                TENCENT: 'assets/sounds/bgm/bgm_tencent.mp3',
                TENCENT_PUZZLE: 'assets/sounds/bgm/bgm_tencent_puzzle.mp3',
                TENCENT_ENDING: 'assets/sounds/bgm/bgm_tencent_ending.mp3',
                XPENG_STAGE1: 'assets/sounds/bgm/bgm_xpeng_stage1.mp3',
                XPENG_STAGE1_LOW: 'assets/sounds/bgm/bgm_xpeng_stage1_low_stamina.mp3',
                XPENG_STAGE2: 'assets/sounds/bgm/bgm_xpeng_stage2.mp3',
                XPENG_ENDING: 'assets/sounds/bgm/bgm_xpeng_ending.mp3'
            },
            SFX: {
                BUTTON_CLICK: 'assets/sounds/sfx/sfx_button_click.mp3',
                BUTTON_HOVER: 'assets/sounds/sfx/sfx_button_hover.mp3',
                JUMP: 'assets/sounds/sfx/sfx_jump.mp3',
                DOUBLE_JUMP: 'assets/sounds/sfx/sfx_double_jump.mp3',
                CROUCH: 'assets/sounds/sfx/sfx_crouch.mp3',
                LAND: 'assets/sounds/sfx/sfx_land.mp3',
                COLLECT_PROP: 'assets/sounds/sfx/sfx_collect_prop.mp3',
                COLLECT_BATTERY: 'assets/sounds/sfx/sfx_collect_battery.mp3',
                PUZZLE_SOLVE: 'assets/sounds/sfx/sfx_puzzle_solve.mp3',
                PUZZLE_WRONG: 'assets/sounds/sfx/sfx_puzzle_wrong.mp3',
                LASER_HIT: 'assets/sounds/sfx/sfx_laser_hit.mp3',
                OBSTACLE_HIT: 'assets/sounds/sfx/sfx_obstacle_hit.mp3',
                STAMINA_LOW: 'assets/sounds/sfx/sfx_stamina_low.mp3',
                STAMINA_EMPTY: 'assets/sounds/sfx/sfx_stamina_empty.mp3',
                DEATH: 'assets/sounds/sfx/sfx_death.mp3',
                PENGUIN_REPAIR: 'assets/sounds/sfx/sfx_penguin_repair.mp3',
                PENGUIN_ACTIVATE: 'assets/sounds/sfx/sfx_penguin_activate.mp3',
                CAR_ENGINE: 'assets/sounds/sfx/sfx_car_engine_start.mp3',
                CAR_DRIVE: 'assets/sounds/sfx/sfx_car_drive.mp3',
                THUNDER: 'assets/sounds/sfx/sfx_thunder.mp3',
                RAIN: 'assets/sounds/sfx/sfx_rain.mp3',
                TRANSITION: 'assets/sounds/sfx/sfx_transition.mp3',
                SPEED_UP: 'assets/sounds/sfx/sfx_speed_up.mp3',
                LASER_WARNING: 'assets/sounds/sfx/sfx_laser_warning.mp3',
                LASER_CHARGE: 'assets/sounds/sfx/sfx_laser_charge.mp3',
                GAME_OVER: 'assets/sounds/sfx/sfx_game_over.mp3',
                GAME_CLEAR: 'assets/sounds/sfx/sfx_game_clear.mp3',
                DATA_WALL: 'assets/sounds/sfx/sfx_data_wall.mp3',
                PENGUIN_BOW: 'assets/sounds/sfx/sfx_penguin_bow.mp3'
            }
        }
    }
};
