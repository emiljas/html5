var FRAME_BORDER = 25;
var Pacman = (function () {
    function Pacman() {
        this.absoluteX = 100;
        this.absoluteY = 300;
        this.isMouthOpen = true;
        this.isMovingForward = true;
    }
    Pacman.prototype.draw = function (time, timeDiff) {
        if (!this.lastChangeMouthStateTime)
            this.lastChangeMouthStateTime = time;
        if (time - this.lastChangeMouthStateTime > Pacman.CHANGE_MOUTH_STATE_INTERVAL) {
            this.isMouthOpen = !this.isMouthOpen;
            this.lastChangeMouthStateTime = time;
        }
        if (this.absoluteX + Pacman.RADIUS > canvasWidth - FRAME_BORDER)
            this.isMovingForward = false;
        if (this.absoluteX - Pacman.RADIUS < FRAME_BORDER)
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
        context.arc(this.x, this.y, Pacman.RADIUS - Pacman.BORDER_WIDTH, 0.2 * Math.PI, 1.2 * Math.PI, false);
        context.fill();
        context.beginPath();
        context.arc(this.x, this.y, Pacman.RADIUS - Pacman.BORDER_WIDTH, -0.2 * Math.PI, 0.8 * Math.PI, true);
        context.fill();
        this.drawOpenMouth();
        this.drawEye();
    };
    Pacman.prototype.drawOpenMouth = function () {
        context.save();
        context.translate(this.x, this.y);
        context.lineWidth = Pacman.BORDER_WIDTH;
        context.strokeStyle = "#000000";
        context.rotate(0.2 * Math.PI);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(Pacman.RADIUS, 0);
        context.stroke();
        context.strokeStyle = "#000000";
        context.rotate(-0.4 * Math.PI);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(Pacman.RADIUS, 0);
        context.stroke();
        context.restore();
    };
    Pacman.prototype.drawBorderWithOpenMouth = function () {
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(this.x, this.y, Pacman.RADIUS, 0.2 * Math.PI, 1.2 * Math.PI, false);
        context.fill();
        context.beginPath();
        context.arc(this.x, this.y, Pacman.RADIUS, -0.2 * Math.PI, 0.8 * Math.PI, true);
        context.fill();
    };
    Pacman.prototype.drawWithClosedMouth = function () {
        this.drawBorderWithClosedMouth();
        this.applyBackgroundGradient();
        context.beginPath();
        context.arc(this.x, this.y, Pacman.RADIUS - Pacman.BORDER_WIDTH, 0, 2 * Math.PI, false);
        context.fill();
        this.drawClosedMouth();
        this.drawEye();
    };
    Pacman.prototype.drawClosedMouth = function () {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + Pacman.RADIUS, this.y);
        context.stroke();
    };
    Pacman.prototype.drawEye = function () {
        context.beginPath();
        context.fillStyle = "#000000";
        context.arc(this.x + Pacman.EYE_RELATIVE_X, this.y + Pacman.EYE_RELATIVE_Y, Pacman.EYE_RADIUS, 0, 2 * Math.PI, false);
        context.fill();
    };
    Pacman.prototype.applyBackgroundGradient = function () {
        var gradient = context.createLinearGradient(0, this.y - Pacman.RADIUS, 0, this.y + Pacman.RADIUS);
        gradient.addColorStop(0, "#FDD300");
        gradient.addColorStop(1, "#E57D00");
        context.fillStyle = gradient;
    };
    Pacman.prototype.drawBorderWithClosedMouth = function () {
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(this.x, this.y, Pacman.RADIUS, 0, 2 * Math.PI, false);
        context.fill();
        context.strokeStyle = "#000000";
        context.lineWidth = Pacman.BORDER_WIDTH;
        context.beginPath();
        context.arc(this.x, this.y, Pacman.RADIUS, 0, 2 * Math.PI, false);
        context.fill();
    };
    Pacman.RADIUS = 70;
    Pacman.EYE_RADIUS = Pacman.RADIUS / 10;
    Pacman.EYE_RELATIVE_X = -Pacman.RADIUS / 3;
    Pacman.EYE_RELATIVE_Y = -Pacman.RADIUS / 2.5;
    Pacman.BORDER_WIDTH = 3;
    Pacman.CHANGE_MOUTH_STATE_INTERVAL = 1000;
    Pacman.PIXELS_MOVE_FOR_MILLISECOND = 75 / 1000;
    return Pacman;
})();
var canvas;
var canvasWidth, canvasHeight;
var context;
var pacman = new Pacman();
window.addEventListener("load", function () {
    canvas = document.getElementById("canvas");
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
    pacman.draw(time, timeDiff);
    lastDrawTime = time;
}
function drawFrame() {
    context.beginPath();
    context.moveTo(0, 0);
    context.lineWidth = FRAME_BORDER * 2;
    context.strokeStyle = "#ff0000";
    context.lineTo(0, 600);
    context.lineTo(800, 600);
    context.lineTo(800, 0);
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
