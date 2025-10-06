// Core WebGL Types
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
export type Mat4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

// Game Object Types
export interface GameObject {
  id: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  velocity: Vec3;
  active: boolean;
}

export interface RenderableObject extends GameObject {
  vertices: Float32Array;
  indices?: Uint16Array;
  colors?: Float32Array;
  normals?: Float32Array;
  texCoords?: Float32Array;
  textureCoords?: Float32Array;
  shaderProgram: WebGLProgram;
}

// Fish System Types
export interface Fish extends GameObject {
  species: FishSpecies;
  swimSpeed: number;
  swimDirection: Vec3;
  caught: boolean;
  size: number;
  color: Vec4;
}

export enum FishSpecies {
  BASS = "bass",
  TROUT = "trout",
  CATFISH = "catfish",
  PIKE = "pike",
}

// Net System Types
export interface Net extends GameObject {
  deployed: boolean;
  deploymentTime: number;
  maxDepth: number;
  currentDepth: number;
  tension: number; // 0-1, affects wave animation
  fishCount: number;
  isDragging: boolean;
}

// Boat System Types
export interface Boat extends GameObject {
  speed: number;
  direction: Vec3;
  waterSprayParticles: WaterParticle[];
}

export interface Fisherman extends GameObject {
  casting: boolean;
  castingProgress: number;
}

// Particle System Types
export interface WaterParticle extends GameObject {
  life: number;
  maxLife: number;
  size: number;
}

export interface SmokeParticle extends GameObject {
  life: number;
  maxLife: number;
  size: number;
  color: Vec4;
}

export interface DustParticle extends GameObject {
  life: number;
  maxLife: number;
  size: number;
  color: Vec4;
}

// Shader Types
export interface ShaderProgram {
  program: WebGLProgram;
  attributeLocations: Record<string, number>;
  uniformLocations: Record<string, WebGLUniformLocation | null>;
}

// Game State Types
export interface GameState {
  running: boolean;
  paused: boolean;
  score: number;
  timeRemaining: number;
  netDeployed: boolean;
  fishCaught: number;
  currentRound: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  fps: number;
  oceanDepth: number;
  boatSpeed: number;
  fishCount: number;
  netDepth: number;
  roundTime: number; // in seconds
}

// Animation Types
export interface AnimationState {
  time: number;
  deltaTime: number;
  frameCount: number;
}

// UI Types
export interface BettingTimer {
  active: boolean;
  timeRemaining: number;
  currentBet: number;
  multiplier: number;
}

// Color definitions (normalized 0-1)
export const FISH_COLORS = {
  [FishSpecies.BASS]: [0.29, 0.38, 0.27, 1.0], // #49a362 in RGB
  [FishSpecies.TROUT]: [0.45, 0.55, 0.65, 1.0], // Silver trout
  [FishSpecies.CATFISH]: [0.35, 0.25, 0.15, 1.0], // Brown catfish
  [FishSpecies.PIKE]: [0.25, 0.35, 0.45, 1.0], // Blue pike
} as const;

export const NET_COLORS = {
  NET: [0.4, 0.4, 0.4, 1.0], // Grey net
  FINISHING: [0.4, 0.2, 0.0, 1.0], // Brown finishing
} as const;

export const BOAT_COLORS = {
  WOOD: [0.4, 0.2, 0.0, 1.0], // Brown wood
  FISHERMAN_CLOTHES: [0.2, 0.3, 0.6, 1.0], // Blue clothes
  FISHERMAN_SKIN: [0.8, 0.6, 0.4, 1.0], // Skin tone
} as const;

export const OCEAN_COLORS = {
  SHALLOW: [0.4, 0.8, 0.9, 1.0], // Light blue-green
  DEEP: [0.0, 0.2, 0.5, 1.0], // Ocean blue
  FOAM: [0.9, 0.9, 0.9, 1.0], // White foam
} as const;
