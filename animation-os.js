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

// Auto throttle settings
const autoThrottle = true;
const minLineQty = 10;
const minCanvasDrawRate = 20;

let lines = [];
let running = true;
let canvas;
let ctx;


class Line {
    constructor() {
        this.ctx = ctx;
        this.init();
    }

    get startingCoordinates() {
        if (this.startingEdge === 0) {
            return [Math.random() * canvas.width, 0];
        } 
                
        if (this.startingEdge === 1) {
            return [canvas.width, Math.random() * canvas.height];
        } 
        
        if (this.startingEdge === 2) {
            return [Math.random() * canvas.width, canvas.height];
        }

        return [0, Math.random() * canvas.height]
    }

    get nextDirection() {
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
    }

    set point(coordinates) {
        this.points = [coordinates].concat(this.points).slice(0, this.length);
    }

    init() {
        this.points = [];
        this.length = Math.ceil(Math.random() * (maxLength - minLength)) + minLength;
        this.startingEdge = Math.floor(Math.random() * 4);
        this.fadePoint = this.length * fadeAmount / 100;
        this.speed = Math.ceil(Math.random() * (maxLineSpeed - minLineSpeed)) + minLineSpeed;
        [this.xPos, this.yPos] = this.startingCoordinates;
        this.direction = (this.startingEdge + 2) % 4;
    }

    isInCanvas() {
        return !(this.xPos > canvas.width || this.xPos < 0 || this.yPos > canvas.height || this.yPos < 0);
    }

    shrink() {
        this.length--;

        if (this.length === 0) {
            this.init();
            return;
        }

        this.points = this.points.slice(0, this.length);
    }

    move() {
        this.point = [this.xPos, this.yPos];
        this.direction = this.nextDirection;

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
    }

    refresh() {
        this.isInCanvas() ? this.move() : this.shrink();
    }

    draw() {
        for (let i = 1; i < this.points.length; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.shadowBlur = shadowAmount;
            ctx.shadowColor = shadowColour;
            ctx.globalAlpha = (i > this.length - this.fadePoint) ? (this.length - i) / this.fadePoint : "1";
            ctx.strokeStyle = lineColour;
            ctx.lineWidth = lineWidth;
            ctx.moveTo(this.points[i - 1][0], this.points[i - 1][1]);
            ctx.lineTo(this.points[i][0], this.points[i][1]);
            ctx.stroke();
            ctx.restore();
        }
    }
}

function animate() {
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

    function reduceDeviceLoad() {
        if (lines.length > minLineQty) {
            lines.pop();
            return;
        }

        shadowAmount = 0;
        canvasDrawRate = minCanvasDrawRate;
    }

    function render() {
        if (running) {
            lines.forEach(line => {
                line.refresh();
            });

            if (timeToRedraw()) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                lines.forEach(line => {
                    line.draw();
                });

                lastRenderTime = Date.now();
            }
        }

        requestAnimationFrame(render);
    }

    function start() {
        for (let i = 0; i < lineQty; i++) {
            const line = new Line();
            lines.push(line);
        }

        lastRenderTime = Date.now();
        render();
    }

    start();
}

onmessage = function(ev) {
    'use strict'

    if (typeof ev.data.running !== undefined && ev.data.running !== running) {
        running = ev.data.running;
        
        if (running) {
            lastRenderTime = performance.now();
        }
    }

    if (ev.data.width) {
        canvas.width = ev.data.width;
    }

    if (ev.data.height) {
        canvas.height = ev.data.height;
    }

    if (ev.data.canvas) {
        canvas = ev.data.canvas;
        ctx = canvas.getContext('2d');

        // Small device specific settings
        if (canvas.width < 800 || canvas.height < 800) {
            minLength = 50;
            maxLength = 100;
        }

        animate();
    }
}

