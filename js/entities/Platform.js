// 平台/地面
class Platform extends Entity {
    constructor(x, y, w, h, type = 'ground') {
        super(x, y, w, h);
        this.type = type;  // 'ground', 'moving', 'breakable', 'dialog', 'gear'
        this.moving = false;
        this.moveSpeed = 0;
        this.moveRange = 0;
        this.moveOffset = 0;
        this.startX = x;
        this.startY = y;
        this.movePattern = 'horizontal';  // 'horizontal', 'vertical'

        // 可破坏平台
        this.breakable = false;
        this.breakTimer = 0;
        this.broken = false;
    }

    update(dt) {
        if (this.broken) return;

        super.update(dt);

        // 移动平台
        if (this.moving) {
            this.moveOffset += this.moveSpeed * dt;
            if (this.movePattern === 'horizontal') {
                this.x = this.startX + Math.sin(this.moveOffset) * this.moveRange;
            } else if (this.movePattern === 'vertical') {
                this.y = this.startY + Math.sin(this.moveOffset) * this.moveRange;
            }
        }

        // 可破坏平台倒计时
        if (this.breakable && this.breakTimer > 0) {
            this.breakTimer -= dt;
            if (this.breakTimer <= 0) {
                this.broken = true;
                this.active = false;
            }
        }
    }

    // 开始破坏（玩家站在上面时调用）
    startBreaking(delay = 1.0) {
        if (this.breakable && this.breakTimer <= 0) {
            this.breakTimer = delay;
        }
    }

    render(renderer) {
        if (this.broken || !this.visible) return;

        const ctx = renderer.ctx;

        // 根据类型绘制
        switch (this.type) {
            case 'ground':
                this._renderGround(renderer);
                break;
            case 'dialog':
                this._renderDialog(renderer);
                break;
            case 'gear':
                this._renderGear(renderer);
                break;
            case 'timeline':
                this._renderTimeline(renderer);
                break;
            default:
                this._renderDefault(renderer);
        }
    }

    _renderGround(renderer) {
        const ctx = renderer.ctx;
        // 像素风地面
        ctx.fillStyle = '#555';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // 顶部高光
        ctx.fillStyle = '#777';
        ctx.fillRect(this.x, this.y, this.w, 4);
        // 像素纹理
        ctx.fillStyle = '#444';
        for (let i = 0; i < this.w; i += 16) {
            for (let j = 8; j < this.h; j += 16) {
                ctx.fillRect(this.x + i, this.y + j, 8, 8);
            }
        }
    }

    _renderDialog(renderer) {
        const ctx = renderer.ctx;
        // 微信风格对话气泡平台
        ctx.fillStyle = '#95ec69';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // 圆角效果
        ctx.beginPath();
        ctx.arc(this.x + 16, this.y + 16, 16, 0, Math.PI * 2);
        ctx.arc(this.x + this.w - 16, this.y + 16, 16, 0, Math.PI * 2);
        ctx.fill();
        // 三个点
        ctx.fillStyle = '#333';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2 - 20 + i * 20, this.y + this.h / 2, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _renderGear(renderer) {
        const ctx = renderer.ctx;
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const radius = Math.min(this.w, this.h) / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Date.now() / 1000);  // 持续旋转

        // 齿轮
        ctx.fillStyle = '#888';
        ctx.beginPath();
        const teeth = 8;
        for (let i = 0; i < teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2;
            const outerR = radius;
            const innerR = radius * 0.7;
            ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
            const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2;
            ctx.lineTo(Math.cos(nextAngle) * innerR, Math.sin(nextAngle) * innerR);
        }
        ctx.closePath();
        ctx.fill();

        // 中心孔
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _renderTimeline(renderer) {
        const ctx = renderer.ctx;
        // 胶片风格平台
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // 胶片孔
        ctx.fillStyle = '#000';
        for (let i = 0; i < this.w; i += 24) {
            ctx.fillRect(this.x + i + 4, this.y + 4, 8, 8);
            ctx.fillRect(this.x + i + 4, this.y + this.h - 12, 8, 8);
        }
    }

    _renderDefault(renderer) {
        renderer.drawRect(this.x, this.y, this.w, this.h, '#666');
    }
}
