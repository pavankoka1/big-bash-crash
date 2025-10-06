import { SimpleVertexShaderSource, SimpleFragmentShaderSource } from '../shaders/simpleShaders';

export class SimpleTestSystem {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private positionLocation: number;
  private resolutionLocation: WebGLUniformLocation | null;
  private centerLocation: WebGLUniformLocation | null;
  private sizeLocation: WebGLUniformLocation | null;
  private colorLocation: WebGLUniformLocation | null;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    console.log("Creating SimpleTestSystem...");

    // Create shaders and program
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, SimpleVertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, SimpleFragmentShaderSource);
    this.program = this.createProgram(vertexShader, fragmentShader);

    // Create buffer for geometry
    this.buffer = this.gl.createBuffer()!;
    this.setupGeometry();

    // Get attribute and uniform locations
    this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.centerLocation = this.gl.getUniformLocation(this.program, 'u_center');
    this.sizeLocation = this.gl.getUniformLocation(this.program, 'u_size');
    this.colorLocation = this.gl.getUniformLocation(this.program, 'u_color');

    console.log("SimpleTestSystem initialized successfully");
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${error}`);
    }

    return shader;
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program linking error: ${error}`);
    }

    return program;
  }

  private setupGeometry(): void {
    // Create a simple quad
    const vertices = new Float32Array([
      -1, -1,  // bottom left
       1, -1,  // bottom right
      -1,  1,  // top left
       1,  1,  // top right
    ]);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  }

  public renderTestRectangles(width: number, height: number): void {
    this.gl.useProgram(this.program);

    // Set up geometry
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Set resolution uniform
    if (this.resolutionLocation) {
      this.gl.uniform2f(this.resolutionLocation, width, height);
    }

    // Render a few test rectangles
    const testRects = [
      { x: width * 0.2, y: height * 0.2, size: 50, color: [1, 0, 0, 1] }, // Red
      { x: width * 0.5, y: height * 0.3, size: 60, color: [0, 1, 0, 1] }, // Green
      { x: width * 0.8, y: height * 0.4, size: 40, color: [0, 0, 1, 1] }, // Blue
      { x: width * 0.3, y: height * 0.6, size: 70, color: [1, 1, 0, 1] }, // Yellow
      { x: width * 0.7, y: height * 0.7, size: 55, color: [1, 0, 1, 1] }, // Magenta
    ];

    testRects.forEach(rect => {
      if (this.centerLocation) {
        this.gl.uniform2f(this.centerLocation, rect.x, rect.y);
      }
      if (this.sizeLocation) {
        this.gl.uniform1f(this.sizeLocation, rect.size);
      }
      if (this.colorLocation) {
        this.gl.uniform4f(this.colorLocation, rect.color[0], rect.color[1], rect.color[2], rect.color[3]);
      }

      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    });

    // Check for WebGL errors
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR) {
      console.error("WebGL error during simple render:", error);
    }
  }

  public destroy(): void {
    this.gl.deleteProgram(this.program);
    this.gl.deleteBuffer(this.buffer);
  }
}
