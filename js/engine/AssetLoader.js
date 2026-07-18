// ====================================================================
// AssetLoader — 贴图加载器（含图片尺寸自适应与占位图回退）
// ====================================================================
// 负责加载 assets_manifest.json 中声明的所有贴图，并在渲染时按目标尺寸缩放。
// 图片尺寸不符 → 自动 drawImage 缩放，无需修改图片
// 图片缺失     → 自动绘制彩色占位矩形，不会崩溃
// 性能适配     → 移动端自动降帧减少粒子/阴影
// ====================================================================

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
            puzzles: {}
        };
        this.loaded = false;
        this.performanceTier = 'high'; // high / mid / low
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
                const addSingle = (category, key, meta) => {
                    if (!meta.file) return;
                    tasks.push(this._loadOne(category, key, meta));
                };
                const addPattern = (category, key, meta) => {
                    if (!meta.pattern) { addSingle(category, key, meta); return; }
                    const count = meta.variants || 1;
                    const variants = [];
                    for (let i = 1; i <= count; i++) {
                        const num = String(i).padStart(2, '0');
                        const file = meta.pattern.replace('{0}', num);
                        const vmeta = { ...meta, file };
                        if (meta.sizes && meta.sizes[i-1]) {
                            vmeta.targetWidth = meta.sizes[i-1].w;
                            vmeta.targetHeight = meta.sizes[i-1].h;
                        }
                        delete vmeta.pattern;
                        variants.push(vmeta);
                        tasks.push(this._loadOne(category, `${key}_${num}`, vmeta, true));
                    }
                    this.images[category][key] = { _isVariantGroup: true, variants: [] };
                };

                // 加载所有分类
                for (const [cat, items] of Object.entries(this.manifest)) {
                    if (cat.startsWith('_') || cat === 'performance') continue;
                    for (const [key, meta] of Object.entries(items)) {
                        if (meta.pattern) {
                            addPattern(cat, key, meta);
                        } else {
                            addSingle(cat, key, meta);
                        }
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

    _loadOne(category, key, meta, isVariant = false) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                const entry = {
                    image: img,
                    meta,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    frameWidth: meta.frameWidth || img.naturalWidth,
                    frameHeight: meta.frameHeight || img.naturalHeight,
                    frameCount: meta.frameCount || 1,
                    targetWidth: meta.targetWidth,
                    targetHeight: meta.targetHeight,
                    placeholder: false
                };
                // 自动推导每帧尺寸（如果没声明）
                if (!meta.frameWidth && meta.frameCount && meta.frameCount > 1) {
                    entry.frameWidth = img.naturalWidth / meta.frameCount;
                    entry.frameHeight = img.naturalHeight;
                }
                // 如果 targetWidth/Height 为 null/undefined，使用自然尺寸
                if (!entry.targetWidth && entry.targetWidth !== 0) entry.targetWidth = entry.frameWidth;
                if (!entry.targetHeight && entry.targetHeight !== 0) entry.targetHeight = entry.frameHeight;

                if (isVariant) {
                    // 找到 base key（去掉 _01 后缀）
                    const baseKey = key.replace(/_\d+$/, '');
                    if (!this.images[category][baseKey]) this.images[category][baseKey] = { _isVariantGroup: true, variants: [] };
                    this.images[category][baseKey].variants.push(entry);
                } else {
                    this.images[category][key] = entry;
                }
                resolve();
            };
            img.onerror = () => {
                // 加载失败，生成占位图
                const entry = {
                    image: null,
                    meta,
                    naturalWidth: meta.targetWidth || 64,
                    naturalHeight: meta.targetHeight || 64,
                    frameWidth: meta.frameWidth || meta.targetWidth || 64,
                    frameHeight: meta.frameHeight || meta.targetHeight || 64,
                    frameCount: meta.frameCount || 1,
                    targetWidth: meta.targetWidth || 64,
                    targetHeight: meta.targetHeight || 64,
                    placeholder: true,
                    label: key
                };
                if (isVariant) {
                    const baseKey = key.replace(/_\d+$/, '');
                    if (!this.images[category][baseKey]) this.images[category][baseKey] = { _isVariantGroup: true, variants: [] };
                    // 占位变体不加入（避免重复），但至少保留一个
                    if (this.images[category][baseKey].variants.length === 0) {
                        this.images[category][baseKey].variants.push(entry);
                    }
                } else {
                    this.images[category][key] = entry;
                }
                resolve();
            };
            img.src = meta.file;
        });
    }

    // -------------------- 绘制 API --------------------

    drawSprite(ctx, category, key, x, y, frameIndex = 0, scale = 1) {
        const entry = this._resolveEntry(category, key);
        if (!entry) { this._drawPlaceholder(ctx, x, y, 64, 64, key); return; }
        const tw = (entry.targetWidth || entry.frameWidth) * scale;
        const th = (entry.targetHeight || entry.frameHeight) * scale;
        if (entry.placeholder) { this._drawPlaceholder(ctx, x, y, tw, th, entry.label || key); return; }

        const cols = Math.floor(entry.naturalWidth / entry.frameWidth);
        const col = frameIndex % cols;
        const row = Math.floor(frameIndex / cols);
        ctx.drawImage(
            entry.image,
            col * entry.frameWidth, row * entry.frameHeight,
            entry.frameWidth, entry.frameHeight,
            Math.round(x), Math.round(y), Math.round(tw), Math.round(th)
        );
    }

    drawBackground(ctx, key, scrollX = 0, scrollY = 0) {
        const entry = this._resolveEntry('backgrounds', key);
        if (!entry) { this._drawPlaceholder(ctx, 0, 0, 1920, 1080, key); return; }
        if (entry.placeholder) {
            this._drawPlaceholder(ctx, 0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, entry.label || key);
            return;
        }
        const w = CONFIG.CANVAS_WIDTH;
        const h = CONFIG.CANVAS_HEIGHT;
        if (entry.meta.scrollable) {
            const sx = -scrollX;
            ctx.drawImage(entry.image, sx, scrollY, w, h);
            ctx.drawImage(entry.image, sx + w, scrollY, w, h);
        } else {
            ctx.drawImage(entry.image, 0, 0, w, h);
        }
    }

    drawObstacle(ctx, key, x, y, variantIndex = -1) {
        const group = this.images.obstacles[key];
        if (!group || !group.variants || group.variants.length === 0) {
            this._drawPlaceholder(ctx, x, y, 64, 64, key);
            return;
        }
        const v = variantIndex >= 0 && variantIndex < group.variants.length
            ? group.variants[variantIndex]
            : group.variants[Math.floor(Math.random() * group.variants.length)];
        const tw = v.targetWidth || v.frameWidth;
        const th = v.targetHeight || v.frameHeight;
        if (v.placeholder || !v.image) {
            this._drawPlaceholder(ctx, x, y, tw, th, v.label || key);
            return;
        }
        ctx.drawImage(v.image, Math.round(x), Math.round(y), Math.round(tw), Math.round(th));
    }

    drawProp(ctx, key, x, y, scale = 1) {
        const entry = this._resolveEntry('props', key);
        const tw = (entry?.targetWidth || 64) * scale;
        const th = (entry?.targetHeight || 64) * scale;
        if (!entry || entry.placeholder || !entry.image) {
            this._drawPlaceholder(ctx, x, y, tw, th, key);
            return;
        }
        ctx.drawImage(entry.image, Math.round(x), Math.round(y), Math.round(tw), Math.round(th));
    }

    drawUI(ctx, key, x, y, w = null, h = null) {
        const entry = this._resolveEntry('ui', key);
        const tw = w || entry?.targetWidth || 64;
        const th = h || entry?.targetHeight || 64;
        if (!entry || entry.placeholder || !entry.image) {
            this._drawPlaceholder(ctx, x, y, tw, th, key);
            return;
        }
        ctx.drawImage(entry.image, Math.round(x), Math.round(y), Math.round(tw), Math.round(th));
    }

    getSprite(key) {
        // 兼容旧代码：从 ui 分类查找，并返回 image 引用
        for (const cat of ['ui', 'backgrounds', 'characters', 'props', 'obstacles', 'puzzles']) {
            const e = this._resolveEntry(cat, key);
            if (e && !e.placeholder) return e;
        }
        return null;
    }

    _resolveEntry(category, key) {
        const lowerKey = String(key).toLowerCase();
        let e = this.images[category]?.[lowerKey] || this.images[category]?.[key];
        if (e && e._isVariantGroup) {
            return e.variants[Math.floor(Math.random() * e.variants.length)];
        }
        return e;
    }

    _drawPlaceholder(ctx, x, y, w, h, label) {
        ctx.save();
        ctx.strokeStyle = '#f44';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.fillStyle = 'rgba(244, 68, 68, 0.15)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
        ctx.fillStyle = '#f88';
        ctx.font = `${Math.max(10, Math.min(14, h/4))}px "Courier New"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((label || 'MISSING').substring(0, 10), x + w/2, y + h/2);
        ctx.restore();
    }
}
