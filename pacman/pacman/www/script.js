var FRAME_BORDER = 25;
var MARGIN = 20;
var Pacman = (function () {
    function Pacman(x, y, radius) {
        this.absoluteX = 100;
        this.absoluteY = 300;
        this.isMouthOpen = true;
        this.isMovingForward = true;
        this.absoluteX = x;
        this.absoluteY = y;
        this.radius = radius;
        this.eyeRadius = this.radius / 10;
        this.eyeRelativeX = -this.radius / 3;
        this.eyeRelativeY = -this.radius / 2.5;
        this.borderWidth = this.radius / 25;
    }
    Pacman.prototype.draw = function (time, timeDiff) {
        if (!this.lastChangeMouthStateTime)
            this.lastChangeMouthStateTime = time;
        if (time - this.lastChangeMouthStateTime > Pacman.CHANGE_MOUTH_STATE_INTERVAL) {
            this.isMouthOpen = !this.isMouthOpen;
            this.lastChangeMouthStateTime = time;
        }
        if (this.absoluteX + this.radius > canvasWidth - FRAME_BORDER)
            this.isMovingForward = false;
        if (this.absoluteX - this.radius < FRAME_BORDER)
            this.isMovingForward = true;
        context.save();
        var move = Pacman.PIXELS_MOVE_FOR_MILLISECOND * timeDiff;
        if (this.isMovingForward)
            this.absoluteX += move;
        else {
            this.absoluteX -= move;
            context.translate(canvasWidth, 0);
            context.scale(-1, 1);
        }
        if (this.isMovingForward) {
            this.x = this.absoluteX;
            this.y = this.absoluteY;
        }
        else {
            this.x = canvasWidth - this.absoluteX;
            this.y = this.absoluteY;
        }
        if (this.isMouthOpen) {
            this.drawWithOpenMouth();
        }
        else {
            this.drawWithClosedMouth();
        }
        context.restore();
    };
    Pacman.prototype.drawWithOpenMouth = function () {
        this.drawBorderWithOpenMouth();
        this.applyBackgroundGradient();
        context.beginPath();
        context.arc(this.x, this.y, this.radius - this.borderWidth, 0.2 * Math.PI, 1.2 * Math.PI, false);
        context.fill();
        context.beginPath();
        context.arc(this.x, this.y, this.radius - this.borderWidth, -0.2 * Math.PI, 0.8 * Math.PI, true);
        context.fill();
        this.drawOpenMouth();
        this.drawEye();
    };
    Pacman.prototype.drawOpenMouth = function () {
        context.save();
        context.translate(this.x, this.y);
        context.lineWidth = this.borderWidth;
        context.strokeStyle = "#000000";
        context.rotate(0.2 * Math.PI);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(this.radius, 0);
        context.stroke();
        context.strokeStyle = "#000000";
        context.rotate(-0.4 * Math.PI);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(this.radius, 0);
        context.stroke();
        context.restore();
    };
    Pacman.prototype.drawBorderWithOpenMouth = function () {
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0.2 * Math.PI, 1.2 * Math.PI, false);
        context.fill();
        context.beginPath();
        context.arc(this.x, this.y, this.radius, -0.2 * Math.PI, 0.8 * Math.PI, true);
        context.fill();
    };
    Pacman.prototype.drawWithClosedMouth = function () {
        this.drawBorderWithClosedMouth();
        this.applyBackgroundGradient();
        context.beginPath();
        context.arc(this.x, this.y, this.radius - this.borderWidth, 0, 2 * Math.PI, false);
        context.fill();
        this.drawClosedMouth();
        this.drawEye();
    };
    Pacman.prototype.drawClosedMouth = function () {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.radius, this.y);
        context.stroke();
    };
    Pacman.prototype.drawEye = function () {
        context.beginPath();
        context.fillStyle = "#000000";
        context.arc(this.x + this.eyeRelativeX, this.y + this.eyeRelativeY, this.eyeRadius, 0, 2 * Math.PI, false);
        context.fill();
    };
    Pacman.prototype.applyBackgroundGradient = function () {
        var gradient = context.createLinearGradient(0, this.y - this.radius, 0, this.y + this.radius);
        gradient.addColorStop(0, "#FDD300");
        gradient.addColorStop(1, "#E57D00");
        context.fillStyle = gradient;
    };
    Pacman.prototype.drawBorderWithClosedMouth = function () {
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
        context.strokeStyle = "#000000";
        context.lineWidth = this.borderWidth;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
    };
    Pacman.CHANGE_MOUTH_STATE_INTERVAL = 1000;
    Pacman.PIXELS_MOVE_FOR_MILLISECOND = 75 / 1000;
    return Pacman;
})();
var canvas;
var canvasWidth, canvasHeight;
var context;
var pacmans = [new Pacman(100, 100, 70), new Pacman(100, 250, 60), new Pacman(100, 400, 50), new Pacman(100, 500, 25), new Pacman(100, 550, 7)];
window.addEventListener("load", function () {
    canvas = document.getElementById("canvas");
    canvas.width = document.documentElement.clientWidth - MARGIN;
    canvas.height = document.documentElement.clientHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    context = canvas.getContext("2d");
    window.requestAnimationFrame(gameLoop);
}, false);
function gameLoop(time) {
    clearCanvas();
    draw(time);
    window.requestAnimationFrame(gameLoop);
}
function clearCanvas() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
}
var lastDrawTime;
function draw(time) {
    if (!lastDrawTime)
        lastDrawTime = time;
    var timeDiff = time - lastDrawTime;
    drawFrame();
    drawFPS(timeDiff);
    for (var i = 0; i < pacmans.length; i++) {
        pacmans[i].draw(time, timeDiff);
    }
    lastDrawTime = time;
}
function drawFrame() {
    context.beginPath();
    context.moveTo(0, 0);
    context.lineWidth = FRAME_BORDER * 2;
    context.strokeStyle = "#ff0000";
    context.lineTo(0, canvasHeight);
    context.lineTo(canvasWidth, canvasHeight);
    context.lineTo(canvasWidth, 0);
    context.lineTo(0, 0);
    context.stroke();
}
var fps;
var fpsTime = 0;
var FPS_REFRESH_TIMES = 60;
var fpsRefreshTimesCounter = 0;
function drawFPS(timeDiff) {
    fpsTime += timeDiff;
    if (!fps || fpsRefreshTimesCounter == FPS_REFRESH_TIMES) {
        fps = Math.floor((1000 / fpsTime) * fpsRefreshTimesCounter);
        fpsRefreshTimesCounter = 0;
        fpsTime = 0;
    }
    context.fillStyle = "#ffffff";
    context.font = "20pt Calibri";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("FPS: " + fps.toString(), canvasWidth / 2, FRAME_BORDER / 2);
    fpsRefreshTimesCounter++;
}
