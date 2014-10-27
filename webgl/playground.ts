/// <reference path="shared/GLUtils.ts" />
/// <reference path="shared/MathUtils.ts" />

module Playground {
  "use strict";

    var shaderVertexSource="\n\
attribute vec3 position;\n\
uniform mat4 projectionMatrix;\n\
uniform mat4 movementMatrix;\n\
uniform mat4 vMatrix;\n\
attribute vec3 color;\n\
varying vec3 vColor;\n\
\n\
void main(void) {\n\
gl_Position = projectionMatrix * vMatrix * movementMatrix * vec4(position, 1.0);\n\
vColor = color;\n\
}";

  var shaderFragmentSource="\n\
precision mediump float;\n\
varying vec3 vColor;\n\
\n\
void main(void) {\n\
gl_FragColor = vec4(vColor, 1.0);\n\
}";

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
    var shaderVertex = utils.getShader(shaderVertexSource, gl.VERTEX_SHADER);
    var shaderFragment = utils.getShader(shaderFragmentSource, gl.FRAGMENT_SHADER);
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, shaderVertex);
    gl.attachShader(shaderProgram, shaderFragment);

    gl.linkProgram(shaderProgram);

    var projectionMatrixLocation = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    var movementMatrixLocation = gl.getUniformLocation(shaderProgram, "movementMatrix");
    var vMatrixLocaltion = gl.getUniformLocation(shaderProgram, "vMatrix");
    var positionLocation = gl.getAttribLocation(shaderProgram, "position");
    var colorLocation = gl.getAttribLocation(shaderProgram, "color");

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);

    gl.useProgram(shaderProgram);

    //points
    var triangleVertexBuffer = [
      -1, -1, 0,
      0, 0, 1,

      1, -1, 0,
      1, 1, 0,

      1, 1, 0,
      0, 0, 1,

      1, 1, 0,
      0, 0, 1,

      -1, 1, 0,
      1, 1, 0,

      -1, -1, 0,
      0, 0, 1
    ];
    var triangleVertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertex);
    gl.bufferData(gl.ARRAY_BUFFER, 
                  new Float32Array(triangleVertexBuffer), 
                  gl.STATIC_DRAW);

    //faces
    var triangleFacesBuffer = [0, 1, 2, 3, 4, 5];
    var triangleFaces = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleFaces);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                  new Uint16Array(triangleFacesBuffer),
                  gl.STATIC_DRAW);

    var projectionMatrix = MathUtils.getProjecton(40, canvas.width / canvas.height, 1, 100);
    var movementMatrix = MathUtils.getIdentity4();
    var vMatrix = MathUtils.getIdentity4();
    MathUtils.translateZ(vMatrix, -5)

    //drawing
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    var oldTime = 0;

    function animate(time) {
      var angleDiff = 2 * Math.sin((time % 60) / 800);
      MathUtils.rotateY(movementMatrix, angleDiff)
      oldTime = time;

      gl.viewport(0.0, 0.0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
      gl.uniformMatrix4fv(movementMatrixLocation, false, movementMatrix);
      gl.uniformMatrix4fv(vMatrixLocaltion, false, vMatrix)
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4*(3+3), 0);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 4*(3+3), 3*4)
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertex);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleFaces);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      gl.flush();
      window.requestAnimationFrame(animate)
    }
    animate(0);
  }
}