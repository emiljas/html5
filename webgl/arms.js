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
    var arm1VertexBuffer = [
        0.25,
        0.0,
        0.75,
        0.0,
        0.75,
        1.0,
        0.25,
        1.0,
    ];
    var arm1FacesBuffer = [0, 1, 2, 2, 3, 0];
    var arm1PositionLocation;
    var arm1ProjectionMatrixLocation;
    var arm1ViewMatrixLocation;
    var arm1MovementMatrixLocation;
    var arm2VertexBuffer = [
        -1.0,
        -1.0,
        -0.7,
        -1.0,
        -1.0,
        -0.7,
    ];
    var arm2FacesBuffer = [0, 1, 2];
    var arm2PositionLocation;
    function main() {
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
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, glMatrix.toRadian(40), canvas.width / canvas.height, 1, 100);
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
            gl.bindBuffer(gl.ARRAY_BUFFER, arm1Vertex);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm1Faces);
            gl.uniformMatrix4fv(arm1ProjectionMatrixLocation, false, projectionMatrix);
            gl.uniformMatrix4fv(arm1ViewMatrixLocation, false, viewMatrix);
            gl.uniformMatrix4fv(arm1MovementMatrixLocation, false, movementMatrix);
            gl.vertexAttribPointer(arm1PositionLocation, 2, gl.FLOAT, false, 4 * 2, 0);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, arm2Vertex);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arm2Faces);
            gl.uniformMatrix4fv(arm1ProjectionMatrixLocation, false, projectionMatrix);
            gl.uniformMatrix4fv(arm1ViewMatrixLocation, false, viewMatrix);
            gl.uniformMatrix4fv(arm1MovementMatrixLocation, false, movementMatrix);
            gl.vertexAttribPointer(arm2PositionLocation, 2, gl.FLOAT, false, 4 * 2, 0);
            gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
            gl.flush();
            window.requestAnimationFrame(animate);
        }
        animate(0);
    }
    function initShaders() {
        initArm1Shader();
    }
    function initArm1Shader() {
        var program = utils.useProgram(vertexShaderSource, fragmentShaderSource);
        arm1PositionLocation = gl.getAttribLocation(program, "aPosition");
        arm1ProjectionMatrixLocation = gl.getUniformLocation(program, "uProjectionMatrix");
        arm1ViewMatrixLocation = gl.getUniformLocation(program, "uViewMatrix");
        arm1MovementMatrixLocation = gl.getUniformLocation(program, "uMovementMatrix");
        gl.enableVertexAttribArray(arm1PositionLocation);
    }
})(Arms || (Arms = {}));
