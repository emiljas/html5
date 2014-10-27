/// <reference path="shared/GLUtils.ts" />
/// <reference path="shared/MathUtils.ts" />

module Triangle {
  "use strict";

  var vertexShaderSource = "\n\
  attribute vec3 color;\n\
  attribute vec2 position;\n\
  varying vec3 varyingColor;\n\
  void main(void) {\n\
    gl_Position = vec4(position, 0.0, 1.0);\n\
    varyingColor = color;\n\
  }";

  var fragmentShaderSource = "\n\
  precision mediump float;\n\
  varying vec3 varyingColor;\n\
  void main(void) {\n\
    gl_FragColor = vec4(varyingColor, 1.0);\n\
  }";

  // var triangleVertexBuffer = [
  //   1.0, 0.0, 0.0,
  //   100.0, 50.0,

  //   0.0, 1.0, 0.0,
  //   450.0, 400.0,

  //   0.0, 0.0, 1.0,
  //   450.0, 50.0,
  // ];

  var triangleVertexBuffer = [
    1.0, 0.0, 0.0,
    -0.2, 0.8,

    0.0, 1.0, 0.0,
    0.8, 0.8,

    0.0, 0.0, 1.0,
    0.8, -0.6,
  ];

  var triangleFacesBuffer = [0, 1, 2];

  var canvasId = "canvas";
  var utils: GLUtils;
  var canvas: HTMLCanvasElement;
  var gl: WebGLRenderingContext;

  window.addEventListener("load", function() {
    utils = new GLUtils(canvasId);
    canvas = utils.getCanvas();
    gl = utils.getContext();
    main();
  }, false);

  function main() {
    var vertexShader = utils.getShader(vertexShaderSource, gl.VERTEX_SHADER);
    var fragmentShader = utils.getShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    var colorLocation = gl.getAttribLocation(shaderProgram, "color");
    var positionLocation = gl.getAttribLocation(shaderProgram, "position");

    gl.enableVertexAttribArray(colorLocation);
    gl.enableVertexAttribArray(positionLocation);

    gl.useProgram(shaderProgram);

    var triangleVertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertex);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(triangleVertexBuffer),
                  gl.STATIC_DRAW);

    var triangleFaces = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleFaces);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                  new Uint16Array(triangleFacesBuffer),
                  gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    var oldTime = 0;


    function animate(time) {
      oldTime = time;
      gl.viewport(0.0, 0.0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 4*(3+2), 0);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 4*(3+2), 3*4);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertex);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleFaces);
      gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

      gl.flush();
      window.requestAnimationFrame(animate);
    }
    animate(0);
  }
}