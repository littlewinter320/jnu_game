class AssetLoader {
    constructor(manifestPath = 'assets/assets_manifest.json') {
        this.manifestPath = manifestPath;
        this.manifest = null;
        this.images = {
            characters: {},
            backgrounds: {},
            props: {},
            obstacles: {},
            ui: {},
            puzzles: {},
            tiles: {}
        };
        this.charAnims = { male: {}, female: {} };
        this.animBgs = {};
        this.loaded = false;
        this.performanceTier = 'high';
        this._detectPerformance();
    }

    _detectPerformance() {
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        const cores = navigator.hardwareConcurrency || 4;
        const mem = navigator.deviceMemory || 4;
        if (isMobile && (cores <= 4 || mem <= 2)) {
            this.performanceTier = 'low';
        } else if (isMobile || cores <= 4) {
            this.performanceTier = 'mid';
        }
    }

    getParticleRatio() {
        if (!this.manifest) return 1;
        const p = this.manifest.performance || {};
        if (this.performanceTier === 'low') return p.low_end_particle_ratio || 0.25;
        if (this.performanceTier === 'mid') return p.mobile_particle_ratio || 0.5;
        return 1;
    }

    loadAll(onProgress = null) {
        return fetch(this.manifestPath)
            .then(r => r.json())
            .then(manifest => {
                this.manifest = manifest;
                const tasks = [];

                const loadImage = (category, key, meta) => {
                    return new Promise(resolve => {
                        const img = new Image();
                        img.onload = () => {
                            const entry = {
                                image: img, meta,
                                naturalWidth: img.naturalWidth,
                                naturalHeight: img.naturalHeight,
                                targetWidth: meta.targetWidth || img.naturalWidth,
                                targetHeight: meta.targetHeight || img.naturalHeight,
                                placeholder: false
                            };
                            this.images[category][key] = entry;
                            resolve();
                        };
                        img.onerror = () => {
                            this.images[category][key] = {
                                image: null, meta, placeholder: true,
                                targetWidth: meta.targetWidth || 64,
                                targetHeight: meta.targetHeight || 64
                            };
                            resolve();
                        };
                        img.src = meta.file;
                    });
                };

                for (const cat of ['ui', 'backgrounds', 'props', 'puzzles', 'obstacles', 'tiles']) {
                    const items = manifest[cat];
                    if (!items) continue;
                    for (const [key, meta] of Object.entries(items)) {
                        if (meta.pattern) continue;
                        if (meta.isAnimated) {
                            tasks.push(this._loadAnimatedBg(key, meta));
                        } else {
                            tasks.push(loadImage(cat, key, meta));
                        }
                    }
                }

                const chars = manifest.characters || {};
                for (const [key, meta] of Object.entries(chars)) {
                    if (meta.isSpriteSheet) {
                        tasks.push(this._loadCharacterSheet(key, meta));
                    } else {
                        tasks.push(loadImage('characters', key, meta));
                    }
                }

                let done = 0;
                const total = tasks.length;
                return Promise.all(tasks.map(t => t.then(() => {
                    done++;
                    if (onProgress) onProgress(done / total);
                })));
            })
            .then(() => {
                this.loaded = true;
                return this;
            });
    }

    _loadAnimatedBg(key, meta) {
        return new Promise(resolve => {
            const frames = meta.frames || [meta.file];
            const fps = meta.fps || 8;
            const frameImgs = [];
            let loaded = 0;
            const onOne = () => {
                loaded++;
                if (loaded >= frames.length) {
                    const firstImg = frameImgs[0];
                    this.images.backgrounds[key] = {
                        image: firstImg,
                        meta,
                        naturalWidth: firstImg?.naturalWidth || 1920,
                        naturalHeight: firstImg?.naturalHeight || 1080,
                        targetWidth: meta.targetWidth || 1920,
                        targetHeight: meta.targetHeight || 1080,
                        placeholder: false,
                        isAnimated: true
                    };
                    this.animBgs[key] = {
                        frames: frameImgs,
                        fps,
                        frameDuration: 1 / fps
                    };
                    resolve();
                }
            };
            frames.forEach((src, i) => {
                const img = new Image();
                img.onload = () => { frameImgs[i] = img; onOne(); };
                img.onerror = () => { frameImgs[i] = null; onOne(); };
                img.src = src;
            });
        });
    }

    _loadCharacterSheet(key, meta) {
        return new Promise(resolve => {
            fetch(meta.metaFile).then(r => r.json()).then(animMeta => {
                const img = new Image();
                img.onload = () => {
                    const gender = key.startsWith('MALE') ? 'male' : 'female';
                    this.images.characters[key] = {
                        image: img, meta, naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight, isSpriteSheet: true,
                        animData: animMeta, placeholder: false
                    };
                    for (const [animName, ainfo] of Object.entries(animMeta.animations || {})) {
                        this.charAnims[gender][animName.replace(gender + '_', '')] = {
                            image: img,
                            y: ainfo.y,
                            frameWidth: ainfo.frameWidth,
                            frameHeight: ainfo.frameHeight,
                            frames: ainfo.frames
                        };
                    }
                    resolve();
                };
                img.onerror = () => {
                    this.images.characters[key] = { image: null, placeholder: true };
                    resolve();
                };
                img.src = meta.file;
            }).catch(() => {
                this.images.characters[key] = { image: null, placeholder: true };
                resolve();
            });
        });
    }

    drawSprite(ctx, category, key, x, y, frameIndex = 0, scale = 1) {
        const entry = this.images[category]?.[key];
        if (!entry || entry.placeholder) {
            this._drawPlaceholder(ctx, x, y, 64, 64, key);
            return;
        }
        const tw = (entry.targetWidth || entry.naturalWidth) * scale;
        const th = (entry.targetHeight || entry.naturalHeight) * scale;
        const fw = entry.frameWidth || entry.naturalWidth;
        const fh = entry.frameHeight || entry.naturalHeight;
        const cols = Math.floor(entry.naturalWidth / fw);
        const col = frameIndex % cols;
        const row = Math.floor(frameIndex / cols);
        ctx.drawImage(
            entry.image,
            col * fw, row * fh, fw, fh,
            Math.round(x), Math.round(y), Math.round(tw), Math.round(th)
        );
    }

    drawCharacter(ctx, gender, animName, x, y, frameIndex = 0, scale = 1, flipX = false) {
        const anim = this.charAnims[gender]?.[animName];
        if (!anim || !anim.image) {
            this._drawPlaceholder(ctx, x, y, 64, 80, `${gender}_${animName}`);
            return;
        }
        const fi = frameIndex % anim.frames;
        const tw = anim.frameWidth * scale;
        const th = anim.frameHeight * scale;
        const dx = Math.round(x);
        const dy = Math.round(y);

        ctx.save();
        if (flipX) {
            ctx.translate(dx + tw, dy);
            ctx.scale(-1, 1);
            ctx.drawImage(
                anim.image,
                fi * anim.frameWidth, anim.y, anim.frameWidth, anim.frameHeight,
                0, 0, tw, th
            );
        } else {
            ctx.drawImage(
                anim.image,
                fi * anim.frameWidth, anim.y, anim.frameWidth, anim.frameHeight,
                dx, dy, tw, th
            );
        }
        ctx.restore();
    }

    drawBackground(ctx, key, time = 0) {
        const entry = this.images.backgrounds?.[key];
        if (!entry || entry.placeholder) {
            const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
            gradient.addColorStop(0, '#0a1628');
            gradient.addColorStop(0.5, '#1a3a5c');
            gradient.addColorStop(1, '#0d2137');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            return;
        }
        const w = CONFIG.CANVAS_WIDTH;
        const h = CONFIG.CANVAS_HEIGHT;
        if (entry.isAnimated && this.animBgs[key]) {
            const ab = this.animBgs[key];
            const idx = Math.floor(time / ab.frameDuration) % ab.frames.length;
            const img = ab.frames[idx] || entry.image;
            if (img) {
                ctx.drawImage(img, 0, 0, w, h);
                return;
            }
        }
        ctx.drawImage(entry.image, 0, 0, w, h);
    }

    drawUI(ctx, key, x, y, w = null, h = null) {
        const entry = this.images.ui?.[key];
        const tw = w || entry?.targetWidth || 64;
        const th = h || entry?.targetHeight || 64;
        if (!entry || entry.placeholder || !entry.image) {
            this._drawPlaceholder(ctx, x, y, tw, th, key);
            return;
        }
        ctx.drawImage(entry.image, Math.round(x), Math.round(y), Math.round(tw), Math.round(th));
    }

    getSprite(key) {
        for (const cat of ['ui', 'backgrounds', 'characters', 'props', 'obstacles', 'puzzles', 'tiles']) {
            const e = this.images[cat]?.[key];
            if (e && !e.placeholder && e.image) return e;
        }
        return null;
    }

    getAnimInfo(gender, animName) {
        return this.charAnims[gender]?.[animName] || null;
    }

    _drawPlaceholder(ctx, x, y, w, h, label) {
        ctx.save();
        ctx.strokeStyle = '#f44';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.fillStyle = 'rgba(244, 68, 68, 0.12)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
        ctx.fillStyle = '#f88';
        ctx.font = `${Math.max(10, Math.min(14, h/4))}px "Courier New"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((label || 'MISS').substring(0, 10), x + w/2, y + h/2);
        ctx.restore();
    }
}
