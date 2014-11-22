var FRAME_BORDER = 25;
var Pacman = (function () {
    function Pacman() {
        this.x = 100;
        this.y = 100;
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
        if (this.x + Pacman.RADIUS > canvasWidth - FRAME_BORDER)
            this.isMovingForward = false;
        if (this.x - Pacman.RADIUS < FRAME_BORDER)
            this.isMovingForward = true;
        if (this.isMovingForward)
            this.x += (75 / 1000) * timeDiff;
        else
            this.x -= (75 / 1000) * timeDiff;
        if (this.isMouthOpen)
            this.drawWithOpenMouth();
        else
            this.drawWithClosedMouth();
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
        context.lineWidth = Pacman.BORDER_WIDTH;
        context.translate(this.x, this.y);
        context.strokeStyle = "#000000";
        context.rotate(0.2 * Math.PI);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(Pacman.RADIUS, 0);
        context.stroke();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(this.x, this.y);
        context.strokeStyle = "#000000";
        context.rotate(-0.2 * Math.PI);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(Pacman.RADIUS, 0);
        context.stroke();
        context.setTransform(1, 0, 0, 1, 0, 0);
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
var fpsTemp = 0;
var FPS_REFRESH_TIMES = 60;
var fpsRefreshTimesCounter = 0;
function drawFPS(timeDiff) {
    fpsTemp += timeDiff;
    if (!fps || fpsRefreshTimesCounter == FPS_REFRESH_TIMES) {
        alert(fpsRefreshTimesCounter);
        fps = (1000 / fpsTemp) * fpsRefreshTimesCounter;
        fpsRefreshTimesCounter = 0;
        fpsTemp = 0;
    }
    context.fillStyle = "#000000";
    context.fillText(fps.toString(), 50, 50);
    fpsRefreshTimesCounter++;
}
