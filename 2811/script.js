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
var IMAGE_Y_OFFSET = -600;
canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
var image = new Image();
image.src = "download.jpg";
image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height + IMAGE_Y_OFFSET;
    context.drawImage(image, 0, IMAGE_Y_OFFSET, image.width, image.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    worker.postMessage({ imageData: imageData });
};
