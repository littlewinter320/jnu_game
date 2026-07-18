// 可收集道具
class Collectible extends Entity {
    constructor(x, y, type = 'prop') {
        super(x, y, 64, 64);
        this.type = type;  // 'wechat', 'qq', 'games', 'cloud', 'content', 'tech', 'battery'
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;  // 浮动动画偏移
        this.bobSpeed = 2;
        this.bobAmount = 8;
    }

    update(dt) {
        if (this.collected) return;
        super.update(dt);

        // 浮动效果
        this.bobOffset += this.bobSpeed * dt;
    }

    // 获取实际渲染位置（带浮动）
    getRenderY() {
        return this.y + Math.sin(this.bobOffset) * this.bobAmount;
    }

    collect() {
        if (this.collected) return false;
        this.collected = true;
        this.active = false;
        return true;
    }

    render(renderer) {
        if (this.collected || !this.visible) return;

        const ctx = renderer.ctx;
        const renderY = this.getRenderY();

        // 尝试使用贴图
        const imgKey = this.type === 'battery' ? 'STAMINA_BATTERY' : `PROP_${this.type.toUpperCase()}`;
        const image = renderer.images?.[imgKey];

        if (image) {
            renderer.drawImage(image, this.x, renderY, this.w, this.h);
        } else {
            // 占位图形
            this._renderPlaceholder(ctx, renderY);
        }
    }

    _renderPlaceholder(ctx, renderY) {
        const cx = this.x + this.w / 2;
        const cy = renderY + this.h / 2;

        // 发光效果
        ctx.save();
        ctx.shadowBlur = 15;

        switch (this.type) {
            case 'wechat':
                ctx.shadowColor = '#07c160';
                ctx.fillStyle = '#07c160';
                ctx.beginPath();
                ctx.arc(cx, cy, 24, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('微', cx, cy);
                break;
            case 'qq':
                ctx.shadowColor = '#00a4ff';
                ctx.fillStyle = '#00a4ff';
                ctx.beginPath();
                ctx.arc(cx, cy, 24, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Q', cx, cy);
                break;
            case 'games':
                ctx.shadowColor = '#ffa500';
                ctx.fillStyle = '#ffa500';
                ctx.fillRect(this.x + 12, renderY + 12, 40, 40);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('游', cx, cy);
                break;
            case 'cloud':
                ctx.shadowColor = '#87ceeb';
                ctx.fillStyle = '#87ceeb';
                ctx.beginPath();
                ctx.arc(cx - 10, cy, 16, 0, Math.PI * 2);
                ctx.arc(cx + 10, cy, 16, 0, Math.PI * 2);
                ctx.arc(cx, cy - 8, 16, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'content':
                ctx.shadowColor = '#ff4757';
                ctx.fillStyle = '#ff4757';
                ctx.beginPath();
                ctx.moveTo(cx - 12, cy - 16);
                ctx.lineTo(cx - 12, cy + 16);
                ctx.lineTo(cx + 16, cy);
                ctx.closePath();
                ctx.fill();
                break;
            case 'tech':
                ctx.shadowColor = '#ffd700';
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#333';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚙', cx, cy);
                break;
            case 'battery':
                ctx.shadowColor = '#4af';
                ctx.fillStyle = '#4af';
                ctx.fillRect(this.x + 16, renderY + 8, 32, 48);
                ctx.fillRect(this.x + 24, renderY, 16, 8);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚡', cx, cy);
                break;
        }
        ctx.restore();
    }
}
