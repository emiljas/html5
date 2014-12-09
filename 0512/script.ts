var canvas: HTMLCanvasElement, context: CanvasRenderingContext2D;
var canvasWidth: number, canvasHeight: number;

var isFilter1Enabled = false, isFilter2Enabled = false;
var originalImage: HTMLImageElement;
var originalText: string;


window.addEventListener("load", (e) => {
  var filter1CB = <HTMLInputElement>document.getElementById("filter1CB");
  var filter2CB = <HTMLInputElement>document.getElementById("filter2CB");
  filter1CB.addEventListener("change", (e) => {enableOrDisableFilter(e, 1);}, false);
  filter2CB.addEventListener("change", (e) => {enableOrDisableFilter(e, 2);}, false);

  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  context = canvas.getContext("2d");
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  canvas.addEventListener("dragenter", (e) => {
    e.stopPropagation();
    e.preventDefault();
  }, false);
  canvas.addEventListener("dragover", (e) => {
    e.stopPropagation();
    e.preventDefault();
  }, false);
  canvas.addEventListener("drop", (e) => {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;
    var file = dt.files[0];

    var isImage = file.name.match(/\.(jpg|jpeg|png|gif)$/);
    if(isImage) {
      var img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = function() {
        originalImage = img;
        draw();
      }
    }
    else {
      var reader = new FileReader();
      reader.onload = function(e) {
        var text = reader.result;
        context.fillStyle = "red";
        context.font = "30px Sans-Serif";
        originalText = text;
        draw();
      }
      reader.readAsText(file);
    }
  }, false);
}, false);

function enableOrDisableFilter(e: Event, which: number) {
  var cb = <HTMLInputElement>e.target;
  if(which == 1) isFilter1Enabled = cb.checked;
  if(which == 2) isFilter2Enabled = cb.checked;
  draw();
}

var solarizeLevel = 100;

function draw() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  if(originalImage) {
    context.drawImage(originalImage, 0, 0);
    if(isFilter1Enabled) {
      var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      var data = imageData.data;
      for (var i = 0; i <= data.length - 4; i += 4) {
            data[i] = solarizeColor(data[i], solarizeLevel)
            data[i + 1] = solarizeColor(data[i + 1], solarizeLevel)
            data[i + 2] = solarizeColor(data[i + 2], solarizeLevel);
        }
      context.putImageData(imageData, 0, 0);
    }
    if(isFilter2Enabled) {
      var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      var data = imageData.data;
      for (var i = 0; i <= data.length - 4; i += 4) {
            data[i] = 0;
            data[i + 1] = solarizeColor(data[i + 1], solarizeLevel)
            data[i + 2] = solarizeColor(data[i + 2], solarizeLevel);
        }
      context.putImageData(imageData, 0, 0);
    }
  }
  if(originalText)
    context.fillText(originalText, 0, 100);
}

function solarizeColor(color, level) {
  return Math.min(color + level, 255);
}