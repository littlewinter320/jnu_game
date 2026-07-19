const CONFIG = {
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,

    GRAVITY: 2400,
    MAX_FALL_SPEED: 1400,

    PLAYER: {
        JUMP_FORCE: -820,
        DOUBLE_JUMP_FORCE: -700,
        MOVE_SPEED: 420,
        CROUCH_SPEED: 220,
        MAX_STAMINA: 100,
        STAMINA_DRAIN_RATE: 0,
        STAMINA_RECOVER_RATE: 8,
        WIDTH: 90,
        HEIGHT: 110,
        CROUCH_HEIGHT: 65,
        INVINCIBLE_TIME: 1.2,
        DAMAGE_OBSTACLE: 22,
        DAMAGE_FALL: 0,
        DOUBLE_JUMP: true
    },

    TILES: {
        TILE_SIZE: 64,
        GROUND_TILE: 0,
        PLATFORM_LEFT: 1,
        PLATFORM_MIDDLE: 2,
        PLATFORM_RIGHT: 3,
        WALL_TILE: 4,
        CEILING_TILE: 5,
        INNER_CORNER: 6
    },

    KEYS: {
        UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight',
        JUMP: 'Space', CROUCH: 'KeyS', ENTER: 'Enter', ESC: 'Escape',
        W: 'KeyW', A: 'KeyA', S: 'KeyS', D: 'KeyD'
    },

    TENCENT: {
        LEVEL_LENGTH: 14000,
        GROUND_Y: 940,
        GROUND_H: 200,
        PLAYER_START_X: 200,
        PLAYER_START_Y: 830,
        CAMERA_OFFSET_X: 500,
        DEATH_Y: 1200,
        VIRUS_SPEED: 180,
        VIRUS_JUMP_FORCE: -600,
        VIRUS_DETECT_RANGE: 600,
        VIRUS_JUMP_INTERVAL: 2.0,
        VIRUS_SIZE: 70,
        EXIT_X: 13500,
        EXIT_WIDTH: 200,
        EXIT_HEIGHT: 300,
        EXIT_LIGHT_RADIUS: 400,
        BG_SCROLL_PARALLAX: 0.3,
        AREA_CHANGE_THRESHOLDS: [0, 2000, 4000, 6000, 8000, 10000, 11500],
        AREA_BG_KEYS: [
            'BG_TENCENT_LOBBY',
            'BG_TENCENT_WECHAT',
            'BG_TENCENT_QQ',
            'BG_TENCENT_GAMES',
            'BG_TENCENT_CLOUD',
            'BG_TENCENT_CONTENT',
            'BG_TENCENT_TECH'
        ],
        AREA_NAMES: [
            '腾讯大堂',
            '微信事业群',
            'QQ社交区',
            '互动娱乐区',
            '云与智慧产业区',
            '平台内容区',
            '技术工程区'
        ],
        PROP_TARGETS: [
            { key: 'PROP_WECHAT', x: 1600, area: 'wechat' },
            { key: 'PROP_QQ', x: 3600, area: 'qq' },
            { key: 'PROP_GAMES', x: 5600, area: 'games' },
            { key: 'PROP_CLOUD', x: 7600, area: 'cloud' },
            { key: 'PROP_CONTENT', x: 9600, area: 'content' },
            { key: 'PROP_TECH', x: 11600, area: 'tech' }
        ],
        DECORATIVE_OBSTACLES: [
            'OBS_BARRIER_FULL', 'OBS_CONES', 'OBS_GATE_FULL',
            'OBS_HIGH_ARCADE', 'OBS_HIGH_GLASS', 'OBS_HIGH_ICE',
            'OBS_HIGH_NEWS', 'OBS_HIGH_PIPES', 'OBS_HIGH_WALL',
            'OBS_LOW_BLOCKS', 'OBS_LOW_FOLDERS', 'OBS_LOW_SERVERS',
            'OBS_MACHINERY', 'OBS_MOVING_PLATFORM', 'OBS_SPIKE_FULL',
            'OBS_WALL_FULL', 'OBS_WARNING_LIGHT', 'OBS_ALARM',
            'OBS_BATTERY_PACK', 'OBS_CABLE_1', 'OBS_CABLE_2',
            'OBS_CABLE_PLUG', 'OBS_CHARGER', 'OBS_CHARGER_BURNING',
            'OBS_ENERGY_CORE', 'OBS_LASER_BEAM', 'OBS_LASER_CROSS4',
            'OBS_LASER_CROSSX', 'OBS_LASER_EMITTER_H', 'OBS_LASER_EMITTER_V',
            'OBS_LASER_GATE', 'OBS_LASER_GUN', 'OBS_LOW_BALLOONS',
            'OBS_LOW_BARRIER', 'OBS_SPIKE_TRAP'
        ],
        DEADLY_OBSTACLES: [
            'OBS_CABLE_RED', 'OBS_LASER_SPHERE', 'OBS_CHARGER_DAMAGED'
        ],
        PLATFORM_LAYOUT: [
            { x: 500, y: 780, w: 4, type: 'platform' },
            { x: 900, y: 680, w: 3, type: 'platform' },
            { x: 1300, y: 780, w: 5, type: 'platform' },
            { x: 2800, y: 780, w: 4, type: 'platform' },
            { x: 3300, y: 680, w: 3, type: 'platform' },
            { x: 3800, y: 580, w: 4, type: 'platform' },
            { x: 4400, y: 680, w: 3, type: 'platform' },
            { x: 5000, y: 780, w: 5, type: 'platform' },
            { x: 5800, y: 680, w: 4, type: 'platform' },
            { x: 6500, y: 580, w: 3, type: 'platform' },
            { x: 7100, y: 680, w: 4, type: 'platform' },
            { x: 7800, y: 780, w: 5, type: 'platform' },
            { x: 8700, y: 680, w: 3, type: 'platform' },
            { x: 9300, y: 580, w: 4, type: 'platform' },
            { x: 10000, y: 680, w: 3, type: 'platform' },
            { x: 10600, y: 780, w: 5, type: 'platform' },
            { x: 11500, y: 680, w: 4, type: 'platform' },
            { x: 12200, y: 580, w: 3, type: 'platform' },
            { x: 12800, y: 680, w: 4, type: 'platform' }
        ],
        GROUND_GAPS: [
            { x: 2000, w: 200 },
            { x: 4200, w: 250 },
            { x: 6200, w: 180 },
            { x: 8200, w: 220 },
            { x: 10200, w: 200 },
            { x: 12000, w: 180 }
        ]
    },

    XPENG: {
        GROUND_Y: 940,
        PLAYER_X: 280,
        BASE_SPEED: 420,
        MAX_SPEED: 900,
        SPEED_INCREASE_INTERVAL: 8,
        SPEED_INCREASE_AMOUNT: 60,
        DURATION: 75,
        STAMINA_DECAY_PER_SEC: 0.8,
        STAMINA_JUMP_COST: 2,
        BATTERY_SPAWN_MIN: 2.5,
        BATTERY_SPAWN_MAX: 5,
        OBSTACLE_SPAWN_MIN: 0.9,
        OBSTACLE_SPAWN_MAX: 2.2,
        BATTERY_RESTORE: 18,
        DAMAGE_OBSTACLE: 28,
        LANES: [
            { y: 880, h: 60 },
            { y: 760, h: 60 },
            { y: 640, h: 60 }
        ],
        LANE_SWITCH_TIME: 0.2,
        JUMP_HEIGHT: 170,
        JUMP_TIME: 0.55,
        CROUCH_DURATION: 0.5,
        BG_BLEND_SPEED: 2.0,
        BG_KEYS: [
            'BG_XPENG_STAGE1',
            'BG_XPENG_STAGE2'
        ]
    },

    PARTICLES: {
        MAX_COUNT: 250, JUMP_COUNT: 10, COLLECT_COUNT: 20,
        EXPLOSION_COUNT: 30, LOW_STAMINA_COUNT: 3
    },

    SCENES: {
        BOOT: 'BOOT', MAIN_MENU: 'MAIN_MENU', CHARACTER_SELECT: 'CHARACTER_SELECT',
        LEVEL_SELECT: 'LEVEL_SELECT', CREDITS: 'CREDITS',
        TENCENT_INTRO: 'TENCENT_INTRO', TENCENT_LOBBY: 'TENCENT_LOBBY',
        XPENG_INTRO: 'XPENG_INTRO', XPENG_RUN: 'XPENG_RUN',
        GAME_OVER: 'GAME_OVER', WIN: 'WIN'
    },

    ASSETS: {
        SOUNDS: {
            BGM: {
                ADVENTURE: 'assets/sounds/bgm/bgm_adventure.mp3',
                MAIN_MENU: 'assets/sounds/bgm/bgm_adventure.mp3',
                TENCENT: 'assets/sounds/bgm/bgm_adventure.mp3',
                XPENG: 'assets/sounds/bgm/bgm_adventure.mp3'
            },
            SFX: {
                BUTTON_HOVER: { type: 'beep', freq: 800, dur: 0.05, wave: 'square', vol: 0.12 },
                BUTTON_CLICK: { type: 'slide', f1: 500, f2: 300, dur: 0.1, wave: 'square', vol: 0.18 },
                JUMP:         { type: 'slide', f1: 280, f2: 620, dur: 0.16, wave: 'square', vol: 0.2 },
                DOUBLE_JUMP:  { type: 'slide', f1: 400, f2: 850, dur: 0.13, wave: 'square', vol: 0.2 },
                LAND:         { type: 'thump', freq: 90, dur: 0.12, vol: 0.22 },
                COLLECT:      { type: 'arp', freqs: [523, 659, 784, 1047], dur: 0.12, wave: 'square', vol: 0.22 },
                COLLECT_BATTERY: { type: 'arp', freqs: [440, 660, 880, 1100, 1320], dur: 0.18, wave: 'sawtooth', vol: 0.22 },
                HURT:         { type: 'slide', f1: 320, f2: 120, dur: 0.28, wave: 'sawtooth', vol: 0.25 },
                DIE:          { type: 'slide', f1: 380, f2: 60, dur: 0.7, wave: 'sawtooth', vol: 0.28 },
                VICTORY:      { type: 'arp', freqs: [523, 659, 784, 1047, 1319], dur: 0.15, wave: 'square', vol: 0.25 },
                LASER_WARNING:{ type: 'alarm', freqs: [800, 600], dur: 0.25, wave: 'square', vol: 0.12 },
                TRANSITION:   { type: 'noise', dur: 0.2, vol: 0.08 },
                SPEED_UP:     { type: 'slide', f1: 200, f2: 800, dur: 0.3, wave: 'sawtooth', vol: 0.15 },
                HEARTBEAT:    { type: 'thump', freq: 60, dur: 0.15, vol: 0.3 },
                VIRUS_ALERT:  { type: 'alarm', freqs: [300, 200], dur: 0.2, wave: 'sawtooth', vol: 0.2 }
            }
        }
    },

    UI: {
        BUTTON_HOVER_SCALE: 1.08,
        BUTTON_CLICK_SCALE: 0.95,
        DIALOG_PADDING: 40,
        STAMINA_BAR_W: 270,
        STAMINA_BAR_H: 40,
        PROP_SLOT_SIZE: 70
    }
};
