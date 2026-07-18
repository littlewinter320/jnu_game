// 场景管理器 - 控制场景切换与生命周期
class SceneManager {
    constructor(renderer, input, audio, particles) {
        this.renderer = renderer;
        this.input = input;
        this.audio = audio;
        this.particles = particles;
        this.scenes = {};
        this.currentScene = null;
        this.currentSceneName = '';

        // 场景切换淡入淡出
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.transitionDirection = 1;  // 1=淡出, -1=淡入
        this.pendingScene = null;
        this.pendingData = null;
        this.transitionSpeed = 3;  // 每秒透明度变化
    }

    // 注册场景
    register(name, scene) {
        this.scenes[name] = scene;
    }

    // 切换场景（带淡入淡出）
    changeScene(name, data = {}) {
        if (this.transitioning) return;
        this.pendingScene = name;
        this.pendingData = data;
        this.transitioning = true;
        this.transitionDirection = 1;  // 先淡出
        this.transitionAlpha = 0;
        this.audio.playSFX('sfx_transition');
    }

    // 立即切换（无过渡）
    changeSceneImmediate(name, data = {}) {
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }
        this.currentSceneName = name;
        this.currentScene = this.scenes[name];
        if (this.currentScene && this.currentScene.enter) {
            this.currentScene.enter(data);
        }
    }

    update(dt) {
        this._lastDt = dt;
        // 处理过渡动画
        if (this.transitioning) {
            this.transitionAlpha += this.transitionDirection * this.transitionSpeed * dt;

            if (this.transitionDirection === 1 && this.transitionAlpha >= 1) {
                this.transitionAlpha = 1;
                this._doSceneSwitch();
                this.transitionDirection = -1;
            }

            if (this.transitionDirection === -1 && this.transitionAlpha <= 0) {
                this.transitionAlpha = 0;
                this.transitioning = false;
            }
        }

        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(dt);
        }
    }

    _doSceneSwitch() {
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }
        this.currentSceneName = this.pendingScene;
        this.currentScene = this.scenes[this.pendingScene];
        if (this.currentScene && this.currentScene.enter) {
            this.currentScene.enter(this.pendingData);
        }
    }

    render() {
        this.renderer.beginFrame(this._lastDt || 1 / 60);

        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render();
        }

        if (this.transitioning && this.transitionAlpha > 0) {
            const ctx = this.renderer.ctx;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }
    }
}
