// 对话框
class DialogBox {
    constructor() {
        this.visible = false;
        this.text = '';
        this.speaker = '';
        this.typewriterSpeed = 30;  // 每秒字符数
        this.typewriterTimer = 0;
        this.displayedChars = 0;
        this.onComplete = null;
    }

    // 显示对话框
    show(speaker, text, onComplete = null) {
        this.visible = true;
        this.speaker = speaker;
        this.text = text;
        this.displayedChars = 0;
        this.typewriterTimer = 0;
        this.onComplete = onComplete;
    }

    // 隐藏
    hide() {
        this.visible = false;
        if (this.onComplete) {
            this.onComplete();
            this.onComplete = null;
        }
    }

    update(dt) {
        if (!this.visible) return;

        // 打字机效果
        if (this.displayedChars < this.text.length) {
            this.typewriterTimer += dt * this.typewriterSpeed;
            this.displayedChars = Math.floor(this.typewriterTimer);
            if (this.displayedChars > this.text.length) {
                this.displayedChars = this.text.length;
            }
        }
    }

    render(ctx) {
        if (!this.visible) return;

        const x = CONFIG.CANVAS_WIDTH / 2 - 400;
        const y = CONFIG.CANVAS_HEIGHT - 180;
        const w = 800;
        const h = 150;

        // 对话框背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, w, h);

        // 边框
        ctx.strokeStyle = '#4af';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // 三角指示器
        ctx.fillStyle = '#4af';
        ctx.beginPath();
        ctx.moveTo(x + 50, y);
        ctx.lineTo(x + 70, y);
        ctx.lineTo(x + 60, y - 15);
        ctx.closePath();
        ctx.fill();

        // 说话人
        if (this.speaker) {
            ctx.fillStyle = '#4af';
            ctx.font = 'bold 20px "Courier New"';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(this.speaker, x + 20, y + 15);
        }

        // 文本（打字机效果）
        const displayText = this.text.substring(0, this.displayedChars);
        ctx.fillStyle = '#fff';
        ctx.font = '18px "Courier New"';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // 自动换行
        this._wrapText(ctx, displayText, x + 20, y + 50, w - 40, 24);

        // 继续提示
        if (this.displayedChars >= this.text.length) {
            const blink = Math.sin(Date.now() / 200) > 0;
            if (blink) {
                ctx.fillStyle = '#fff';
                ctx.font = '16px "Courier New"';
                ctx.textAlign = 'right';
                ctx.fillText('▼ 按空格继续', x + w - 20, y + h - 25);
            }
        }
    }

    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y + i * lineHeight);
        }
    }

    // 检查是否显示完成
    isComplete() {
        return this.displayedChars >= this.text.length;
    }
}
