window.EMBEDDED_MANIFEST = {
  "_comment": "素材清单 - Alpha版所有素材声明",
  "_version": "5.1",
  "characters": {
    "MALE_SPRITES":   { "file": "assets/images/characters/male_spritesheet.png",   "metaFile": "assets/images/characters/male_anims.json",   "isSpriteSheet": true },
    "FEMALE_SPRITES": { "file": "assets/images/characters/female_spritesheet.png", "metaFile": "assets/images/characters/female_anims.json", "isSpriteSheet": true }
  },
  "standaloneAnims": {
    "FEMALE_RUN_RIGHT": {
      "file": "assets/images/characters/female_run_right.png",
      "gender": "female",
      "animName": "run_right",
      "frameWidth": 98,
      "frameHeight": 82,
      "frameCount": 4,
      "animSpeed": 0.25,
      "loop": true
    }
  },
  "backgrounds": {
    "BG_MAIN_MENU": {
      "file": "assets/images/backgrounds/bg_frame_01.png",
      "isAnimated": true,
      "pingPong": true,
      "frames": [
        "assets/images/backgrounds/bg_frame_01.png",
        "assets/images/backgrounds/bg_frame_02.png",
        "assets/images/backgrounds/bg_frame_03.png",
        "assets/images/backgrounds/bg_frame_04.png",
        "assets/images/backgrounds/bg_frame_05.png",
        "assets/images/backgrounds/bg_frame_06.png",
        "assets/images/backgrounds/bg_frame_07.png",
        "assets/images/backgrounds/bg_frame_08.png"
      ],
      "fps": 1.5,
      "targetWidth": 1920,
      "targetHeight": 1080
    },
    "BG_TENCENT_LOBBY":   { "file": "assets/images/backgrounds/bg_tencent_lobby.png",   "targetWidth": 1920, "targetHeight": 1080 },
    "BG_TENCENT_WECHAT":  { "file": "assets/images/backgrounds/bg_tencent_wechat.png",  "targetWidth": 1920, "targetHeight": 1080 },
    "BG_TENCENT_QQ":      { "file": "assets/images/backgrounds/bg_tencent_qq.png",      "targetWidth": 1920, "targetHeight": 1080 },
    "BG_TENCENT_GAMES":   { "file": "assets/images/backgrounds/bg_tencent_games.png",   "targetWidth": 1920, "targetHeight": 1080 },
    "BG_TENCENT_CLOUD":   { "file": "assets/images/backgrounds/bg_tencent_cloud.png",   "targetWidth": 1920, "targetHeight": 1080 },
    "BG_TENCENT_CONTENT": { "file": "assets/images/backgrounds/bg_tencent_content.png", "targetWidth": 1920, "targetHeight": 1080 },
    "BG_TENCENT_TECH":    { "file": "assets/images/backgrounds/bg_tencent_tech.png",    "targetWidth": 1920, "targetHeight": 1080 },
    "BG_TENCENT_REPAIR":  { "file": "assets/images/backgrounds/bg_tencent_repair.png",  "targetWidth": 1920, "targetHeight": 1080 },
    "BG_XPENG_STAGE1":    { "file": "assets/images/backgrounds/bg_xpeng_stage1.png",    "targetWidth": 1920, "targetHeight": 1080 },
    "BG_XPENG_STAGE2":    { "file": "assets/images/backgrounds/bg_xpeng_stage2.png",    "targetWidth": 1920, "targetHeight": 1080 },
    "BG_XPENG_ENDING":    { "file": "assets/images/backgrounds/bg_xpeng_ending.png",    "targetWidth": 1920, "targetHeight": 1080 },
    "BG_CHAR_SELECT":     { "file": "assets/images/backgrounds/bg_char_select.png",     "targetWidth": 1920, "targetHeight": 1080 },
    "BG_LEVEL_SELECT":    { "file": "assets/images/backgrounds/bg_level_select.png",    "targetWidth": 1920, "targetHeight": 1080 }
  },
  "tiles": {
    "PLATFORM_TILES": { "file": "assets/images/tiles/platform_tiles.png", "isTileSheet": true, "tileSize": 64, "columns": 4 }
  },
  "enemies": {
    "ENEMY_BOT": { "file": "assets/images/enemies/enemy_bot.png", "targetWidth": 70, "targetHeight": 70 }
  },
  "ui": {
    "LOGO":           { "file": "assets/images/ui/logo.png",           "targetWidth": 560, "targetHeight": 200 },
    "BTN_START":      { "file": "assets/images/ui/btn_start.png",      "targetWidth": 320, "targetHeight": 86 },
    "BTN_END":        { "file": "assets/images/ui/btn_end.png",        "targetWidth": 320, "targetHeight": 85 },
    "BTN_HELP":       { "file": "assets/images/ui/btn_help.png",       "targetWidth": 320, "targetHeight": 86 },
    "BTN_CREDITS":    { "file": "assets/images/ui/btn_credits.png",    "targetWidth": 320, "targetHeight": 86 },
    "BTN_SETTINGS":   { "file": "assets/images/ui/btn_settings.png",   "targetWidth": 160, "targetHeight": 47 },
    "BTN_RESTART":    { "file": "assets/images/ui/btn_restart.png",    "targetWidth": 200, "targetHeight": 90 },
    "BTN_MENU":       { "file": "assets/images/ui/btn_menu.png",       "targetWidth": 200, "targetHeight": 90 },
    "BTN_CONTINUE":   { "file": "assets/images/ui/btn_continue.png",   "targetWidth": 200, "targetHeight": 90 },
    "UI_GENDER_MALE":   { "file": "assets/images/ui/ui_gender_male.png",   "targetWidth": 120, "targetHeight": 212 },
    "UI_GENDER_FEMALE": { "file": "assets/images/ui/ui_gender_female.png", "targetWidth": 138, "targetHeight": 212 },
    "UI_STAMINA_BAR_BG":      { "file": "assets/images/ui/ui_stamina_bar_bg.png",      "targetWidth": 270, "targetHeight": 93 },
    "UI_STAMINA_BAR_GREEN":   { "file": "assets/images/ui/ui_stamina_bar_fill_green.png",   "targetWidth": 261, "targetHeight": 93 },
    "UI_STAMINA_BAR_YELLOW":  { "file": "assets/images/ui/ui_stamina_bar_fill_yellow.png",  "targetWidth": 259, "targetHeight": 92 },
    "UI_STAMINA_BAR_ORANGE":  { "file": "assets/images/ui/ui_stamina_bar_fill_orange.png",  "targetWidth": 254, "targetHeight": 93 },
    "UI_STAMINA_BAR_RED":     { "file": "assets/images/ui/ui_stamina_bar_fill_red.png",     "targetWidth": 254, "targetHeight": 93 },
    "UI_PROP_SLOT_EMPTY":  { "file": "assets/images/ui/ui_prop_slot_empty.png",  "targetWidth": 80, "targetHeight": 84 },
    "UI_PROP_SLOT_FILLED": { "file": "assets/images/ui/ui_prop_slot_filled.png", "targetWidth": 80, "targetHeight": 83 },
    "UI_CARD_TENCENT": { "file": "assets/images/ui/ui_card_tencent.png", "targetWidth": 248, "targetHeight": 337 },
    "UI_CARD_XPENG":   { "file": "assets/images/ui/ui_card_xpeng.png",   "targetWidth": 257, "targetHeight": 399 },
    "UI_CARD_BACK":    { "file": "assets/images/ui/ui_card_back.png",    "targetWidth": 254, "targetHeight": 399 },
    "UI_PENGUIN_BROKEN": { "file": "assets/images/ui/ui_penguin_broken.png", "targetWidth": 247, "targetHeight": 372 },
    "UI_PENGUIN_FIXED":  { "file": "assets/images/ui/ui_penguin_fixed.png",  "targetWidth": 313, "targetHeight": 399 },
    "UI_XPENG_CAR":      { "file": "assets/images/ui/ui_xpeng_car.png",      "targetWidth": 322, "targetHeight": 170 },
    "UI_DIALOG_BOX":  { "file": "assets/images/ui/ui_dialog_box.png",  "targetWidth": 600, "targetHeight": 370 },
    "LOCK_ICON":      { "file": "assets/images/ui/lock_icon.png",      "targetWidth": 80,  "targetHeight": 111 },
    "CHAR_SELECT_MALE_PIXEL":   { "file": "assets/images/ui/char_select_male_pixel.png",   "targetWidth": 180, "targetHeight": 266 },
    "CHAR_SELECT_FEMALE_PIXEL": { "file": "assets/images/ui/char_select_female_pixel.png", "targetWidth": 182, "targetHeight": 266 },
    "CHAR_PORTRAIT_MALE":   { "file": "assets/images/ui/char_portrait_male.png",   "targetWidth": 160, "targetHeight": 200 },
    "CHAR_PORTRAIT_FEMALE": { "file": "assets/images/ui/char_portrait_female.png", "targetWidth": 160, "targetHeight": 200 }
  },
  "props": {
    "PROP_WECHAT":  { "file": "assets/images/props/prop_wechat.png",  "targetWidth": 64, "targetHeight": 64 },
    "PROP_QQ":      { "file": "assets/images/props/prop_qq.png",      "targetWidth": 64, "targetHeight": 64 },
    "PROP_GAMES":   { "file": "assets/images/props/prop_games.png",   "targetWidth": 64, "targetHeight": 64 },
    "PROP_CLOUD":   { "file": "assets/images/props/prop_cloud.png",   "targetWidth": 64, "targetHeight": 64 },
    "PROP_CONTENT": { "file": "assets/images/props/prop_content.png", "targetWidth": 64, "targetHeight": 64 },
    "PROP_TECH":    { "file": "assets/images/props/prop_tech.png",    "targetWidth": 64, "targetHeight": 64 },
    "STAMINA_BATTERY": { "file": "assets/images/props/stamina_battery.png", "targetWidth": 56, "targetHeight": 70 },
    "PROP_COIN": { "file": "assets/images/props/prop_coin.png", "targetWidth": 48, "targetHeight": 48 },
    "PROP_STAR": { "file": "assets/images/props/prop_star.png", "targetWidth": 48, "targetHeight": 48 }
  },
  "obstacles": {
    "OBS_CONES":           { "file": "assets/images/obstacles/obs_cones.png",           "targetWidth": 55,  "targetHeight": 65 },
    "OBS_WARNING_LIGHT":   { "file": "assets/images/obstacles/obs_warning_light.png",   "targetWidth": 50,  "targetHeight": 75 },
    "OBS_BARRIER_FULL":    { "file": "assets/images/obstacles/obs_barrier_full.png",    "targetWidth": 75,  "targetHeight": 95 },
    "OBS_GATE_FULL":       { "file": "assets/images/obstacles/obs_gate_full.png",       "targetWidth": 80,  "targetHeight": 100 },
    "OBS_HIGH_WALL":       { "file": "assets/images/obstacles/obs_high_wall.png",       "targetWidth": 80,  "targetHeight": 170 },
    "OBS_WALL_FULL":       { "file": "assets/images/obstacles/obs_wall_full.png",       "targetWidth": 70,  "targetHeight": 140 },
    "OBS_MACHINERY":       { "file": "assets/images/obstacles/obs_machinery.png",       "targetWidth": 110, "targetHeight": 120 },
    "OBS_MOVING_PLATFORM": { "file": "assets/images/obstacles/obs_moving_platform.png", "targetWidth": 120, "targetHeight": 35 },
    "OBS_SPIKE_FULL":      { "file": "assets/images/obstacles/obs_spike_full.png",      "targetWidth": 80,  "targetHeight": 45 },
    "OBS_ALARM":           { "file": "assets/images/obstacles/obs_alarm.png",           "targetWidth": 60,  "targetHeight": 70 },
    "OBS_BATTERY_PACK":    { "file": "assets/images/obstacles/obs_battery_pack.png",    "targetWidth": 70,  "targetHeight": 90 },
    "OBS_CHARGER":         { "file": "assets/images/obstacles/obs_charger.png",         "targetWidth": 90,  "targetHeight": 150 },
    "OBS_ENERGY_CORE":     { "file": "assets/images/obstacles/obs_energy_core.png",     "targetWidth": 80,  "targetHeight": 100 },
    "OBS_LASER_BEAM":      { "file": "assets/images/obstacles/obs_laser_beam.png",      "targetWidth": 120, "targetHeight": 30 },
    "OBS_LASER_EMITTER_H": { "file": "assets/images/obstacles/obs_laser_emitter_h.png", "targetWidth": 100, "targetHeight": 40 },
    "OBS_LASER_EMITTER_V": { "file": "assets/images/obstacles/obs_laser_emitter_v.png", "targetWidth": 40,  "targetHeight": 100 },
    "OBS_LASER_GATE":      { "file": "assets/images/obstacles/obs_laser_gate.png",      "targetWidth": 120, "targetHeight": 160 },
    "OBS_LASER_GUN":       { "file": "assets/images/obstacles/obs_laser_gun.png",       "targetWidth": 80,  "targetHeight": 70 },
    "OBS_LOW_BARRIER":     { "file": "assets/images/obstacles/obs_low_barrier.png",     "targetWidth": 110, "targetHeight": 50 },
    "OBS_SPIKE_TRAP":      { "file": "assets/images/obstacles/obs_spike_trap.png",      "targetWidth": 90,  "targetHeight": 40 },
    "OBS_LOW_GATE":        { "file": "assets/images/obstacles/obs_low_gate.png",        "targetWidth": 120, "targetHeight": 65 },
    "OBS_LOW_FOLDERS":     { "file": "assets/images/obstacles/obs_low_folders.png",     "targetWidth": 100, "targetHeight": 60 },
    "OBS_LOW_BALLOONS":    { "file": "assets/images/obstacles/obs_low_balloons.png",    "targetWidth": 160, "targetHeight": 41 },
    "OBS_LOW_SERVERS":     { "file": "assets/images/obstacles/obs_low_servers.png",     "targetWidth": 130, "targetHeight": 48 },
    "OBS_LOW_BLOCKS":      { "file": "assets/images/obstacles/obs_low_blocks.png",      "targetWidth": 120, "targetHeight": 42 },
    "OBS_HIGH_GLASS":      { "file": "assets/images/obstacles/obs_high_glass.png",      "targetWidth": 100, "targetHeight": 146 },
    "OBS_HIGH_ICE":        { "file": "assets/images/obstacles/obs_high_ice.png",        "targetWidth": 105, "targetHeight": 156 },
    "OBS_HIGH_ARCADE":     { "file": "assets/images/obstacles/obs_high_arcade.png",     "targetWidth": 100, "targetHeight": 164 },
    "OBS_HIGH_NEWS":       { "file": "assets/images/obstacles/obs_high_news.png",       "targetWidth": 100, "targetHeight": 166 },
    "OBS_HIGH_PIPES":      { "file": "assets/images/obstacles/obs_high_pipes.png",      "targetWidth": 105, "targetHeight": 165 },
    "OBS_LASER_SPHERE":    { "file": "assets/images/obstacles/obs_laser_sphere.png",    "targetWidth": 100, "targetHeight": 128 },
    "OBS_LASER_CROSS4":    { "file": "assets/images/obstacles/obs_laser_cross4.png",    "targetWidth": 130, "targetHeight": 148 },
    "OBS_LASER_CROSSX":    { "file": "assets/images/obstacles/obs_laser_crossX.png",    "targetWidth": 115, "targetHeight": 120 },
    "OBS_CABLE_1":         { "file": "assets/images/obstacles/obs_cable_1.png",         "targetWidth": 60,  "targetHeight": 160 },
    "OBS_CABLE_2":         { "file": "assets/images/obstacles/obs_cable_2.png",         "targetWidth": 60,  "targetHeight": 160 },
    "OBS_CABLE_PLUG":      { "file": "assets/images/obstacles/obs_cable_plug.png",      "targetWidth": 80,  "targetHeight": 166 },
    "OBS_CABLE_RED":       { "file": "assets/images/obstacles/obs_cable_red.png",       "targetWidth": 70,  "targetHeight": 165 },
    "OBS_CHARGER_NORMAL":  { "file": "assets/images/obstacles/obs_charger_normal.png",  "targetWidth": 90,  "targetHeight": 156 },
    "OBS_CHARGER_DAMAGED": { "file": "assets/images/obstacles/obs_charger_damaged.png", "targetWidth": 100, "targetHeight": 158 },
    "OBS_CHARGER_BURNING": { "file": "assets/images/obstacles/obs_charger_burning.png", "targetWidth": 120, "targetHeight": 160 }
  },
  "performance": {
    "mobile_particle_ratio": 0.5,
    "low_end_particle_ratio": 0.25,
    "fps_threshold_high": 55,
    "fps_threshold_low": 25
  }
};

window.EMBEDDED_ANIM_DATA = {
  male: {
  "idle": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 4,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 4,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 4,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 4,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "run_left": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 83,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 83,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 83,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 83,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "run_right": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 162,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 162,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 162,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 162,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "jump_start": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 241,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 241,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 241,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 241,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "airborne": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 320,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 320,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 320,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 320,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "landing": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 399,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 399,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 399,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 399,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "crouch": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 478,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 478,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 478,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 478,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "crouch_walk": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 557,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 557,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 557,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 557,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "hurt": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 636,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 636,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 636,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 636,
        "w": 92,
        "h": 79
      },
      {
        "x": 372,
        "y": 636,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "knockback": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 715,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 715,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 715,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 715,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "death": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 794,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 794,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 794,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 794,
        "w": 92,
        "h": 79
      },
      {
        "x": 372,
        "y": 794,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "pickup": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 873,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 873,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 873,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 873,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "operate": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 952,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 952,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 952,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 952,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "victory": {
    "frameWidth": 92,
    "frameHeight": 79,
    "frames": [
      {
        "x": 4,
        "y": 1031,
        "w": 92,
        "h": 79
      },
      {
        "x": 96,
        "y": 1031,
        "w": 92,
        "h": 79
      },
      {
        "x": 188,
        "y": 1031,
        "w": 92,
        "h": 79
      },
      {
        "x": 280,
        "y": 1031,
        "w": 92,
        "h": 79
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  }
},
  female: {
  "idle": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 4,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 4,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 4,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 4,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.15,
    "loop": true
  },
  "run_left": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 84,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 84,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 84,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 84,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.25,
    "loop": true
  },
  "run_right": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 164,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 164,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 164,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 164,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.25,
    "loop": true
  },
  "jump_start": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 244,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 244,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 244,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 244,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "airborne": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 324,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 324,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 324,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 324,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "landing": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 404,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 404,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 404,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 404,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "crouch": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 484,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 484,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 484,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 484,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "crouch_walk": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 564,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 564,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 564,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 564,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "hurt": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 644,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 644,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 644,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 644,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "knockback": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 724,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 724,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 724,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 724,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "death": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 804,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 804,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 804,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 804,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "pickup": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 884,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 884,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 884,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  },
  "operate": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 964,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 964,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 964,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 964,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": true
  },
  "victory": {
    "frameWidth": 112,
    "frameHeight": 80,
    "frames": [
      {
        "x": 4,
        "y": 1044,
        "w": 112,
        "h": 80
      },
      {
        "x": 116,
        "y": 1044,
        "w": 112,
        "h": 80
      },
      {
        "x": 228,
        "y": 1044,
        "w": 112,
        "h": 80
      },
      {
        "x": 340,
        "y": 1044,
        "w": 112,
        "h": 80
      }
    ],
    "animSpeed": 0.12,
    "loop": false
  }
}
};
