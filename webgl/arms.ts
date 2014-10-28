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

  var greaterD = 0.09;
  var smallerD = 0.05;

  var arm1L = 0.9;
  var arm1VertexBuffer = [
    -greaterD, -smallerD,
    arm1L - greaterD, -smallerD,
    arm1L - greaterD, smallerD,
    -greaterD, smallerD,
  ];

  var arm1FacesBuffer = [0, 1, 2, 2, 3, 0];

  var arm2L = 0.75;
  var arm2VertexBuffer = [
    -smallerD, -greaterD,
    smallerD, -greaterD,
    smallerD, arm2L - greaterD,
    -smallerD, arm2L - greaterD,
  ];

  var arm2FacesBuffer = [0, 1, 2, 2, 3, 0];

  function main() {
    var isLeftButtonDown = false;
    var leftActionPosition = { x: 0, y: 0 };
    var rotate = { x: 0, y: 0 };
    var isRightButtonDown = false;
    var rightActionPosition = { x: 0, y: 0 };
    var angle1 = 15;
    var angle2 = 15;
    var translateX = 0;
    var translateY = 0;

    canvas.oncontextmenu = function(e) {
      e.preventDefault();
    }

    canvas.addEventListener("pointerdown", function(e) {
      leftActionPosition = { x: e.offsetX, y: e.offsetY };

      if(isLeftButton(e))
        isLeftButtonDown = true;
      if(isRightButton(e))
        isRightButtonDown = true;
    }, false);

    canvas.addEventListener("pointermove", function(e) {
      var x = e.offsetX;
      var y = e.offsetY;

      if(isLeftButtonDown) {
        translateX += -(leftActionPosition.x - x) / 250;
        translateY += (leftActionPosition.y - y) / 250;
        leftActionPosition.x = x;
        leftActionPosition.y = y;

      }
      if(isRightButtonDown) {
        angle1 += (rightActionPosition.x - x);
        angle2 += (rightActionPosition.y - y);
        rightActionPosition.x = x;
        rightActionPosition.y = y;
      }
    }, false);

    canvas.addEventListener("pointerup", function(e) {
      endPointerEvent(e);
    }, false);

    canvas.addEventListener("pointerleave", function(e) {
      endPointerEvent(e);
    }, false)

    function endPointerEvent(e) {
      if(isLeftButton(e))
        isLeftButtonDown = false;
      if(isRightButton(e))
        isRightButtonDown = false;
    }

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

    var viewMatrix2 = mat4.create();
    mat4.identity(viewMatrix2);

    var movementMatrix2 = mat4.create();
    mat4.identity(movementMatrix2);

    // mat4.translate(viewMatrix1, viewMatrix1, [0, 0, 0]);
    // mat4.translate(viewMatrix2, viewMatrix2, [0, 0, 0]);

    var oldTime = 0;

    function animate(time) {
      var dAngle = 0.25 * (time - oldTime);

      var tempMovementMatrix1 = mat4.create();
      var tempMovementMatrix2 = mat4.create();

      mat4.translate(tempMovementMatrix1, movementMatrix1, [translateX, translateY, 0]);
      mat4.rotate(tempMovementMatrix1, tempMovementMatrix1, glMatrix.toRadian(angle1), [0, 0, 1]);
      
      mat4.translate(tempMovementMatrix2, movementMatrix2, [translateX, translateY, 0]);
      mat4.rotate(tempMovementMatrix2, tempMovementMatrix2, glMatrix.toRadian(angle2), [0, 0, 1]);


      oldTime = time;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.bindBuffer(gl.ARRAY_BUFFER, arm1Vertex);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm1Faces);
      gl.uniformMatrix4fv(armViewMatrixLocation, false, viewMatrix1);
      gl.uniformMatrix4fv(armMovementMatrixLocation, false, tempMovementMatrix1);
      gl.vertexAttribPointer(armPositionLocation, 2, gl.FLOAT, false, 4*2, 0);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, arm2Vertex);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm2Faces);
      gl.uniformMatrix4fv(armViewMatrixLocation, false, viewMatrix2);
      gl.uniformMatrix4fv(armMovementMatrixLocation, false, tempMovementMatrix2);
      gl.vertexAttribPointer(armPositionLocation, 2, gl.FLOAT, false, 4*2, 0);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

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