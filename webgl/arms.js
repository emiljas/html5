var GLUtils = (function () {
    function GLUtils(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.initContext();
    }
    GLUtils.prototype.initContext = function () {
        this.gl = this.canvas.getContext("webgl", { antialias: true });
        if (this.gl)
            console.log("webgl supported");
        else {
            this.gl = this.canvas.getContext("experimental-webgl", { antialias: true });
            if (this.gl)
                console.log("experimental webgl supported");
            else
                console.log("webgl is NOT supported");
        }
    };
    GLUtils.prototype.getCanvas = function () {
        return this.canvas;
    };
    GLUtils.prototype.getContext = function () {
        return this.gl;
    };
    GLUtils.prototype.getShader = function (source, type) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
    GLUtils.prototype.useProgram = function (vertexShaderSource, fragmentShaderSource) {
        var vertexShader = this.getShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        var fragmentShader = this.getShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        this.gl.useProgram(program);
        return program;
    };
    return GLUtils;
})();
var MathUtils = (function () {
    function MathUtils() {
    }
    MathUtils.degToRad = function (angle) {
        return angle * Math.PI / 180;
    };
    MathUtils.getProjecton = function (angle, a, zMin, zMax) {
        var tan = Math.tan(MathUtils.degToRad(0.5 * angle));
        var A = (-1 * zMax * zMin) / (zMax - zMin);
        var B = (-2 * zMax * zMin) / (zMax - zMin);
        return [
            0.5 / tan,
            0,
            0,
            0,
            0,
            0.5 * a / tan,
            0,
            0,
            0,
            0,
            A,
            -1,
            0,
            0,
            B,
            0,
        ];
    };
    MathUtils.getIdentity4 = function () {
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    };
    MathUtils.rotateX = function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv1 = m[1], mv5 = m[5], mv9 = m[9];
        m[1] = m[1] * c - m[2] * s;
        m[5] = m[5] * c - m[6] * s;
        m[9] = m[9] * c - m[10] * s;
        m[2] = m[2] * c + mv1 * s;
        m[6] = m[6] * c + mv5 * s;
        m[10] = m[10] * c + mv9 * s;
    };
    MathUtils.rotateY = function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c * m[0] + s * m[2];
        m[4] = c * m[4] + s * m[6];
        m[8] = c * m[8] + s * m[10];
        m[2] = c * m[2] - s * mv0;
        m[6] = c * m[6] - s * mv4;
        m[10] = c * m[10] - s * mv8;
    };
    MathUtils.rotateZ = function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c * m[0] - s * m[1];
        m[4] = c * m[4] - s * m[5];
        m[8] = c * m[8] - s * m[9];
        m[1] = c * m[1] + s * mv0;
        m[5] = c * m[5] + s * mv4;
        m[9] = c * m[9] + s * mv8;
    };
    MathUtils.translateZ = function (m, t) {
        m[14] += t;
    };
    return MathUtils;
})();
var Arms;
(function (Arms) {
    "use strict";
    var canvasId = "canvas";
    var utils;
    var canvas;
    var gl;
    window.addEventListener("load", function () {
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
    var armPositionLocation;
    var armViewMatrixLocation;
    var armMovementMatrixLocation;
    var greaterD = 0.09;
    var smallerD = 0.05;
    var arm1L = 0.9;
    var arm1VertexBuffer = [
        -greaterD,
        -smallerD,
        arm1L - greaterD,
        -smallerD,
        arm1L - greaterD,
        smallerD,
        -greaterD,
        smallerD,
    ];
    var arm1FacesBuffer = [0, 1, 2, 2, 3, 0];
    var arm2L = 0.75;
    var arm2VertexBuffer = [
        -smallerD,
        -greaterD,
        smallerD,
        -greaterD,
        smallerD,
        arm2L - greaterD,
        -smallerD,
        arm2L - greaterD,
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
        canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };
        canvas.addEventListener("pointerdown", function (e) {
            leftActionPosition = { x: e.offsetX, y: e.offsetY };
            if (isLeftButton(e))
                isLeftButtonDown = true;
            if (isRightButton(e))
                isRightButtonDown = true;
        }, false);
        canvas.addEventListener("pointermove", function (e) {
            var x = e.offsetX;
            var y = e.offsetY;
            if (isLeftButtonDown) {
                translateX += -(leftActionPosition.x - x) / 250;
                translateY += (leftActionPosition.y - y) / 250;
                leftActionPosition.x = x;
                leftActionPosition.y = y;
            }
            if (isRightButtonDown) {
                angle1 += (rightActionPosition.x - x);
                angle2 += (rightActionPosition.y - y);
                rightActionPosition.x = x;
                rightActionPosition.y = y;
            }
        }, false);
        canvas.addEventListener("pointerup", function (e) {
            endPointerEvent(e);
        }, false);
        canvas.addEventListener("pointerleave", function (e) {
            endPointerEvent(e);
        }, false);
        function endPointerEvent(e) {
            if (isLeftButton(e))
                isLeftButtonDown = false;
            if (isRightButton(e))
                isRightButtonDown = false;
        }
        function isLeftButton(e) {
            return e.button === 0;
        }
        function isRightButton(e) {
            return e.button === 2;
        }
        initShaders();
        var arm1Vertex = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, arm1Vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arm1VertexBuffer), gl.STATIC_DRAW);
        var arm1Faces = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm1Faces);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arm1FacesBuffer), gl.STATIC_DRAW);
        var arm2Vertex = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, arm2Vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arm2VertexBuffer), gl.STATIC_DRAW);
        var arm2Faces = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm2Faces);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arm2FacesBuffer), gl.STATIC_DRAW);
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
            gl.vertexAttribPointer(armPositionLocation, 2, gl.FLOAT, false, 4 * 2, 0);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, arm2Vertex);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm2Faces);
            gl.uniformMatrix4fv(armViewMatrixLocation, false, viewMatrix2);
            gl.uniformMatrix4fv(armMovementMatrixLocation, false, tempMovementMatrix2);
            gl.vertexAttribPointer(armPositionLocation, 2, gl.FLOAT, false, 4 * 2, 0);
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
})(Arms || (Arms = {}));
