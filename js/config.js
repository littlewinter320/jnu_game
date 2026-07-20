const CONFIG = {
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,

    GRAVITY: 2400,
    MAX_FALL_SPEED: 1400,

    PLAYER: {
        JUMP_FORCE: -900,
        DOUBLE_JUMP_FORCE: -750,
        MOVE_SPEED: 440,
        CROUCH_SPEED: 230,
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
        VIRUS_SPEED: 340,
        VIRUS_JUMP_FORCE: -980,
        VIRUS_DETECT_RANGE: 800,
        VIRUS_JUMP_INTERVAL: 1.4,
        VIRUS_SIZE: 75,
        RANGED_VIRUS_SPEED: 150,
        RANGED_VIRUS_SIZE: 60,
        PROJECTILE_SPEED: 450,
        PROJECTILE_LIFE: 8.0,
        SHIELD_DURATION: 8.0,
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
        DECORATIVE_OBSTACLES: [],
        DEADLY_OBSTACLES: [
            'OBS_CABLE_RED', 'OBS_LASER_SPHERE', 'OBS_CHARGER_DAMAGED'
        ],
        PLATFORM_LAYOUT: [
            { x: 450, y: 790, w: 4, type: 'platform' },
            { x: 850, y: 700, w: 3, type: 'platform' },
            { x: 1250, y: 770, w: 4, type: 'platform' },
            { x: 1700, y: 660, w: 3, type: 'platform' },
            { x: 2700, y: 790, w: 5, type: 'platform' },
            { x: 3200, y: 700, w: 3, type: 'platform' },
            { x: 3650, y: 610, w: 4, type: 'platform' },
            { x: 4200, y: 720, w: 3, type: 'platform' },
            { x: 4700, y: 790, w: 4, type: 'platform' },
            { x: 5300, y: 680, w: 3, type: 'platform' },
            { x: 5900, y: 600, w: 4, type: 'platform' },
            { x: 6400, y: 710, w: 3, type: 'platform' },
            { x: 6900, y: 790, w: 5, type: 'platform' },
            { x: 7500, y: 680, w: 3, type: 'platform' },
            { x: 8100, y: 590, w: 4, type: 'platform' },
            { x: 8600, y: 710, w: 3, type: 'platform' },
            { x: 9100, y: 790, w: 4, type: 'platform' },
            { x: 9700, y: 680, w: 3, type: 'platform' },
            { x: 10300, y: 600, w: 4, type: 'platform' },
            { x: 10800, y: 720, w: 3, type: 'platform' },
            { x: 11400, y: 790, w: 5, type: 'platform' },
            { x: 12000, y: 680, w: 3, type: 'platform' },
            { x: 12600, y: 600, w: 4, type: 'platform' },
            { x: 13100, y: 710, w: 3, type: 'platform' }
        ],
        MOVING_PLATFORMS: [
            { x: 2200, y: 720, w: 3, type: 'metal', moving: true, movePattern: 'vertical', moveRange: 90, moveSpeed: 55 },
            { x: 4500, y: 650, w: 3, type: 'tech', moving: true, movePattern: 'horizontal', moveRange: 160, moveSpeed: 75 },
            { x: 6700, y: 550, w: 3, type: 'metal', moving: true, movePattern: 'vertical', moveRange: 100, moveSpeed: 60 },
            { x: 8400, y: 650, w: 3, type: 'tech', moving: true, movePattern: 'horizontal', moveRange: 180, moveSpeed: 80 },
            { x: 10500, y: 550, w: 3, type: 'metal', moving: true, movePattern: 'vertical', moveRange: 110, moveSpeed: 65 },
            { x: 12400, y: 650, w: 3, type: 'tech', moving: true, movePattern: 'horizontal', moveRange: 150, moveSpeed: 70 }
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
        BASE_SPEED: 320,
        MAX_SPEED: 800,
        SPEED_INCREASE_INTERVAL: 11,
        SPEED_INCREASE_AMOUNT: 60,
        DURATION: 120,
        STAMINA_DECAY_PER_SEC: 2.0,
        STAMINA_JUMP_COST: 3.0,
        STAMINA_CROUCH_COST: 1.0,
        CROUCH_SPEED_MULTIPLIER: 0.9,
        DIFFICULTY_INTERVAL: 30,
        DIFFICULTY_INCREASE: 0.1,
        BATTERY_SPAWN_MIN: 2.5,
        BATTERY_SPAWN_MAX: 5,
        OBSTACLE_SPAWN_MIN: 1.32,
        OBSTACLE_SPAWN_MAX: 2.43,
        OBSTACLE_SPAWN_MIN_EARLY: 2.1,
        OBSTACLE_SPAWN_MAX_EARLY: 3.68,
        EARLY_PHASE_DURATION: 60,
        BATTERY_RESTORE: 22,
        DAMAGE_OBSTACLE: 26,
        LANES: [
            { y: 880, h: 60 },
            { y: 760, h: 60 },
            { y: 640, h: 60 }
        ],
        LANE_SWITCH_TIME: 0.2,
        JUMP_HEIGHT: 175,
        JUMP_TIME: 0.45,
        SHIELD_DURATION: 4.0,
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
                VIRUS_ALERT:  { type: 'alarm', freqs: [300, 200], dur: 0.2, wave: 'sawtooth', vol: 0.2 },
                SHIELD_PICKUP: { type: 'arp', freqs: [330, 440, 550, 660], dur: 0.2, wave: 'triangle', vol: 0.25 },
                KILL:         { type: 'kill', freqs: [600, 200], dur: 0.15, wave: 'square', vol: 0.2 },
                DEATH:        { type: 'slide', f1: 400, f2: 100, dur: 0.6, wave: 'sawtooth', vol: 0.25 }
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
