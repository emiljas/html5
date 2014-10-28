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
  uniform mat4 uViewMatrix;\n\
  uniform mat4 uMovementMatrix;\n\
  void main(void) {\n\
    gl_Position = uViewMatrix * uMovementMatrix * vec4(aPosition, 0.0, 1.0);\n\
  }";

  var fragmentShaderSource = "\n\
  void main(void) {\n\
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n\
  }";

  var armPositionLocation: number;
  var armViewMatrixLocation: WebGLUniformLocation;
  var armMovementMatrixLocation: WebGLUniformLocation;

  // var arm1VertexBuffer = [
  //   0.25, 0.0,
  //   0.75, 0.0,
  //   0.75, 1.0,
  //   0.25, 1.0,
  // ];

  var arm1VertexBuffer = [
    0.25, 0.0,
    0.75, 0.0,
    0.75, 1.0,
    0.25, 1.0,
  ];

  var arm1FacesBuffer = [0, 1, 2, 2, 3, 0];

  var arm2VertexBuffer = [
    -1.0, -1.0,
    -0.7, -1.0,
    -1.0, -0.7,
  ];

  var arm2FacesBuffer = [0, 1, 2];

  function main() {
    var isLeftButtonDown = false;
    var leftButtonPosition = { x: 0, y: 0 };
    var isRightButtonDown = false;
    var rightButtonPosition = { x: 0, y: 0 };

    canvas.oncontextmenu = function(e) {
      e.preventDefault();
    }

    canvas.addEventListener("pointerdown", function(e) {
      console.log(e.offsetX, e.offsetY);
      if(isLeftButton(e))
        isLeftButtonDown = true;
      if(isRightButton(e))
        isRightButtonDown = true;
    }, false);

    canvas.addEventListener("pointermove", function(e) {
      if(isLeftButtonDown) {
        console.log("left");
      }
      if(isRightButtonDown) {
        console.log("right");
      }
    }, false);

    canvas.addEventListener("pointerup", function(e) {
      if(isLeftButton(e))
        isLeftButtonDown = false;
      if(isRightButton(e))
        isRightButtonDown = false;
    }, false);

    canvas.addEventListener("pointerleave", function(e) {
      if(isLeftButton(e))
        isLeftButtonDown = false;
      if(isRightButton(e))
        isRightButtonDown = false;
    }, false)

    function isLeftButton(e: MouseEvent) {
      return e.button === 0;
    }

    function isRightButton(e: MouseEvent) {
      return e.button === 2;
    }

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

    var viewMatrix1 = mat4.create();
    mat4.identity(viewMatrix1);

    var movementMatrix1 = mat4.create();
    mat4.identity(movementMatrix1);

    // mat4.translate(viewMatrix1, viewMatrix1, [0, 0, -1]);

    var viewMatrix2 = mat4.create();
    mat4.identity(viewMatrix2);

    var movementMatrix2 = mat4.create();
    mat4.identity(movementMatrix2);

    // mat4.translate(viewMatrix2, viewMatrix2, [0, 0, -3]);

    var oldTime = 0;

    function animate(time) {
      var dAngle = 0.25 * (time - oldTime);
      // mat4.rotate(movementMatrix1, movementMatrix1, glMatrix.toRadian(dAngle), [0, 1, 0]);

      oldTime = time;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.bindBuffer(gl.ARRAY_BUFFER, arm1Vertex);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm1Faces);
      gl.uniformMatrix4fv(armViewMatrixLocation, false, viewMatrix1);
      gl.uniformMatrix4fv(armMovementMatrixLocation, false, movementMatrix1);
      gl.vertexAttribPointer(armPositionLocation, 2, gl.FLOAT, false, 4*2, 0);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, arm2Vertex);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm2Faces);
      gl.uniformMatrix4fv(armViewMatrixLocation, false, viewMatrix2);
      gl.uniformMatrix4fv(armMovementMatrixLocation, false, movementMatrix2);
      gl.vertexAttribPointer(armPositionLocation, 2, gl.FLOAT, false, 4*2, 0);
      gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

      gl.flush();
      window.requestAnimationFrame(animate);
    }
    animate(0);
  }

  function initShaders() {
    initArmShader();
  }

  function initArmShader() {
    var program = utils.useProgram(vertexShaderSource, fragmentShaderSource);

    armPositionLocation = gl.getAttribLocation(program, "aPosition");
    armViewMatrixLocation = gl.getUniformLocation(program, "uViewMatrix");
    armMovementMatrixLocation = gl.getUniformLocation(program, "uMovementMatrix");

    gl.enableVertexAttribArray(armPositionLocation);
  }
}