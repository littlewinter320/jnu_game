class AssetLoader {
    constructor(manifestPath = 'assets/assets_manifest.json') {
        this.manifestPath = manifestPath;
        this.manifest = null;
        this.images = {
            characters: {},
            backgrounds: {},
            props: {},
            obstacles: {},
            enemies: {},
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
        const loadFromManifest = (manifest) => {
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

            for (const cat of ['ui', 'backgrounds', 'props', 'puzzles', 'obstacles', 'enemies', 'tiles']) {
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
            }))).then(() => {
                const standaloneTasks = [];
                const standaloneAnims = manifest.standaloneAnims || {};
                for (const [key, meta] of Object.entries(standaloneAnims)) {
                    standaloneTasks.push(this._loadStandaloneAnim(key, meta));
                }
                return Promise.all(standaloneTasks);
            }).then(() => {
                this.loaded = true;
                return this;
            });
        };

        return fetch(this.manifestPath)
            .then(r => r.json())
            .then(manifest => loadFromManifest(manifest))
            .catch(() => {
                if (window.EMBEDDED_MANIFEST) {
                    return loadFromManifest(window.EMBEDDED_MANIFEST);
                }
                throw new Error('Cannot load manifest and no embedded manifest available');
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
                        frameDuration: 1 / fps,
                        pingPong: !!meta.pingPong
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
            const gender = key.startsWith('MALE') ? 'male' : 'female';
            const loadWithAnim = (animMeta) => {
                const img = new Image();
                img.onload = () => {
                    this.images.characters[key] = {
                        image: img, meta, naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight, isSpriteSheet: true,
                        animData: animMeta, placeholder: false
                    };
                    for (const [animName, ainfo] of Object.entries(animMeta)) {
                        if (!ainfo || !ainfo.frames || !Array.isArray(ainfo.frames)) continue;
                        this.charAnims[gender][animName] = {
                            image: img,
                            frameWidth: ainfo.frameWidth,
                            frameHeight: ainfo.frameHeight,
                            frames: ainfo.frames,
                            animSpeed: ainfo.animSpeed || 0.12,
                            loop: ainfo.loop !== false
                        };
                    }
                    resolve();
                };
                img.onerror = () => {
                    this.images.characters[key] = { image: null, placeholder: true };
                    resolve();
                };
                img.src = meta.file;
            };

            fetch(meta.metaFile).then(r => r.json())
                .then(animMeta => loadWithAnim(animMeta))
                .catch(() => {
                    if (window.EMBEDDED_ANIM_DATA && window.EMBEDDED_ANIM_DATA[gender]) {
                        loadWithAnim(window.EMBEDDED_ANIM_DATA[gender]);
                    } else {
                        this.images.characters[key] = { image: null, placeholder: true };
                        resolve();
                    }
                });
        });
    }

    _loadStandaloneAnim(key, meta) {
        return new Promise(resolve => {
            const gender = meta.gender;
            const animName = meta.animName;
            const img = new Image();
            img.onload = () => {
                const frameWidth = meta.frameWidth || Math.floor(img.naturalWidth / (meta.frameCount || 4));
                const frameHeight = meta.frameHeight || img.naturalHeight;
                const frameCount = meta.frameCount || 4;
                const frames = [];
                for (let i = 0; i < frameCount; i++) {
                    frames.push({
                        x: i * frameWidth,
                        y: 0,
                        w: frameWidth,
                        h: frameHeight
                    });
                }
                this.images.characters[key] = {
                    image: img, meta, naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight, placeholder: false
                };
                this.charAnims[gender][animName] = {
                    image: img,
                    frameWidth: frameWidth,
                    frameHeight: frameHeight,
                    frames: frames,
                    animSpeed: meta.animSpeed || 0.25,
                    loop: meta.loop !== false
                };
                resolve();
            };
            img.onerror = () => {
                resolve();
            };
            img.src = meta.file;
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
        const frames = anim.frames;
        const fi = frameIndex % frames.length;
        const frame = frames[fi];
        const fw = frame.w;
        const fh = frame.h;
        const tw = fw * scale;
        const th = fh * scale;
        const dx = Math.round(x);
        const dy = Math.round(y);

        ctx.save();
        if (flipX) {
            ctx.translate(dx + tw, dy);
            ctx.scale(-1, 1);
            ctx.drawImage(
                anim.image,
                frame.x, frame.y, fw, fh,
                0, 0, tw, th
            );
        } else {
            ctx.drawImage(
                anim.image,
                frame.x, frame.y, fw, fh,
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
            const n = ab.frames.length;
            let idx;
            if (ab.pingPong && n > 1) {
                const cycle = n * 2 - 2;
                const pos = Math.floor(time / ab.frameDuration) % cycle;
                idx = pos < n ? pos : cycle - pos;
            } else {
                idx = Math.floor(time / ab.frameDuration) % n;
            }
            const img = ab.frames[idx] || entry.image;
            if (img) {
                const iw = img.naturalWidth || w;
                const ih = img.naturalHeight || h;
                const scale = Math.max(w / iw, h / ih);
                const dw = iw * scale;
                const dh = ih * scale;
                const dx = (w - dw) / 2;
                const dy = (h - dh) / 2;
                ctx.drawImage(img, dx, dy, dw, dh);
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

    drawUIRaw(ctx, key, x, y) {
        const entry = this.images.ui?.[key];
        if (!entry || entry.placeholder || !entry.image) return;
        ctx.drawImage(entry.image, Math.round(x), Math.round(y));
    }

    getSprite(key) {
        for (const cat of ['ui', 'backgrounds', 'characters', 'props', 'obstacles', 'enemies', 'puzzles', 'tiles']) {
            const e = this.images[cat]?.[key];
            if (e && !e.placeholder && e.image) return e;
        }
        return null;
    }

    getAnimInfo(gender, animName) {
        return this.charAnims[gender]?.[animName] || null;
    }

    drawTile(ctx, key, tileIndex, x, y, tileSize = 64) {
        const entry = this.images.tiles?.[key];
        if (!entry || entry.placeholder || !entry.image) {
            ctx.fillStyle = '#555';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.strokeStyle = '#777';
            ctx.strokeRect(x, y, tileSize, tileSize);
            return;
        }
        const cols = Math.floor(entry.image.naturalWidth / tileSize);
        const col = tileIndex % cols;
        const row = Math.floor(tileIndex / cols);
        ctx.drawImage(
            entry.image,
            col * tileSize, row * tileSize, tileSize, tileSize,
            Math.round(x), Math.round(y), tileSize, tileSize
        );
    }

    drawTilePlatform(ctx, x, y, widthInPixels, type = 'platform') {
        const entry = this.images.tiles?.PLATFORM_TILES;
        if (!entry || entry.placeholder || !entry.image) {
            this._drawFallbackPlatform(ctx, x, y, widthInPixels, type);
            return;
        }
        const img = entry.image;

        const PLATFORM_DEF = {
            platform: {
                left:   { sx: 1224, sy: 72, sw: 132, sh: 50 },
                mid:    { sx: 1380, sy: 72, sw: 164, sh: 50 },
                right:  { sx: 1710, sy: 72, sw: 110, sh: 50 },
                single: { sx: 1890, sy: 72, sw: 100, sh: 50 }
            },
            ground: {
                left:   { sx: 20,  sy: 70, sw: 132, sh: 96 },
                mid:    { sx: 160, sy: 70, sw: 200, sh: 96 },
                right:  { sx: 920, sy: 70, sw: 128, sh: 96 }
            },
            semisolid: {
                left:   { sx: 1224, sy: 292, sw: 140, sh: 34 },
                mid:    { sx: 1400, sy: 292, sw: 180, sh: 34 },
                right:  { sx: 2040, sy: 292, sw: 160, sh: 34 }
            },
            thin: {
                left:   { sx: 1230, sy: 350, sw: 100, sh: 24 },
                mid:    { sx: 1380, sy: 350, sw: 150, sh: 24 },
                right:  { sx: 1850, sy: 350, sw: 100, sh: 24 },
                single: { sx: 2000, sy: 350, sw: 80, sh: 24 }
            },
            metal: {
                left:   { sx: 20, sy: 200, sw: 100, sh: 60 },
                mid:    { sx: 140, sy: 200, sw: 160, sh: 60 },
                right:  { sx: 800, sy: 200, sw: 100, sh: 60 }
            },
            tech: {
                left:   { sx: 20, sy: 290, sw: 120, sh: 70 },
                mid:    { sx: 160, sy: 290, sw: 180, sh: 70 },
                right:  { sx: 900, sy: 290, sw: 110, sh: 70 }
            }
        };

        const def = PLATFORM_DEF[type] || PLATFORM_DEF.platform;
        const h = def.left.sh;
        const midW = def.mid.sw;

        if (widthInPixels <= (def.single?.sw || 120) + 20 && def.single) {
            const s = def.single;
            const dw = widthInPixels;
            ctx.drawImage(img, s.sx, s.sy, s.sw, s.sh, Math.round(x), Math.round(y), Math.round(dw), h);
            return;
        }

        const leftW = def.left.sw;
        const rightW = def.right.sw;
        const leftEnd = x + leftW;
        const rightStart = x + widthInPixels - rightW;

        ctx.drawImage(img, def.left.sx, def.left.sy, def.left.sw, def.left.sh,
            Math.round(x), Math.round(y), leftW, h);

        const midStart = leftEnd;
        const midEnd = rightStart;
        const midTotalW = midEnd - midStart;
        if (midTotalW > 0) {
            let cx = midStart;
            while (cx < midEnd) {
                const cw = Math.min(midW, midEnd - cx);
                ctx.drawImage(img, def.mid.sx, def.mid.sy, def.mid.sw, def.mid.sh,
                    Math.round(cx), Math.round(y), Math.round(cw), h);
                cx += midW;
            }
        }

        ctx.drawImage(img, def.right.sx, def.right.sy, def.right.sw, def.right.sh,
            Math.round(rightStart), Math.round(y), rightW, h);
    }

    drawPlatformModule(ctx, x, y, moduleType, alpha = 1) {
        const entry = this.images.tiles?.PLATFORM_TILES;
        if (!entry || entry.placeholder || !entry.image) return;
        const img = entry.image;
        ctx.save();
        ctx.globalAlpha = alpha;

        const MODULES = {
            pillar: [
                { sx: 400, sy: 200, sw: 60, sh: 60 },
                { sx: 400, sy: 260, sw: 60, sh: 60 },
                { sx: 400, sy: 320, sw: 60, sh: 60 }
            ],
            console: [
                { sx: 500, sy: 70, sw: 120, sh: 80 }
            ],
            server: [
                { sx: 600, sy: 200, sw: 80, sh: 100 }
            ],
            pipe_h: [
                { sx: 300, sy: 180, sw: 100, sh: 30 }
            ],
            pipe_v: [
                { sx: 350, sy: 70, sw: 30, sh: 100 }
            ],
            light: [
                { sx: 700, sy: 70, sw: 40, sh: 40 }
            ],
            vent: [
                { sx: 750, sy: 120, sw: 80, sh: 30 }
            ],
            panel: [
                { sx: 550, sy: 290, sw: 100, sh: 70 }
            ],
            screen: [
                { sx: 20, sy: 400, sw: 200, sh: 120 }
            ],
            desk: [
                { sx: 250, sy: 400, sw: 150, sh: 80 }
            ],
            chair: [
                { sx: 420, sy: 420, sw: 60, sh: 70 }
            ],
            plant: [
                { sx: 500, sy: 400, sw: 70, sh: 100 }
            ],
            ac: [
                { sx: 600, sy: 380, sw: 100, sh: 40 }
            ],
            board: [
                { sx: 720, sy: 380, sw: 120, sh: 80 }
            ]
        };

        const parts = MODULES[moduleType];
        if (!parts) { ctx.restore(); return; }

        for (const part of parts) {
            ctx.drawImage(img, part.sx, part.sy, part.sw, part.sh,
                Math.round(x), Math.round(y), part.sw, part.sh);
        }
        ctx.restore();
    }

    drawBgDecoration(ctx, x, y, decoType, alpha = 0.3) {
        const entry = this.images.tiles?.PLATFORM_TILES;
        if (!entry || entry.placeholder || !entry.image) return;
        const img = entry.image;
        ctx.save();
        ctx.globalAlpha = alpha;

        const DECOS = {
            building_s: { sx: 20, sy: 550, sw: 200, sh: 300 },
            building_m: { sx: 240, sy: 500, sw: 250, sh: 350 },
            building_t: { sx: 520, sy: 480, sw: 220, sh: 380 },
            tower:      { sx: 760, sy: 450, sw: 180, sh: 400 },
            wall_tech:  { sx: 20, sy: 900, sw: 300, sh: 200 },
            grid:       { sx: 340, sy: 880, sw: 200, sh: 150 }
        };

        const d = DECOS[decoType];
        if (d) {
            ctx.drawImage(img, d.sx, d.sy, d.sw, d.sh, Math.round(x), Math.round(y), d.sw, d.sh);
        }
        ctx.restore();
    }

    drawPlatformBuilding(ctx, x, y, w, h, style = 'tech') {
        this._drawFallbackPlatform(ctx, x, y, w, 'building', h);
    }

    _drawFallbackPlatform(ctx, x, y, w, type, customH) {
        const h = customH || (type === 'ground' ? 48 : 24);
        const bodyY = y + (type === 'ground' ? 0 : 0);

        const grad = ctx.createLinearGradient(x, y, x, y + h);
        if (type === 'ground') {
            grad.addColorStop(0, '#5a7a9a');
            grad.addColorStop(0.15, '#3d5a78');
            grad.addColorStop(0.3, '#2a4060');
            grad.addColorStop(1, '#1a2a42');
        } else {
            grad.addColorStop(0, '#4a6a8a');
            grad.addColorStop(0.3, '#355070');
            grad.addColorStop(1, '#253a55');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x, bodyY, w, h);

        ctx.fillStyle = '#7ab8ff';
        ctx.fillRect(x, y, w, 3);
        ctx.fillStyle = 'rgba(122,184,255,0.3)';
        ctx.fillRect(x, y + 3, w, 2);

        ctx.strokeStyle = '#1a2d45';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, bodyY + 0.5, w - 1, h - 1);

        ctx.fillStyle = 'rgba(0,200,255,0.6)';
        for (let bx = x + 10; bx < x + w - 10; bx += 30) {
            const glowSize = 3 + Math.sin(Date.now() / 400 + bx) * 1;
            ctx.beginPath();
            ctx.arc(bx, y + h - 6, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }

        if (type === 'building') {
            ctx.fillStyle = 'rgba(100,180,255,0.15)';
            for (let wy = y + h; wy < y + (customH || 200); wy += 32) {
                for (let wx = x + 8; wx < x + w - 8; wx += 24) {
                    if ((wx + wy) % 48 < 24) {
                        ctx.fillRect(wx, wy, 12, 16);
                    }
                }
            }
        }
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
