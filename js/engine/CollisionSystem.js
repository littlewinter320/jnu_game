// AABB 碰撞检测系统
class CollisionSystem {
    // 两个矩形碰撞检测
    // 每个 box 格式: { x, y, w, h }
    static aabb(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    }

    // 点是否在矩形内
    static pointInRect(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.w &&
               py >= rect.y && py <= rect.y + rect.h;
    }

    // 获取两个矩形的重叠区域
    static getOverlap(a, b) {
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (overlapX <= 0 || overlapY <= 0) return null;
        return {
            x: Math.max(a.x, b.x),
            y: Math.max(a.y, b.y),
            w: overlapX,
            h: overlapY
        };
    }
}
