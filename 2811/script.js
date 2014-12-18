var canvas;
var context;
var imageData;
var Mode;
(function (Mode) {
    Mode[Mode["WITHOUT_WORKER"] = 1] = "WITHOUT_WORKER";
    Mode[Mode["WORKER"] = 2] = "WORKER";
    Mode[Mode["WORKER_WITHOUT_COPY"] = 3] = "WORKER_WITHOUT_COPY";
})(Mode || (Mode = {}));
var mode = 1 /* WITHOUT_WORKER */;
var modeRadios = document.getElementsByName("mode");
for (var i = 0; i < modeRadios.length; i++) {
    modeRadios[i].addEventListener("click", function (event) {
        mode = parseInt(event.target.value);
    }, false);
}
var worker = new Worker("worker.js");
var solarityLevelRangeCtrl = document.querySelector("#solarityLevel");
solarityLevelRangeCtrl.onchange = function (event) {
    switch (mode) {
        case 1 /* WITHOUT_WORKER */:
            withoutWorker();
            break;
        case 2 /* WORKER */:
            worker.postMessage({
                imageData: imageData,
                level: getLevel()
            });
            break;
        case 3 /* WORKER_WITHOUT_COPY */:
            worker.postMessage({
                imageData: imageData,
                level: getLevel()
            }, [imageData.data]);
            break;
    }
};
function withoutWorker() {
    var level = getLevel();
    var data = imageData.data;
    for (var i = 0; i <= data.length - 4; i += 4) {
        data[i] = solarizeColor(data[i], level);
        data[i + 1] = solarizeColor(data[i + 1], level);
        data[i + 2] = solarizeColor(data[i + 2], level);
    }
    context.putImageData(imageData, 0, 0);
}
worker.onmessage = function (e) {
    context.putImageData(e.data, 0, 0);
};
canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
var image = new Image();
image.src = "download.jpg";
image.onload = function () {
    context.drawImage(image, 0, 0, image.width, image.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    worker.postMessage({ imageData: imageData, level: getLevel() });
};
function getLevel() {
    return parseInt(solarityLevelRangeCtrl.value);
}
function solarizeColor(color, level) {
    return Math.min(color + level, 255);
}
