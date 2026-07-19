class CollisionSystem {
    static aabb(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    }

    static pointInRect(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.w &&
               py >= rect.y && py <= rect.y + rect.h;
    }

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

    static platformCollision(player, platform) {
        const px = player.x, py = player.y;
        const pw = player.w, ph = player.h;
        const plx = platform.x, ply = platform.y;
        const plw = platform.w, plh = platform.h;

        if (px + pw <= plx || px >= plx + plw) return false;
        if (py + ph <= ply || py >= ply + plh) return false;

        const prevBottom = py + ph - player.vy * 0.016;
        if (player.vy >= 0 && prevBottom <= ply + 10) {
            return true;
        }

        if (platform.isGround && player.vy < 0 && py - player.vy * 0.016 >= ply + plh - 10) {
            player.y = ply + plh;
            player.vy = 0;
            return false;
        }

        return false;
    }
}
