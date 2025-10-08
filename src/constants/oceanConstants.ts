// Ocean Scene Constants
export const OCEAN_CONFIG = {
  // Canvas and rendering
  CANVAS: {
    FISH_SPAWN_INTERVAL: 1000, // ms - balanced fish spawn rate
    WAVE_DAMPING: 0.08,
    BOAT_HOVER_DAMPING: 0.15,
    FISH_COUNT_INITIAL: 5, // balanced initial fish count
    MAX_FISH_ATTEMPTS: 10,
  },

  // Sky and water colors
  COLORS: {
    SKY_TOP: "#E2ECEB",
    SKY_BOTTOM: "#B0E0E6",
    WATER_TOP: "#015482",
    WATER_MID: "#006994",
    WATER_BOTTOM: "#2E8B57",
    WAVE_TOP: "rgba(1, 84, 130, 0.8)",
    WAVE_MID: "rgba(1, 84, 130, 0.6)",
    WAVE_BOTTOM: "rgba(1, 84, 130, 0.4)",
    WAVE_SUBTLE: "rgba(1, 84, 130, 0.3)",
    WAVE_FADE: "rgba(1, 84, 130, 0)",
    ATMOSPHERIC_WAVE: "#015482",
    FISH_FALLBACK: "#FF6B6B",
    NET_COLOR: "#F5DEB3",
    NET_STROKE: "#654321",
    BOAT_SHADOW: "#2F4F4F",
    SMOKE: "#333333",
    TEXT: "#FFFFFF",
    TEXT_STROKE: "#000000",
  },

  // Layout percentages
  LAYOUT: {
    SKY_HEIGHT_RATIO: 0.4,
    WATER_HEIGHT_RATIO: 0.6,
    BOAT_WIDTH_RATIO: 0.25,
    BOAT_HEIGHT_RATIO: 0.5,
    BOAT_Y_RATIO: 0.42,
    NET_WIDTH_RATIO: 0.6,
    NET_HEIGHT_RATIO: 0.3,
    NET_X_OFFSET_RATIO: -0.2,
    NET_Y_RATIO: 0.55,
    NET_VERTEX_X_RATIO: 0.75,
  },

  // Fish properties
  FISH: {
    SIZE_MIN_RATIO: 0.02,
    SIZE_MAX_RATIO: 0.04,
    SPEED_MIN: 2.5, // increased for better gameplay
    SPEED_MAX: 4.5, // increased for better gameplay
    OPACITY_MIN: 0.6,
    OPACITY_MAX: 1.0,
    SPAWN_OFFSET: 100,
    MIN_DISTANCE_MULTIPLIER: 2,
    BLUR_INTENSITY: 3,
    TRAP_DETECTION_RADIUS: 25,
    TRAP_SPEED_MULTIPLIER: 0.8,
    TRAP_VERTICAL_SPEED_MULTIPLIER: 0.4,
    CAUGHT_SIZE_MULTIPLIER: 0.8,
    CAUGHT_OPACITY_MULTIPLIER: 0.9,
    STACK_SPACING_X: 6,
    STACK_SPACING_Y: 4,
    STACK_OFFSET_X: 5,
    STACK_OFFSET_Y: 2,
    ESCAPE_PREVENTION_OFFSET: 5,
    RIGHT_CORNER_THRESHOLD: 30,
  },

  // Wave properties
  WAVES: {
    COUNT: 3,
    AMPLITUDE_MIN: 8,
    AMPLITUDE_MAX: 20,
    FREQUENCY_MIN: 0.01,
    FREQUENCY_MAX: 0.03,
    LAYER_1_AMPLITUDE: 40,
    LAYER_1_FREQUENCY: 0.08,
    LAYER_1_SPEED: 0.015,
    LAYER_2_AMPLITUDE: 25,
    LAYER_2_FREQUENCY: 0.12,
    LAYER_2_SPEED: 0.02,
    LAYER_3_AMPLITUDE: 15,
    LAYER_3_FREQUENCY: 0.18,
    LAYER_3_SPEED: 0.025,
    ATMOSPHERIC_COUNT: 2,
    ATMOSPHERIC_AMPLITUDE: 12,
    ATMOSPHERIC_FREQUENCY: 0.0075,
    ATMOSPHERIC_SPEED: 0.003,
    ATMOSPHERIC_ALPHA: 0.1,
    NET_HORIZONTAL_AMPLITUDE: 15,
    NET_VERTICAL_AMPLITUDE: 8,
    NET_HORIZONTAL_FREQUENCY: 0.005,
    NET_VERTICAL_FREQUENCY: 0.008,
  },

  // Net properties
  NET: {
    LINE_SPACING: 6, // increased for better performance
    LINE_WIDTH: 1,
    STROKE_WIDTH: 3,
    POLE_WIDTH: 4,
    ALPHA: 0.4,
    WAVE_DISTORTION_AMPLITUDE: 2, // reduced for better performance
    WAVE_DISTORTION_FREQUENCY_X: 0.02,
    WAVE_DISTORTION_FREQUENCY_Y: 0.03,
    WAVE_DISTORTION_SPEED_X: 0.008,
    WAVE_DISTORTION_SPEED_Y: 0.005,
  },

  // Smoke effect
  SMOKE: {
    PARTICLE_COUNT: 75, // 5x more particles (15 * 5)
    LIFE_MIN: 80,
    LIFE_MAX: 120,
    SIZE_MIN: 3,
    SIZE_MAX: 8,
    VELOCITY_X_RANGE: 1.0, // increased for wind effect
    VELOCITY_Y_MIN: 0.8,
    VELOCITY_Y_MAX: 3.0,
    SPREAD: 15, // increased spread
    ALPHA: 0.7,
    EXPANSION_RATE: 0.02, // particles grow as they rise
    WIND_EFFECT: 0.3, // wind pushes particles sideways
  },

  // Boat properties
  BOAT: {
    SHADOW_OFFSET_X: -12,
    SHADOW_OFFSET_Y: 5,
    SHADOW_WIDTH_RATIO: 0.5,
    SHADOW_HEIGHT_RATIO: 0.15,
    SHADOW_ALPHA: 0.25,
    SUBMERGED_HEIGHT_RATIO: 0.1,
    WATER_MASK_ALPHA: 0.3,
  },

  // UI properties
  UI: {
    FONT_SIZE: 32,
    FONT_FAMILY: "bold Arial",
    TEXT_OFFSET_X: 30,
    TEXT_OFFSET_Y: 50,
    STROKE_WIDTH: 3,
  },
} as const;

// Animation timing constants
export const ANIMATION_TIMING = {
  WAVE_SPEED: 0.015,
  ATMOSPHERIC_SPEED: 0.003,
  NET_WAVE_SPEED: 0.01,
  FISH_BLUR_SPEED: 0.01,
} as const;

// Game timing constants
export const GAME_TIMING = {
  GAME_DURATION_MIN: 15, // seconds
  GAME_DURATION_MAX: 20, // seconds
  DETACHMENT_DURATION: 3000, // ms - 3 seconds for net detachment animation
  TARGET_FPS: 60, // Target FPS for frame rate normalization
} as const;

// Wave calculation helpers
export const WAVE_CALCULATIONS = {
  ATMOSPHERIC: {
    Y_OFFSET_RATIO: 0.1,
    VERTICAL_SPACING: 20,
    WAVE_OFFSET_RANGE: 100,
  },
  OCEAN: {
    LAYER_2_AMPLITUDE: 30,
    LAYER_2_FREQUENCY: 0.06,
    LAYER_2_SPEED: 0.012,
    LAYER_3_AMPLITUDE: 20,
    LAYER_3_FREQUENCY: 0.04,
    LAYER_3_SPEED: 0.008,
  },
} as const;
