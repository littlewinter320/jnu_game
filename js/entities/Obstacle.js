// 障碍物
class Obstacle extends Entity {
    constructor(x, y, w, h, type = 'generic') {
        super(x, y, w, h);
        this.type = type;
        this.damage = 10;
        this.warningTimer = 0;  // 预警时间（镭射类）
        this.active = true;

        // 特殊障碍属性
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.warningPhase = false;  // 是否处于预警阶段
        this.laserActive = false;   // 镭射是否激活

        // 移动平台
        this.movePattern = null;    // 'horizontal', 'vertical', 'circle'
        this.moveSpeed = 0;
        this.moveRange = 0;
        this.moveOffset = 0;
        this.startX = x;
        this.startY = y;
    }

    update(dt) {
        super.update(dt);

        // 预警倒计时
        if (this.warningTimer > 0) {
            this.warningTimer -= dt;
            if (this.warningTimer <= 0) {
                this.warningPhase = false;
                this.laserActive = true;
            } else {
                this.warningPhase = true;
            }
        }

        // 旋转（旋转镭射柱）
        if (this.type === 'laser_rotating') {
            this.rotation += this.rotationSpeed * dt;
        }

        // 移动模式
        if (this.movePattern) {
            this.moveOffset += this.moveSpeed * dt;
            switch (this.movePattern) {
                case 'horizontal':
                    this.x = this.startX + Math.sin(this.moveOffset) * this.moveRange;
                    break;
                case 'vertical':
                    this.y = this.startY + Math.sin(this.moveOffset) * this.moveRange;
                    break;
                case 'circle':
                    this.x = this.startX + Math.cos(this.moveOffset) * this.moveRange;
                    this.y = this.startY + Math.sin(this.moveOffset) * this.moveRange;
                    break;
            }
        }
    }

    // 获取实际碰撞盒（预警阶段不造成伤害）
    getHitbox() {
        if (this.warningPhase) return null;  // 预警阶段无碰撞
        return super.getHitbox();
    }

    render(renderer) {
        if (!this.visible) return;

        const ctx = renderer.ctx;

        // 根据类型绘制不同外观
        switch (this.type) {
            case 'laser_ground':
            case 'laser_air':
            case 'laser_cross':
            case 'laser_tracking':
                this._renderLaser(renderer);
                break;
            case 'laser_rotating':
                this._renderRotatingLaser(renderer);
                break;
            case 'data_wall':
                this._renderDataWall(renderer);
                break;
            case 'gap':
                this._renderGap(renderer);
                break;
            case 'robot':
                this._renderRobot(renderer);
                break;
            default:
                this._renderGeneric(renderer);
        }
    }

    _renderLaser(renderer) {
        const ctx = renderer.ctx;

        if (this.warningPhase) {
            // 预警阶段：显示红色虚线
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.setLineDash([]);
        } else if (this.laserActive) {
            // 激活阶段：发光镭射
            ctx.save();
            ctx.shadowColor = '#f00';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#f44';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.restore();
        }
    }

    _renderRotatingLaser(renderer) {
        const ctx = renderer.ctx;
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.rotation);

        // 中心球
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(0, 0, this.w / 4, 0, Math.PI * 2);
        ctx.fill();

        // 四条镭射
        ctx.strokeStyle = '#f44';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 15;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.w, Math.sin(angle) * this.h);
            ctx.stroke();
        }

        ctx.restore();
    }

    _renderDataWall(renderer) {
        const ctx = renderer.ctx;
        // 紫色数据墙
        ctx.fillStyle = 'rgba(128, 0, 128, 0.7)';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // 随机数据流效果
        ctx.fillStyle = '#f0f';
        ctx.font = '10px monospace';
        for (let i = 0; i < 5; i++) {
            const char = String.fromCharCode(0x30A0 + Math.random() * 96);
            const tx = this.x + Math.random() * this.w;
            const ty = this.y + Math.random() * this.h;
            ctx.fillText(char, tx, ty);
        }
    }

    _renderGap(renderer) {
        const ctx = renderer.ctx;
        // 地面缺口
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // 边缘破损效果
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }

    _renderRobot(renderer) {
        const ctx = renderer.ctx;
        // 机器人身体
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // 红色眼睛
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x + this.w * 0.3, this.y + this.h * 0.2, 8, 8);
        ctx.fillRect(this.x + this.w * 0.6, this.y + this.h * 0.2, 8, 8);
    }

    _renderGeneric(renderer) {
        // 通用障碍：红色矩形
        renderer.drawRect(this.x, this.y, this.w, this.h, '#f44');
    }
}
