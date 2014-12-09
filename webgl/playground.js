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
var Playground;
(function (Playground) {
    "use strict";
    var shaderVertexSource = "\n\
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
    var shaderFragmentSource = "\n\
precision mediump float;\n\
varying vec3 vColor;\n\
\n\
void main(void) {\n\
gl_FragColor = vec4(vColor, 1.0);\n\
}";
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
        var triangleVertexBuffer = [
            -1,
            -1,
            0,
            0,
            0,
            1,
            1,
            -1,
            0,
            1,
            1,
            0,
            1,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            0,
            0,
            0,
            1,
            -1,
            1,
            0,
            1,
            1,
            0,
            -1,
            -1,
            0,
            0,
            0,
            1
        ];
        var triangleVertex = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexBuffer), gl.STATIC_DRAW);
        var triangleFacesBuffer = [0, 1, 2, 3, 4, 5];
        var triangleFaces = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleFaces);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleFacesBuffer), gl.STATIC_DRAW);
        var projectionMatrix = MathUtils.getProjecton(40, canvas.width / canvas.height, 1, 100);
        var movementMatrix = MathUtils.getIdentity4();
        var vMatrix = MathUtils.getIdentity4();
        MathUtils.translateZ(vMatrix, -5);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearDepth(1.0);
        var oldTime = 0;
        function animate(time) {
            var angleDiff = 2 * Math.sin((time % 60) / 800);
            MathUtils.rotateY(movementMatrix, angleDiff);
            oldTime = time;
            gl.viewport(0.0, 0.0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
            gl.uniformMatrix4fv(movementMatrixLocation, false, movementMatrix);
            gl.uniformMatrix4fv(vMatrixLocaltion, false, vMatrix);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4 * (3 + 3), 0);
            gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 4 * (3 + 3), 3 * 4);
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertex);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleFaces);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            gl.flush();
            window.requestAnimationFrame(animate);
        }
        animate(0);
    }
})(Playground || (Playground = {}));
