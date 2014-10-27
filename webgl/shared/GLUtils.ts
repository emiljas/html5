class GLUtils {
  "use strict";

  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;

  constructor(
    canvasId: string
    ) {
    this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
    this.initContext();
  }

  private initContext() {
    this.gl = this.canvas.getContext("webgl", {antialias: true});
    if(this.gl)
      console.log("webgl supported");
    else {
      this.gl  = this.canvas.getContext("experimental-webgl", {antialias: true});

      if(this.gl)
        console.log("experimental webgl supported");
      else
        console.log("webgl is NOT supported");
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getContext(): WebGLRenderingContext {
    return this.gl;
  }

  public getShader(source: string, type: number): WebGLShader {
    var shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  public useProgram(vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram {
    var vertexShader = this.getShader(vertexShaderSource, this.gl.VERTEX_SHADER);
    var fragmentShader = this.getShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);

    var program = this.gl.createProgram();

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);

    this.gl.linkProgram(program);
    this.gl.useProgram(program);

    return program;
  }
}