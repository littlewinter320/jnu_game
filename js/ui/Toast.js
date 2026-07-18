// 提示弹窗
class Toast {
    constructor() {
        this.messages = [];
        this.displayDuration = 2.0;  // 每条消息显示时长
    }

    // 显示消息
    show(text, type = 'info') {
        this.messages.push({
            text,
            type,  // 'info', 'success', 'warning', 'error'
            timer: this.displayDuration,
            alpha: 1
        });

        // 限制同时显示的消息数量
        if (this.messages.length > 3) {
            this.messages.shift();
        }
    }

    update(dt) {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const msg = this.messages[i];
            msg.timer -= dt;

            // 最后0.5秒淡出
            if (msg.timer < 0.5) {
                msg.alpha = msg.timer / 0.5;
            }

            if (msg.timer <= 0) {
                this.messages.splice(i, 1);
            }
        }
    }

    render(ctx) {
        const startX = CONFIG.CANVAS_WIDTH / 2;
        const startY = 150;
        const msgHeight = 50;
        const gap = 10;

        for (let i = 0; i < this.messages.length; i++) {
            const msg = this.messages[i];
            const y = startY + i * (msgHeight + gap);

            ctx.save();
            ctx.globalAlpha = msg.alpha;

            // 背景
            let bgColor;
            switch (msg.type) {
                case 'success': bgColor = 'rgba(76, 175, 80, 0.9)'; break;
                case 'warning': bgColor = 'rgba(255, 152, 0, 0.9)'; break;
                case 'error': bgColor = 'rgba(244, 67, 54, 0.9)'; break;
                default: bgColor = 'rgba(33, 150, 243, 0.9)';
            }

            const textWidth = ctx.measureText(msg.text).width;
            const boxWidth = Math.max(textWidth + 40, 300);

            ctx.fillStyle = bgColor;
            ctx.fillRect(startX - boxWidth / 2, y, boxWidth, msgHeight);

            // 边框
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX - boxWidth / 2, y, boxWidth, msgHeight);

            // 文字
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px "Courier New"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(msg.text, startX, y + msgHeight / 2);

            ctx.restore();
        }
    }
}
