module Playground {
  var gl: WebGLRenderingContext;
  var shaderProgram;

  window.addEventListener("load", function() {
    start();
  }, false);

  var triangleVertexPositionBuffer;
  var squareVertexPositionBuffer;

  function start() {
    var canvas = <HTMLCanvasElement>document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // drawScene();
  }

  function initGL(canvas: HTMLCanvasElement) {
    try {
      gl = canvas.getContext("webgl");
      gl.viewport(0, 0, canvas.width, canvas.height);
    } catch(e) {
      console.log(e);
    }
    if (!gl) {
      console.log("Could not initialise WebGL, sorry :-( ");
    }
  }

  function initBuffers() {
    triangleVertexPositionBuffer = gl.createBuffer();
  }

  function initShaders() {
    var fragmentShader = getShader(gl, "shaderFs");
    var vertexShader = getShader(gl, "shaderVs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log("could not initialise shaders");
    }

    gl.useProgram(shaderProgram);
  }

  function getShader(gl: WebGLRenderingContext, id: string) {
    var shaderScript = <HTMLScriptElement>document.getElementById(id);
    if(!shaderScript)
      return null;

      var str = "";
      var k = shaderScript.firstChild;
      while(k) {
        if(k.nodeType == 3)
          str += k.textContent;
        k = k.nextSibling;
      }

      var shader;
      if(shaderScript.type == "x-shader/x-fragment")
        shader = gl.createShader(gl.FRAGMENT_SHADER);
      else if(shaderScript.type == "x-shader/x-vertex")
        shader = gl.createShader(gl.VERTEX_SHADER);
      else
        return null;

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
      }
  }
}