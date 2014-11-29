var canvas: HTMLCanvasElement;
var context;

window.addEventListener("load", () => {
  var worker = new Worker("worker.js");
  worker.onmessage = (e) => {
    console.log("a");
  };
  worker.postMessage("abc");
  

  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  var context =canvas.getContext("2d");
  var image = new Image();
  image.src = "download.jpg";
  image.onload = (t) => {
    context.drawImage(image, 10, 10);


    var idata = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = idata.data;
    for (var i = 0; i <= data.length - 4; i += 4) {
          data[i] = solarizeVal(data[i])
          data[i + 1] = solarizeVal(data[i + 1])
          data[i + 2] = solarizeVal(data[i + 2]);
    }
    context.putImageData(idata, 0, 0);
  };

var SOLARIZE_LEVEL = 100;
  function solarizeVal(v) {
    if(v + SOLARIZE_LEVEL <= 255)
      v = v + SOLARIZE_LEVEL;
    else
      v = 255;
    return v;
  }

}, false);