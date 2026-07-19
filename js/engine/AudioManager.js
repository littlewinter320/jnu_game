class AudioManager {
    constructor() {
        this.bgmAudio = null;
        this.bgmName = '';
        this.sfxVolume = 0.4;
        this.bgmVolume = 0.5;
        this.muted = false;
        this.lowStaminaMode = false;
        this._ctx = null;
        this._masterGain = null;
        this._initialized = false;
    }

    _ensureContext() {
        if (this._initialized) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this._ctx = new AC();
            this._masterGain = this._ctx.createGain();
            this._masterGain.gain.value = this.muted ? 0 : 1;
            this._masterGain.connect(this._ctx.destination);
            this._initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available:', e);
        }
    }

    _resume() {
        if (this._ctx && this._ctx.state === 'suspended') {
            this._ctx.resume().catch(() => {});
        }
    }

    _beep(freq, dur, type = 'square', vol = 0.3) {
        this._ensureContext();
        this._resume();
        if (!this._ctx) return;
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * this.sfxVolume, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    _slide(f1, f2, dur, type = 'square', vol = 0.3) {
        this._ensureContext();
        this._resume();
        if (!this._ctx) return;
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f1, t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(f2, 30), t + dur);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * this.sfxVolume, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    _thump(freq, dur, vol = 0.3) {
        this._ensureContext();
        this._resume();
        if (!this._ctx) return;
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();
        const filter = this._ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 2, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + dur);
        gain.gain.setValueAtTime(vol * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    _arp(freqs, stepDur, type = 'square', vol = 0.3) {
        freqs.forEach((f, i) => {
            setTimeout(() => this._beep(f, stepDur * 0.9, type, vol), i * stepDur * 1000);
        });
    }

    _noise(dur, vol = 0.2) {
        this._ensureContext();
        this._resume();
        if (!this._ctx) return;
        const t = this._ctx.currentTime;
        const bufferSize = this._ctx.sampleRate * dur;
        const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const src = this._ctx.createBufferSource();
        src.buffer = buffer;
        const gain = this._ctx.createGain();
        gain.gain.value = vol * this.sfxVolume;
        const filter = this._ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this._masterGain);
        src.start(t);
    }

    _alarm(freqs, dur, type = 'square', vol = 0.2) {
        const step = dur / (freqs.length * 3);
        for (let r = 0; r < 3; r++) {
            freqs.forEach((f, i) => {
                setTimeout(() => this._beep(f, step * 0.8, type, vol), (r * freqs.length + i) * step * 1000);
            });
        }
    }

    playSFX(name) {
        if (this.muted) return;
        this._ensureContext();
        this._resume();
        const cfg = CONFIG.ASSETS.SOUNDS.SFX[name?.toUpperCase?.()] || CONFIG.ASSETS.SOUNDS.SFX[name];
        if (!cfg) return;
        try {
            switch (cfg.type) {
                case 'beep':  this._beep(cfg.freq, cfg.dur, cfg.wave, cfg.vol); break;
                case 'slide': this._slide(cfg.f1, cfg.f2, cfg.dur, cfg.wave, cfg.vol); break;
                case 'thump': this._thump(cfg.freq, cfg.dur, cfg.vol); break;
                case 'arp':   this._arp(cfg.freqs, cfg.dur / cfg.freqs.length, cfg.wave, cfg.vol); break;
                case 'noise': this._noise(cfg.dur, cfg.vol); break;
                case 'alarm': this._alarm(cfg.freqs, cfg.dur, cfg.wave, cfg.vol); break;
            }
        } catch (e) { /* ignore */ }
    }

    playBGM(name, loop = true) {
        if (this.bgmName === name && this.bgmAudio && !this.bgmAudio.paused) return;
        this.stopBGM();
        const src = CONFIG.ASSETS.SOUNDS.BGM[name?.toUpperCase?.()] || CONFIG.ASSETS.SOUNDS.BGM[name];
        if (!src) return;
        this.bgmAudio = new Audio(src);
        this.bgmAudio.loop = loop;
        this.bgmAudio.volume = this.muted ? 0 : this.bgmVolume;
        this.bgmName = name;
        this._resume();
        this.bgmAudio.play().catch(() => {});
    }

    stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
            this.bgmAudio = null;
            this.bgmName = '';
        }
    }

    setLowStaminaMode(active) { this.lowStaminaMode = active; }

    toggleMute() {
        this.muted = !this.muted;
        if (this.bgmAudio) this.bgmAudio.volume = this.muted ? 0 : this.bgmVolume;
        if (this._masterGain) this._masterGain.gain.value = this.muted ? 0 : 1;
    }

    setBGMVolume(vol) {
        this.bgmVolume = vol;
        if (this.bgmAudio && !this.muted) this.bgmAudio.volume = vol;
    }

    setSFXVolume(vol) { this.sfxVolume = vol; }
}
