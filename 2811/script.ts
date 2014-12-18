var canvas: HTMLCanvasElement;
var context: CanvasRenderingContext2D;

var imageData;

enum Mode {
  WITHOUT_WORKER = 1,
  WORKER = 2,
  WORKER_WITHOUT_COPY = 3
}

var mode = Mode.WITHOUT_WORKER;

var modeRadios = document.getElementsByName("mode");
for(var i = 0; i < modeRadios.length; i++) {
  modeRadios[i].addEventListener("click", (event) => {
    mode = parseInt((<HTMLInputElement>event.target).value);
  }, false);
}

var worker = new Worker("worker.js");

var solarityLevelRangeCtrl = <HTMLInputElement>document.querySelector("#solarityLevel");
solarityLevelRangeCtrl.onchange = (event) => {
  switch(mode) {
    case Mode.WITHOUT_WORKER:
      withoutWorker();
    break;
    case Mode.WORKER:
      worker.postMessage({ 
        imageData: imageData,
        level: getLevel()
      });
    break;
    case Mode.WORKER_WITHOUT_COPY:
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
        data[i] = solarizeColor(data[i], level)
        data[i + 1] = solarizeColor(data[i + 1], level)
        data[i + 2] = solarizeColor(data[i + 2], level);
  }
  context.putImageData(imageData, 0, 0);
}

worker.onmessage = (e) => {
  context.putImageData(e.data, 0, 0);
};

canvas = <HTMLCanvasElement>document.getElementById("canvas");
context = canvas.getContext("2d");
var image = new Image();
image.src = "download.jpg";
image.onload = () => {
  context.drawImage(image, 0, 0, image.width, image.height);

  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  worker.postMessage({imageData: imageData, level: getLevel()});
};

function getLevel() {
  return parseInt(solarityLevelRangeCtrl.value);
}

function solarizeColor(color, level) {
  return Math.min(color + level, 255);
}