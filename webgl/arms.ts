/// <reference path="shared/GLUtils.ts" />
/// <reference path="shared/MathUtils.ts" />

module Arms {
  "use strict";

  declare var glMatrix: any;
  declare var mat4: any;

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

  var vertexShaderSource = "\n\
  attribute vec2 aPosition;\n\
  uniform mat4 uProjectionMatrix;\n\
  uniform mat4 uViewMatrix;\n\
  uniform mat4 uMovementMatrix;\n\
  void main(void) {\n\
    gl_Position = uProjectionMatrix * uViewMatrix * uMovementMatrix * vec4(aPosition, 0.0, 1.0);\n\
  }";

  var fragmentShaderSource = "\n\
  void main(void) {\n\
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n\
  }";

  var vertexShaderSource2 = "\n\
  attribute vec2 aPosition;\n\
  void main(void) {\n\
    gl_Position = vec4(aPosition, 0.0, 1.0);\n\
  }";

  var fragmentShaderSource2 = "\n\
  void main(void) {\n\
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n\
  }";

  var arm1VertexBuffer = [
    0.25, 0.0,
    0.75, 0.0,
    0.75, 1.0,
    0.25, 1.0,
  ];

  var arm1FacesBuffer = [0, 1, 2, 2, 3, 0];

  var arm1PositionLocation: number;
  var arm1ProjectionMatrixLocation: WebGLUniformLocation;
  var arm1ViewMatrixLocation: WebGLUniformLocation;
  var arm1MovementMatrixLocation: WebGLUniformLocation;

  var arm2VertexBuffer = [
    -1.0, -1.0,
    -0.7, -1.0,
    -1.0, -0.7,
  ];

  var arm2FacesBuffer = [0, 1, 2];

  var arm2PositionLocation: number;
  // var arm2ProjectionMatrixLocation: number;
  // var arm2ViewMatrixLocation: number;
  // var arm2MovementMatrixLocation: number;

  function main() {
    initShaders();

    var arm1Vertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arm1Vertex);
    gl.bufferData(gl.ARRAY_BUFFER, 
                  new Float32Array(arm1VertexBuffer), 
                  gl.STATIC_DRAW);

    var arm1Faces = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm1Faces);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
                  new Uint16Array(arm1FacesBuffer), 
                  gl.STATIC_DRAW);

    var arm2Vertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arm2Vertex);
    gl.bufferData(gl.ARRAY_BUFFER, 
                  new Float32Array(arm2VertexBuffer), 
                  gl.STATIC_DRAW);

    var arm2Faces = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm2Faces);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
                  new Uint16Array(arm2FacesBuffer), 
                  gl.STATIC_DRAW);

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    var projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 
                    glMatrix.toRadian(40), 
                    canvas.width / canvas.height,
                    1, 100);

    var viewMatrix = mat4.create();
    mat4.identity(viewMatrix);

    var movementMatrix = mat4.create();
    mat4.identity(movementMatrix);

    mat4.translate(viewMatrix, viewMatrix, [0, 0, -5]);

    var oldTime = 0;

    function animate(time) {
      var dAngle = 0.25 * (time - oldTime);
      mat4.rotate(movementMatrix, movementMatrix, glMatrix.toRadian(dAngle), [0, 1, 0]);

      oldTime = time;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.uniformMatrix4fv(arm1ProjectionMatrixLocation, false, projectionMatrix);
      gl.uniformMatrix4fv(arm1ViewMatrixLocation, false, viewMatrix);
      gl.uniformMatrix4fv(arm1MovementMatrixLocation, false, movementMatrix);
      gl.vertexAttribPointer(arm1PositionLocation, 2, gl.FLOAT, false, 4*2, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, arm1Vertex);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      gl.vertexAttribPointer(arm2PositionLocation, 2, gl.FLOAT, false, 4*2, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, arm2Vertex);
      gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

      gl.flush();
      window.requestAnimationFrame(animate);
    }
    animate(0);
  }

  function initShaders() {
    initArm1Shader();
    initArm2Shader();
  }

  function initArm1Shader() {
    var program = utils.useProgram(vertexShaderSource, fragmentShaderSource);

    arm1PositionLocation = gl.getAttribLocation(program, "aPosition");
    arm1ProjectionMatrixLocation = gl.getUniformLocation(program, "uProjectionMatrix");
    arm1ViewMatrixLocation = gl.getUniformLocation(program, "uViewMatrix");
    arm1MovementMatrixLocation = gl.getUniformLocation(program, "uMovementMatrix");

    gl.enableVertexAttribArray(arm1PositionLocation);
  }

  function initArm2Shader() {
    var program = utils.useProgram(vertexShaderSource2, fragmentShaderSource2);

    arm2PositionLocation = gl.getAttribLocation(program, "aPosition");

    gl.enableVertexAttribArray(arm2PositionLocation);
  }
}