var canvas;
var context;
var imageData;
var solarityLevelRangeCtrl = document.querySelector("#solarityLevel");
var worker = new Worker("worker.js");
solarityLevelRangeCtrl.onchange = function (event) {
    worker.postMessage({
        level: parseInt(solarityLevelRangeCtrl.value)
    });
};
worker.onmessage = function (e) {
    context.putImageData(e.data, 0, 0);
};
var IMAGE_Y_OFFSET = -1900;
var IMAGE_X_OFFSET = -1000;
canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
var image = new Image();
image.src = "download.jpg";
image.onload = function () {
    context.drawImage(image, IMAGE_X_OFFSET, IMAGE_Y_OFFSET, image.width, image.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    worker.postMessage({ imageData: imageData });
};
