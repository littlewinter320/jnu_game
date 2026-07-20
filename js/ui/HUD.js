class HUD {
    constructor() {
        this.propSlots = [];
        this.maxProps = 6;
        this.assets = window.Game?.assets;
        this._time = 0;
    }

    addProp(type) {
        if (this.propSlots.length < this.maxProps) {
            this.propSlots.push(type);
        }
    }

    clearProps() {
        this.propSlots = [];
    }

    render(ctx, stamina, staminaMax, mode = 'tencent', shieldTime = 0) {
        this._time += 0.016;
        if (stamina !== null && stamina !== undefined && staminaMax > 0) {
            this._renderStaminaBar(ctx, stamina, staminaMax);
        }
        if (shieldTime > 0) {
            this._renderShieldIcon(ctx, shieldTime);
        }
        if (mode === 'tencent') {
            this._renderPropSlots(ctx);
        } else if (mode === 'xpeng') {
            this._renderBatteryCounter(ctx);
        }
    }

    _renderStaminaBar(ctx, stamina, staminaMax) {
        const assets = this.assets || window.Game?.assets;
        const x = 25, y = 22;
        const ratio = Math.max(0, Math.min(1, stamina / staminaMax));

        const bg = assets?.getSprite?.('UI_STAMINA_BAR_BG');
        if (bg && bg.image) {
            const bw = bg.targetWidth || 270;
            const bh = bg.targetHeight || 40;
            ctx.drawImage(bg.image, x, y, bw, bh);

            let fillKey;
            if (ratio >= 0.6) fillKey = 'UI_STAMINA_BAR_GREEN';
            else if (ratio >= 0.3) fillKey = 'UI_STAMINA_BAR_YELLOW';
            else if (ratio >= 0.1) fillKey = 'UI_STAMINA_BAR_ORANGE';
            else fillKey = 'UI_STAMINA_BAR_RED';

            const fill = assets?.getSprite?.(fillKey);
            if (fill && fill.image) {
                const fw = fill.targetWidth || 261;
                const fh = fill.targetHeight || bh;
                const fillW = fw * ratio;
                if (fillW > 2) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(x + 5, y + 5, fillW, fh - 10);
                    ctx.clip();
                    ctx.drawImage(fill.image, x + 5, y + 5, fw, fh - 10);
                    ctx.restore();
                }
            }

            ctx.fillStyle = ratio < 0.2 ? '#fff' : 'rgba(255,255,255,0.9)';
            ctx.font = 'bold 18px "Courier New"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 4;
            ctx.fillText(`${Math.floor(stamina)}/${staminaMax}`, x + bw/2, y + bh/2 + 2);
            ctx.shadowBlur = 0;
        } else {
            const w = 270, h = 34;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
            let color;
            if (ratio >= 0.6) color = '#4f4';
            else if (ratio >= 0.3) color = '#ff4';
            else if (ratio >= 0.1) color = '#f84';
            else color = '#f44';
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w * ratio, h);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Courier New"';
            ctx.textAlign = 'left';
            ctx.fillText(`体力: ${Math.floor(stamina)}/${staminaMax}`, x + w + 10, y + h/2);
        }
    }

    _renderPropSlots(ctx) {
        const assets = this.assets || window.Game?.assets;
        const startX = 25;
        const startY = 78;
        const slotSize = 64;
        const gap = 8;

        const propKeyMap = {
            'wechat': 'PROP_WECHAT',
            'qq': 'PROP_QQ',
            'games': 'PROP_GAMES',
            'cloud': 'PROP_CLOUD',
            'content': 'PROP_CONTENT',
            'tech': 'PROP_TECH'
        };

        for (let i = 0; i < this.maxProps; i++) {
            const x = startX + i * (slotSize + gap);
            const y = startY;

            const emptySlot = assets?.getSprite?.('UI_PROP_SLOT_EMPTY');
            if (emptySlot && emptySlot.image) {
                ctx.drawImage(emptySlot.image, x, y, slotSize, slotSize);
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.fillRect(x, y, slotSize, slotSize);
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, slotSize, slotSize);
            }

            if (i < this.propSlots.length) {
                const type = this.propSlots[i];
                const propKey = propKeyMap[type];
                const prop = assets?.getSprite?.(propKey);
                if (prop && prop.image) {
                    const floatY = Math.sin(this._time * 3 + i) * 3;
                    ctx.save();
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 12;
                    ctx.drawImage(prop.image, x + 4, y + 4 + floatY, slotSize - 8, slotSize - 8);
                    ctx.restore();
                } else {
                    this._renderFallbackProp(ctx, type, x + slotSize/2, y + slotSize/2);
                }
            }
        }
    }

    _renderShieldIcon(ctx, shieldTime) {
        const x = 320, y = 22;
        const size = 42;
        const pulse = 0.8 + Math.sin(this._time * 5) * 0.2;
        ctx.save();
        ctx.shadowColor = 'rgba(0,200,255,' + pulse + ')';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(0,30,60,0.8)';
        ctx.strokeStyle = 'rgba(100,220,255,' + (0.6 + pulse * 0.3) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#66ddff';
        ctx.beginPath();
        const cx = x + size/2, cy = y + size/2;
        ctx.moveTo(cx, cy - 12);
        ctx.lineTo(cx + 10, cy - 6);
        ctx.lineTo(cx + 10, cy + 4);
        ctx.lineTo(cx, cy + 12);
        ctx.lineTo(cx - 10, cy + 4);
        ctx.lineTo(cx - 10, cy - 6);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px "Courier New"';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const timeText = shieldTime === Infinity ? '∞' : shieldTime.toFixed(1) + 's';
        ctx.fillText(timeText, x + size + 8, cy);
        ctx.restore();
    }

    _renderBatteryCounter(ctx) {
        const assets = this.assets || window.Game?.assets;
        const x = 25, y = 78;
        const bat = assets?.getSprite?.('STAMINA_BATTERY');
        ctx.save();
        if (bat && bat.image) {
            ctx.drawImage(bat.image, x, y, 42, 52);
        } else {
            ctx.fillStyle = '#4facfe';
            ctx.fillRect(x, y + 10, 36, 40);
            ctx.fillRect(x + 10, y, 16, 12);
        }
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px "Courier New"';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText('×' + (window.Game?.sceneMgr?.currentScene?.collectedBatteries || 0), x + 50, y + 28);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    _renderFallbackProp(ctx, type, cx, cy) {
        ctx.save();
        ctx.shadowBlur = 8;
        switch (type) {
            case 'wechat':
                ctx.shadowColor = '#07c160'; ctx.fillStyle = '#07c160';
                ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('微', cx, cy); break;
            case 'qq':
                ctx.shadowColor = '#00a4ff'; ctx.fillStyle = '#00a4ff';
                ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('Q', cx, cy); break;
            case 'games':
                ctx.shadowColor = '#ffa500'; ctx.fillStyle = '#ffa500';
                ctx.fillRect(cx - 14, cy - 14, 28, 28);
                ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('游', cx, cy); break;
            case 'cloud':
                ctx.shadowColor = '#87ceeb'; ctx.fillStyle = '#87ceeb';
                ctx.beginPath();
                ctx.arc(cx - 7, cy, 11, 0, Math.PI*2);
                ctx.arc(cx + 7, cy, 11, 0, Math.PI*2);
                ctx.arc(cx, cy - 5, 11, 0, Math.PI*2);
                ctx.fill(); break;
            case 'content':
                ctx.shadowColor = '#ff4757'; ctx.fillStyle = '#ff4757';
                ctx.beginPath();
                ctx.moveTo(cx - 9, cy - 11); ctx.lineTo(cx - 9, cy + 11);
                ctx.lineTo(cx + 11, cy); ctx.closePath(); ctx.fill(); break;
            case 'tech':
                ctx.shadowColor = '#ffd700'; ctx.fillStyle = '#ffd700';
                ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#333'; ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('⚙', cx, cy); break;
        }
        ctx.restore();
    }
}
