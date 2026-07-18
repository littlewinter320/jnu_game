// 实体基类
class Entity {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.vx = 0;
        this.vy = 0;
        this.active = true;
        this.visible = true;
    }

    // 获取碰撞盒
    getHitbox() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    // 获取边界（用于渲染裁剪）
    getBounds() {
        return this.getHitbox();
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    render(renderer) {
        // 子类重写
    }

    // 判断是否在屏幕内
    isOnScreen(margin = 0) {
        return this.x + this.w > -margin &&
               this.x < CONFIG.CANVAS_WIDTH + margin &&
               this.y + this.h > -margin &&
               this.y < CONFIG.CANVAS_HEIGHT + margin;
    }
}
