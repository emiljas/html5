var canvas: HTMLCanvasElement;
var context: CanvasRenderingContext2D;

var imageData;
var solarityLevelRangeCtrl = <HTMLInputElement>document.querySelector("#solarityLevel");
var worker = new Worker("worker.js");
solarityLevelRangeCtrl.onchange = (event) => {
  worker.postMessage({ 
    level: parseInt(solarityLevelRangeCtrl.value)
  });
};

worker.onmessage = (e) => {
  context.putImageData(e.data, 0, 0);
};

var IMAGE_Y_OFFSET = -1900;
var IMAGE_X_OFFSET = -1000;
canvas = <HTMLCanvasElement>document.getElementById("canvas");
context =canvas.getContext("2d");
var image = new Image();
image.src = "download.jpg";
image.onload = () => {
  context.drawImage(image, IMAGE_X_OFFSET, IMAGE_Y_OFFSET, image.width, image.height);

  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  worker.postMessage({imageData: imageData});
};