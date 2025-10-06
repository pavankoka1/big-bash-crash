import {
  SimpleFishFragmentShaderSource,
  SimpleFishVertexShaderSource,
} from "../shaders/simpleFishShaders";
import type {
  FishConfig,
  FishInstance,
  FishUniforms,
  Vec3,
} from "../types/fishTypes";

export class SimpleFishSystem {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private uniforms: FishUniforms;
  private buffer: WebGLBuffer;
  private fish: FishInstance[] = [];
  private time: number = 0;
  private lightPosition: Vec3 = [0, 0, 8000];
  private viewPosition: Vec3 = [0, 0, 10000];
  private nextId: number = 0;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0, 0, 0, 0);

    console.log("Creating SimpleFishSystem...");

    // Create shaders and program
    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      SimpleFishVertexShaderSource
    );
    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      SimpleFishFragmentShaderSource
    );
    this.program = this.createProgram(vertexShader, fragmentShader);

    console.log("Simple fish shaders and program created successfully");

    // Create buffer for fish geometry
    this.buffer = this.gl.createBuffer()!;
    this.setupGeometry();

    // Initialize uniforms
    this.uniforms = this.initUniforms();

    console.log("SimpleFishSystem initialized successfully");
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

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
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
    // Create a simple quad for fish rendering
    const vertices = new Float32Array([
      -1,
      -1, // bottom left
      1,
      -1, // bottom right
      -1,
      1, // top left
      1,
      1, // top right
    ]);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  }

  private initUniforms(): FishUniforms {
    this.gl.useProgram(this.program);

    const getUniformLocation = (name: string) =>
      this.gl.getUniformLocation(this.program, name);

    return {
      centerUniformLocation: getUniformLocation("u_center"),
      radiusUniformLocation: getUniformLocation("u_radius"),
      rotationUniformLocation: getUniformLocation("u_rotation"),
      colorUniformLocation: getUniformLocation("u_color"),
      scaleUniformLocation: getUniformLocation("u_scale"),
      depthUniformLocation: getUniformLocation("u_depth"),
      zPositionUniformLocation: getUniformLocation("u_zPosition"),
      timeUniformLocation: getUniformLocation("u_time"),
      swimPhaseUniformLocation: getUniformLocation("u_swimPhase"),
      lightPositionUniformLocation: getUniformLocation("u_lightPosition"),
      viewPositionUniformLocation: getUniformLocation("u_viewPosition"),
      metallicUniformLocation: getUniformLocation("u_metallic"),
      roughnessUniformLocation: getUniformLocation("u_roughness"),
      useLightingUniformLocation: getUniformLocation("u_useLighting"),
      lightColorUniformLocation: getUniformLocation("u_lightColor"),
    };
  }

  public createFish(config: FishConfig = {}): void {
    const {
      count = 25,
      size = 20,
      speed = 1.0,
      colors = [
        "#49a362",
        "#4a7c59",
        "#5ba85a",
        "#3d8b3d",
        "#2e7d32",
        "#388e3c",
        "#43a047",
        "#4caf50",
      ],
      spawnArea = { x: [0, 1], y: [0.3, 1] },
      behavior = { swimPattern: "linear" },
    } = config;

    console.log("Creating simple fish with config:", {
      count,
      size,
      speed,
      colors: colors.length,
      spawnArea,
      behavior,
    });
    this.fish = [];

    for (let i = 0; i < count; i++) {
      const fish: FishInstance = {
        id: this.nextId++,
        x: spawnArea.x[0] + Math.random() * (spawnArea.x[1] - spawnArea.x[0]), // Start from right edge area
        y: Math.random() * (spawnArea.y[1] - spawnArea.y[0]) + spawnArea.y[0],
        z: Math.random() * 1000 - 500,
        vx: -speed * (0.8 + Math.random() * 1.2), // Move left (negative X)
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.2,
        size: size * (0.7 + Math.random() * 0.6),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: 0,
        swimPhase: Math.random() * Math.PI * 2,
        age: 0,
        maxAge: 10000 + Math.random() * 5000,
        behavior: { ...behavior },
        schoolId:
          behavior.swimPattern === "school" ? Math.floor(i / 5) : undefined,
      };

      this.fish.push(fish);
    }

    console.log(
      "Created simple fish at positions:",
      this.fish.slice(0, 3).map((f) => ({ x: f.x, y: f.y, z: f.z }))
    );
    console.log("Spawn area used:", JSON.stringify(spawnArea));
    console.log(
      "First fish position:",
      this.fish[0]
        ? JSON.stringify({ x: this.fish[0].x, y: this.fish[0].y })
        : "No fish created"
    );
  }

  public update(
    deltaTime: number,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    this.time += deltaTime;

    // Get config values for creating new fish
    const colors = [
      "#49a362",
      "#4a7c59",
      "#5ba85a",
      "#3d8b3d",
      "#2e7d32",
      "#388e3c",
      "#43a047",
      "#4caf50",
      "#66bb6a",
      "#81c784",
    ];
    const size = 80; // Match the config
    const speed = 0.5; // Match the config
    const behavior = { swimPattern: "sinusoidal" as const };

    this.fish.forEach((fish, index) => {
      // Debug first fish position every 60 frames (about once per second)
      if (index === 0 && Math.floor(this.time / 1000) % 1 === 0) {
        console.log(
          `Fish 0 position: x=${fish.x.toFixed(1)}, y=${fish.y.toFixed(
            1
          )}, vx=${fish.vx.toFixed(2)}`
        );
      }

      // Update age
      fish.age += deltaTime;

      // Remove old fish
      if (fish.age > fish.maxAge) {
        this.fish.splice(index, 1);
        return;
      }

      // Update position
      fish.x += fish.vx * deltaTime * 0.1;
      fish.y += fish.vy * deltaTime * 0.1;
      fish.z += fish.vz * deltaTime * 0.1;

      // Update rotation based on movement
      fish.rotation = Math.atan2(fish.vy, fish.vx);

      // Update swim phase
      fish.swimPhase += deltaTime * 0.01;

      // Apply behavior
      this.applyBehavior(fish, deltaTime);

      // Remove fish when they reach the left edge and create new ones
      if (fish.x < -fish.size * 2) {
        // Remove this fish
        this.fish.splice(index, 1);

        // Create a new fish from the right edge
        const newFish: FishInstance = {
          id: this.nextId++,
          x: canvasWidth + Math.random() * 100, // Start from right edge
          y: Math.random() * canvasHeight * 0.7 + canvasHeight * 0.3,
          z: Math.random() * 1000 - 500,
          vx: -speed * (0.8 + Math.random() * 1.2), // Move left
          vy: (Math.random() - 0.5) * 0.3,
          vz: (Math.random() - 0.5) * 0.2,
          size: size * (0.7 + Math.random() * 0.6),
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: 0,
          swimPhase: Math.random() * Math.PI * 2,
          age: 0,
          maxAge: 10000 + Math.random() * 5000,
          behavior: { ...behavior },
          schoolId: undefined, // No schooling for now
        };

        // Add the new fish
        this.fish.push(newFish);
        return; // Skip the rest of the update for this iteration
      }

      // Keep fish in water area
      if (fish.y < canvasHeight * 0.3) {
        fish.y = canvasHeight * 0.3;
        fish.vy = Math.abs(fish.vy);
      }
      if (fish.y > canvasHeight * 0.95) {
        fish.y = canvasHeight * 0.95;
        fish.vy = -Math.abs(fish.vy);
      }
    });
  }

  private applyBehavior(fish: FishInstance, deltaTime: number): void {
    const { behavior } = fish;

    switch (behavior.swimPattern) {
      case "sinusoidal":
        fish.vy = Math.sin(this.time * 0.002 + fish.swimPhase) * 0.5;
        break;

      case "school":
        this.applySchoolBehavior(fish);
        break;

      case "linear":
      default:
        // Linear movement - no additional behavior
        break;
    }
  }

  private applySchoolBehavior(fish: FishInstance): void {
    if (fish.schoolId === undefined) return;

    const schoolMates = this.fish.filter(
      (f) => f.schoolId === fish.schoolId && f.id !== fish.id
    );
    if (schoolMates.length === 0) return;

    const cohesion = fish.behavior.schoolCohesion || 0.1;
    const separation = fish.behavior.schoolSeparation || 0.2;
    const alignment = fish.behavior.schoolAlignment || 0.1;

    // Cohesion: move towards center of school
    let centerX = 0,
      centerY = 0;
    schoolMates.forEach((mate) => {
      centerX += mate.x;
      centerY += mate.y;
    });
    centerX /= schoolMates.length;
    centerY /= schoolMates.length;

    const cohesionForceX = (centerX - fish.x) * cohesion;
    const cohesionForceY = (centerY - fish.y) * cohesion;

    // Separation: avoid crowding
    let separationForceX = 0,
      separationForceY = 0;
    schoolMates.forEach((mate) => {
      const dx = fish.x - mate.x;
      const dy = fish.y - mate.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < fish.size * 2) {
        separationForceX += dx / distance;
        separationForceY += dy / distance;
      }
    });

    // Alignment: match velocity of school
    let avgVx = 0,
      avgVy = 0;
    schoolMates.forEach((mate) => {
      avgVx += mate.vx;
      avgVy += mate.vy;
    });
    avgVx /= schoolMates.length;
    avgVy /= schoolMates.length;

    const alignmentForceX = (avgVx - fish.vx) * alignment;
    const alignmentForceY = (avgVy - fish.vy) * alignment;

    // Apply forces
    fish.vx += cohesionForceX + separationForceX * separation + alignmentForceX;
    fish.vy += cohesionForceY + separationForceY * separation + alignmentForceY;

    // Limit speed
    const maxSpeed = fish.behavior.maxSpeed || 2.0;
    const speed = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
    if (speed > maxSpeed) {
      fish.vx = (fish.vx / speed) * maxSpeed;
      fish.vy = (fish.vy / speed) * maxSpeed;
    }
  }

  public render(): void {
    this.gl.useProgram(this.program);

    // Set up geometry
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    const positionLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Set common uniforms
    this.setCommonUniforms();

    // Render each fish
    if (this.fish.length === 0) {
      console.log("No simple fish to render");
      return;
    }

    this.fish.forEach((fish, index) => {
      // Debug first 3 fish (disabled to reduce console spam)
      if (index < 3) {
        console.log(
          `Rendering simple fish ${index}:`,
          JSON.stringify({
            x: fish.x,
            y: fish.y,
            size: fish.size,
            color: fish.color,
          })
        );
      }
      this.renderFish(fish);
    });

    // Check for WebGL errors
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR) {
      console.error("WebGL error during simple fish render:", error);
    }
  }

  private setCommonUniforms(): void {
    const { uniforms } = this;

    // Set resolution uniform
    const resolutionUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_resolution"
    );
    if (resolutionUniformLocation) {
      this.gl.uniform2f(
        resolutionUniformLocation,
        this.gl.canvas.width,
        this.gl.canvas.height
      );
    }

    if (uniforms.timeUniformLocation) {
      this.gl.uniform1f(uniforms.timeUniformLocation, this.time);
    }
    if (uniforms.lightPositionUniformLocation) {
      this.gl.uniform3f(
        uniforms.lightPositionUniformLocation,
        this.lightPosition[0],
        this.lightPosition[1],
        this.lightPosition[2]
      );
    }
    if (uniforms.viewPositionUniformLocation) {
      this.gl.uniform3f(
        uniforms.viewPositionUniformLocation,
        this.viewPosition[0],
        this.viewPosition[1],
        this.viewPosition[2]
      );
    }
    if (uniforms.useLightingUniformLocation) {
      this.gl.uniform1f(uniforms.useLightingUniformLocation, 1.0);
    }
    if (uniforms.lightColorUniformLocation) {
      this.gl.uniform3f(uniforms.lightColorUniformLocation, 1.0, 1.0, 1.0);
    }
  }

  private renderFish(fish: FishInstance): void {
    const { uniforms } = this;

    // Convert color to RGBA
    const color = this.hexToRgba(fish.color);

    // Debug: Log the first fish's uniforms (disabled to reduce console spam)
    // if (fish.id === 0) {
    //   console.log("Setting uniforms for fish 0:", {
    //     x: fish.x,
    //     y: fish.y,
    //     size: fish.size,
    //     color: color,
    //     centerUniform: uniforms.centerUniformLocation,
    //     radiusUniform: uniforms.radiusUniformLocation,
    //     colorUniform: uniforms.colorUniformLocation,
    //   });
    // }

    // Set fish-specific uniforms
    if (uniforms.centerUniformLocation) {
      this.gl.uniform2f(uniforms.centerUniformLocation, fish.x, fish.y);
    }
    if (uniforms.radiusUniformLocation) {
      this.gl.uniform1f(uniforms.radiusUniformLocation, fish.size);
    }
    if (uniforms.rotationUniformLocation) {
      this.gl.uniform1f(uniforms.rotationUniformLocation, fish.rotation);
    }
    if (uniforms.colorUniformLocation) {
      this.gl.uniform4f(
        uniforms.colorUniformLocation,
        color.r,
        color.g,
        color.b,
        color.a
      );
    }
    if (uniforms.scaleUniformLocation) {
      this.gl.uniform2f(uniforms.scaleUniformLocation, 1.0, 1.0);
    }
    if (uniforms.depthUniformLocation) {
      this.gl.uniform1f(uniforms.depthUniformLocation, fish.size * 0.3);
    }
    if (uniforms.zPositionUniformLocation) {
      this.gl.uniform1f(uniforms.zPositionUniformLocation, fish.z);
    }
    if (uniforms.swimPhaseUniformLocation) {
      this.gl.uniform1f(uniforms.swimPhaseUniformLocation, fish.swimPhase);
    }
    if (uniforms.metallicUniformLocation) {
      this.gl.uniform1f(uniforms.metallicUniformLocation, 0.1);
    }
    if (uniforms.roughnessUniformLocation) {
      this.gl.uniform1f(uniforms.roughnessUniformLocation, 0.8);
    }

    // Draw the fish
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    // Debug: Check for WebGL errors after drawing
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR) {
      console.error("WebGL error after drawing fish:", error);
    }
  }

  private hexToRgba(hex: string): {
    r: number;
    g: number;
    b: number;
    a: number;
  } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
          a: 1.0,
        }
      : { r: 0, g: 0, b: 0, a: 1.0 };
  }

  public resize(width: number, height: number): void {
    this.gl.viewport(0, 0, width, height);
    this.gl.useProgram(this.program);
    const resolutionUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_resolution"
    );
    if (resolutionUniformLocation) {
      this.gl.uniform2f(resolutionUniformLocation, width, height);
      console.log("Set resolution uniform:", width, height);
    } else {
      console.error("Resolution uniform not found!");
    }
  }

  public destroy(): void {
    this.gl.deleteProgram(this.program);
    this.gl.deleteBuffer(this.buffer);
  }
}
