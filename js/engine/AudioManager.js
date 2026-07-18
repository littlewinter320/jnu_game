// 音频管理 - BGM + SFX
class AudioManager {
    constructor() {
        this.bgmAudio = null;
        this.bgmName = '';
        this.sfxPool = {};       // 音效缓存
        this.sfxVolume = 1.0;
        this.bgmVolume = 0.7;
        this.muted = false;
        this.lowStaminaMode = false;
    }

    // 预加载音频
    async loadAudio(name, src) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
            audio.addEventListener('error', () => resolve(null), { once: true });
            audio.src = src;
            audio.preload = 'auto';
            this.sfxPool[name] = audio;
        });
    }

    // 播放 BGM
    playBGM(name, loop = true) {
        if (this.bgmName === name && this.bgmAudio && !this.bgmAudio.paused) return;

        // 停止当前 BGM
        this.stopBGM();

        const src = CONFIG.ASSETS.SOUNDS.BGM[name.toUpperCase()] ||
                    CONFIG.ASSETS.SOUNDS.BGM[name];
        if (!src) return;

        this.bgmAudio = new Audio(src);
        this.bgmAudio.loop = loop;
        this.bgmAudio.volume = this.muted ? 0 : this.bgmVolume;
        this.bgmName = name;
        this.bgmAudio.play().catch(() => { /* 用户未交互时可能失败 */ });
    }

    stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
            this.bgmAudio = null;
            this.bgmName = '';
        }
    }

    // 播放音效
    playSFX(name) {
        if (this.muted) return;
        const src = CONFIG.ASSETS.SOUNDS.SFX[name.toUpperCase()] ||
                    CONFIG.ASSETS.SOUNDS.SFX[name];
        if (!src) return;

        // 每次创建新 Audio 实例以支持重叠播放
        const audio = new Audio(src);
        audio.volume = this.sfxVolume;
        audio.play().catch(() => {});
    }

    // 切换体力低模式（叠加心跳BGM）
    setLowStaminaMode(active) {
        if (this.lowStaminaMode === active) return;
        this.lowStaminaMode = active;
        if (active) {
            this.playBGM('XPENG_STAGE1_LOW', true);
        } else {
            this.playBGM('XPENG_STAGE1', true);
        }
    }

    // 静音切换
    toggleMute() {
        this.muted = !this.muted;
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.muted ? 0 : this.bgmVolume;
        }
    }

    setBGMVolume(vol) {
        this.bgmVolume = vol;
        if (this.bgmAudio && !this.muted) {
            this.bgmAudio.volume = vol;
        }
    }

    setSFXVolume(vol) {
        this.sfxVolume = vol;
    }
}
