module Playground {
  window.addEventListener("load", function() {
    start();
  }, false);

  function start() {
    var canvas = <HTMLCanvasElement>document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0. 1.0);
    gl.enable(gl.DEPTH_TEST);

    drawScene();
  }
}