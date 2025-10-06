export interface FishConfig {
  count?: number;
  size?: number;
  speed?: number;
  colors?: string[];
  spawnArea?: {
    x: [number, number];
    y: [number, number];
  };
  behavior?: FishBehavior;
}

export interface FishBehavior {
  swimPattern?: 'linear' | 'sinusoidal' | 'school';
  schoolSize?: number;
  schoolCohesion?: number;
  schoolSeparation?: number;
  schoolAlignment?: number;
  maxSpeed?: number;
  acceleration?: number;
}

export interface FishInstance {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  rotation: number;
  swimPhase: number;
  age: number;
  maxAge: number;
  behavior: FishBehavior;
  schoolId?: number;
}

export interface FishUniforms {
  centerUniformLocation: WebGLUniformLocation | null;
  radiusUniformLocation: WebGLUniformLocation | null;
  rotationUniformLocation: WebGLUniformLocation | null;
  colorUniformLocation: WebGLUniformLocation | null;
  scaleUniformLocation: WebGLUniformLocation | null;
  depthUniformLocation: WebGLUniformLocation | null;
  zPositionUniformLocation: WebGLUniformLocation | null;
  timeUniformLocation: WebGLUniformLocation | null;
  swimPhaseUniformLocation: WebGLUniformLocation | null;
  lightPositionUniformLocation: WebGLUniformLocation | null;
  viewPositionUniformLocation: WebGLUniformLocation | null;
  metallicUniformLocation: WebGLUniformLocation | null;
  roughnessUniformLocation: WebGLUniformLocation | null;
  useLightingUniformLocation: WebGLUniformLocation | null;
  lightColorUniformLocation: WebGLUniformLocation | null;
}

export interface FishRenderState {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  uniforms: FishUniforms;
  buffer: WebGLBuffer;
  lightPosition: [number, number, number];
  viewPosition: [number, number, number];
  time: number;
}

export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
