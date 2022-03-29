(() => {
    'use strict';

    // General settings
    const turnChance = 0.5;
    const minLineSpeed = 2;
    const maxLineSpeed = 5;
    const lineQty = 30;
    let minLength = 50;
    let maxLength = 200;
    let canvasDrawRate = 60;

    // Appearance settings
    const lineWidth = 1;
    const lineColour = 'white';
    const shadowColour = 'lightblue';
    const fadeAmount = 75;
    let shadowAmount = 5;

    // Small device specific settings
    if (window.innerWidth < 800 || window.innerHeight < 800) {
        minLength = 50;
        maxLength = 100;
    }

    // Auto throttle settings
    const autoThrottle = true;
    const minLineQty = 10;
    const minCanvasDrawRate = 20;

    window.addEventListener('load', () => {
        const canvas = document.createElement('canvas');

        if (!canvas || !canvas.getContext) {
            return false;
        }

        document.querySelector('main').prepend(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        const lines = [];
        let running = true;
        let lastRenderTime = Date.now();

        function Line() {
            this.ctx = ctx;
            this.init();
        }

        Line.prototype.init = function() {
            this.points = [];
            this.length = Math.ceil(Math.random() * (maxLength - minLength)) + minLength;
            this.startingEdge = Math.floor(Math.random() * 4);
            this.fadePoint = this.length * fadeAmount / 100;
            this.speed = Math.ceil(Math.random() * (maxLineSpeed - minLineSpeed)) + minLineSpeed;

            if (this.startingEdge === 0) {
                this.xPos = Math.random() * canvas.width;
                this.yPos = 0;
            } else if (this.startingEdge === 1) {
                this.xPos = canvas.width;
                this.yPos = Math.random() * canvas.height;
            } else if (this.startingEdge === 2) {
                this.xPos = Math.random() * canvas.width;
                this.yPos = canvas.height;
            } else {
                this.xPos = 0;
                this.yPos = Math.random() * canvas.height;
            }

            this.direction = (this.startingEdge + 2) % 4;
        };

        Line.prototype.isInCanvas = function() {
            return !(this.xPos > canvas.width || this.xPos < 0 || this.yPos > canvas.height || this.yPos < 0);
        };

        Line.prototype.getNextDirection = function() {
            if (turnChance === 0) {
                return this.direction;
            }

            const dir = Math.random() * 100;

            if (dir < turnChance) {
                return (this.direction + 3) % 4 === this.startingEdge ? this.direction : (this.direction + 3) % 4;
            }

            if (dir > 100 - turnChance) {
                return (this.direction + 1) % 4 === this.startingEdge ? this.direction : (this.direction + 1) % 4;
            }

            return this.direction;
        };

        Line.prototype.shrink = function() {
            this.length--;

            if (this.length === 0) {
                this.init();
                return;
            }

            this.points = this.points.slice(0, this.length);
        };

        Line.prototype.move = function() {
            this.points = [[this.xPos, this.yPos]].concat(this.points).slice(0, this.length);
            this.direction = this.getNextDirection();

            if (this.direction === 0) {
                this.yPos -= this.speed;
                return;
            }

            if (this.direction === 1) {
                 this.xPos += this.speed;
                 return;
            }

            if (this.direction === 2) {
                this.yPos += this.speed;
                return;
            }

            this.xPos -= this.speed;
        };

        Line.prototype.refresh = function() {
            this.isInCanvas() ? this.move() : this.shrink();
        };

        Line.prototype.draw = function() {
            for (let i = 1; i < this.points.length; i++) {
                ctx.save();
                ctx.beginPath();
                ctx.shadowBlur = shadowAmount;
                ctx.shadowColor = shadowColour;

                if (i > this.length - this.fadePoint) {
                    ctx.globalAlpha = (this.length - i) / this.fadePoint;
                }

                ctx.strokeStyle = lineColour;
                ctx.lineWidth = lineWidth;
                ctx.moveTo(this.points[i - 1][0], this.points[i - 1][1]);
                ctx.lineTo(this.points[i][0], this.points[i][1]);
                ctx.stroke();
                ctx.restore();
            }
        };

        function reduceDeviceLoad() {
            if (lines.length > minLineQty) {
                lines.pop();
                return;
            }

            shadowAmount = 0;
            canvasDrawRate = minCanvasDrawRate;
        }

        function timeToRedraw() {
            const frameTime = Date.now() - lastRenderTime;
            const targetFrameTime = 1000 / canvasDrawRate;

            if (autoThrottle && canvasDrawRate > minCanvasDrawRate && frameTime > targetFrameTime * 3) {
                reduceDeviceLoad();
            }

            if (frameTime > targetFrameTime) {
                return true;
            }

            return false;
        }

        function render() {
            if (running) {
                lines.forEach((line) => {
                    line.refresh();
                });

                if (timeToRedraw()) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    lines.forEach((line) => {
                        line.draw();
                    });

                    lastRenderTime = Date.now();
                }
            }

            requestAnimationFrame(render);
        }

        for (let i = 0; i < lineQty; i++) {
            const line = new Line();
            lines.push(line);
        }

        render();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > canvas.height) {
                running = false;
                canvas.style.display = 'none';
                return;
            }

            canvas.style.display = 'block';
            running = true;
            lastRenderTime = Date.now();
        });
    });
})();

