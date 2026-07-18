// 游戏中HUD（体力条+道具栏）
class HUD {
    constructor() {
        this.propSlots = [];  // 已收集的道具
        this.maxProps = 6;
        this.staminaBarWidth = 300;
        this.staminaBarHeight = 24;
    }

    // 添加道具
    addProp(type) {
        if (this.propSlots.length < this.maxProps) {
            this.propSlots.push(type);
        }
    }

    // 清空道具
    clearProps() {
        this.propSlots = [];
    }

    render(ctx, stamina, staminaMax) {
        // 体力条（左上角）
        this._renderStaminaBar(ctx, stamina, staminaMax);

        // 道具栏（体力条下方）
        this._renderPropSlots(ctx);
    }

    _renderStaminaBar(ctx, stamina, staminaMax) {
        const x = 30;
        const y = 30;
        const w = this.staminaBarWidth;
        const h = this.staminaBarHeight;
        const ratio = stamina / staminaMax;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

        // 根据体力百分比选择颜色
        let color;
        if (ratio >= 0.6) color = '#4f4';
        else if (ratio >= 0.3) color = '#ff4';
        else if (ratio >= 0.1) color = '#f84';
        else color = '#f44';

        // 填充条
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w * ratio, h);

        // 边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // 文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px "Courier New"';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`体力: ${Math.floor(stamina)}/${staminaMax}`, x + w + 10, y + h / 2);
    }

    _renderPropSlots(ctx) {
        const startX = 30;
        const startY = 80;
        const slotSize = 64;
        const gap = 10;

        for (let i = 0; i < this.maxProps; i++) {
            const x = startX + i * (slotSize + gap);
            const y = startY;

            // 槽位背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(x, y, slotSize, slotSize);

            // 边框
            ctx.strokeStyle = i < this.propSlots.length ? '#4af' : '#555';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, slotSize, slotSize);

            // 已收集的道具
            if (i < this.propSlots.length) {
                const type = this.propSlots[i];
                this._renderPropIcon(ctx, type, x + slotSize / 2, y + slotSize / 2);
            }
        }
    }

    _renderPropIcon(ctx, type, cx, cy) {
        ctx.save();
        ctx.shadowBlur = 10;

        switch (type) {
            case 'wechat':
                ctx.shadowColor = '#07c160';
                ctx.fillStyle = '#07c160';
                ctx.beginPath();
                ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('微', cx, cy);
                break;
            case 'qq':
                ctx.shadowColor = '#00a4ff';
                ctx.fillStyle = '#00a4ff';
                ctx.beginPath();
                ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Q', cx, cy);
                break;
            case 'games':
                ctx.shadowColor = '#ffa500';
                ctx.fillStyle = '#ffa500';
                ctx.fillRect(cx - 16, cy - 16, 32, 32);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('游', cx, cy);
                break;
            case 'cloud':
                ctx.shadowColor = '#87ceeb';
                ctx.fillStyle = '#87ceeb';
                ctx.beginPath();
                ctx.arc(cx - 8, cy, 12, 0, Math.PI * 2);
                ctx.arc(cx + 8, cy, 12, 0, Math.PI * 2);
                ctx.arc(cx, cy - 6, 12, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'content':
                ctx.shadowColor = '#ff4757';
                ctx.fillStyle = '#ff4757';
                ctx.beginPath();
                ctx.moveTo(cx - 10, cy - 12);
                ctx.lineTo(cx - 10, cy + 12);
                ctx.lineTo(cx + 12, cy);
                ctx.closePath();
                ctx.fill();
                break;
            case 'tech':
                ctx.shadowColor = '#ffd700';
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(cx, cy, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#333';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚙', cx, cy);
                break;
        }
        ctx.restore();
    }
}
