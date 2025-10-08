import { OCEAN_CONFIG, WAVE_CALCULATIONS } from "../constants/oceanConstants";

// Static counter for fish IDs
let fishIdCounter = 0;

export interface Fish {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  waveOffset: number;
  caughtTime?: number;
  isBlurred?: boolean;
  isBeingTrapped?: boolean;
  targetTrapPosition?: { x: number; y: number };
  swimPhase?: number;
  caughtPosition?: {
    x: number;
    y: number;
    caughtTime: number;
  };
}

export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  initialSize: number;
  windEffect: number;
}

export interface Wave {
  x: number;
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

// Sky and atmospheric effects
export const drawSky = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  skyHeight: number
) => {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, skyHeight);
  skyGradient.addColorStop(0, OCEAN_CONFIG.COLORS.SKY_TOP);
  skyGradient.addColorStop(0.4, OCEAN_CONFIG.COLORS.SKY_BOTTOM);

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvasWidth, skyHeight);
};

export const drawAtmosphericWaves = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  skyHeight: number,
  currentTime: number
) => {
  ctx.save();
  ctx.globalAlpha = OCEAN_CONFIG.WAVES.ATMOSPHERIC_ALPHA;
  ctx.fillStyle = OCEAN_CONFIG.COLORS.ATMOSPHERIC_WAVE;

  for (let i = 0; i < OCEAN_CONFIG.WAVES.ATMOSPHERIC_COUNT; i++) {
    const waveY =
      skyHeight * WAVE_CALCULATIONS.ATMOSPHERIC.Y_OFFSET_RATIO +
      i * WAVE_CALCULATIONS.ATMOSPHERIC.VERTICAL_SPACING;
    const waveOffset =
      ((currentTime * 0.0001 + i * 100) %
        (canvasWidth + WAVE_CALCULATIONS.ATMOSPHERIC.WAVE_OFFSET_RANGE)) -
      50;

    ctx.beginPath();
    ctx.moveTo(0, waveY);

    for (let x = 0; x < canvasWidth; x++) {
      const y =
        waveY +
        OCEAN_CONFIG.WAVES.ATMOSPHERIC_AMPLITUDE *
          Math.sin(
            (x + waveOffset) * OCEAN_CONFIG.WAVES.ATMOSPHERIC_FREQUENCY +
              currentTime * OCEAN_CONFIG.WAVES.ATMOSPHERIC_SPEED
          ) +
        (OCEAN_CONFIG.WAVES.ATMOSPHERIC_AMPLITUDE / 2) *
          Math.sin(
            (x + waveOffset) *
              (OCEAN_CONFIG.WAVES.ATMOSPHERIC_FREQUENCY * 1.6) +
              currentTime * (OCEAN_CONFIG.WAVES.ATMOSPHERIC_SPEED * 1.33)
          ) +
        (OCEAN_CONFIG.WAVES.ATMOSPHERIC_AMPLITUDE / 4) *
          Math.sin(
            (x + waveOffset) *
              (OCEAN_CONFIG.WAVES.ATMOSPHERIC_FREQUENCY * 2.67) +
              currentTime * (OCEAN_CONFIG.WAVES.ATMOSPHERIC_SPEED * 1.67)
          );
      ctx.lineTo(x, y);
    }

    ctx.lineTo(canvasWidth, skyHeight);
    ctx.lineTo(0, skyHeight);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
};

// Ocean water and waves
export const drawOcean = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  skyHeight: number,
  waterHeight: number
) => {
  const waterGradient = ctx.createLinearGradient(
    0,
    skyHeight,
    0,
    skyHeight + waterHeight
  );
  waterGradient.addColorStop(0, OCEAN_CONFIG.COLORS.WATER_TOP);
  waterGradient.addColorStop(0.4, OCEAN_CONFIG.COLORS.WATER_MID);
  waterGradient.addColorStop(1, OCEAN_CONFIG.COLORS.WATER_BOTTOM);

  ctx.fillStyle = waterGradient;
  ctx.fillRect(0, skyHeight, canvasWidth, waterHeight);
};

export const drawOceanWaves = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  skyHeight: number,
  currentTime: number
) => {
  const waveDamping = OCEAN_CONFIG.CANVAS.WAVE_DAMPING;

  // First layer of waves
  ctx.beginPath();
  ctx.moveTo(0, skyHeight);

  for (let x = 0; x < canvasWidth; x++) {
    const y =
      skyHeight +
      (OCEAN_CONFIG.WAVES.LAYER_1_AMPLITUDE *
        Math.sin(
          x * OCEAN_CONFIG.WAVES.LAYER_1_FREQUENCY +
            currentTime * OCEAN_CONFIG.WAVES.LAYER_1_SPEED
        ) +
        OCEAN_CONFIG.WAVES.LAYER_2_AMPLITUDE *
          Math.sin(
            x * OCEAN_CONFIG.WAVES.LAYER_2_FREQUENCY +
              currentTime * OCEAN_CONFIG.WAVES.LAYER_2_SPEED
          ) +
        OCEAN_CONFIG.WAVES.LAYER_3_AMPLITUDE *
          Math.sin(
            x * OCEAN_CONFIG.WAVES.LAYER_3_FREQUENCY +
              currentTime * OCEAN_CONFIG.WAVES.LAYER_3_SPEED
          )) *
        waveDamping;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(
    canvasWidth,
    skyHeight + canvasWidth * OCEAN_CONFIG.LAYOUT.WATER_HEIGHT_RATIO
  );
  ctx.lineTo(
    0,
    skyHeight + canvasWidth * OCEAN_CONFIG.LAYOUT.WATER_HEIGHT_RATIO
  );
  ctx.closePath();

  const waveGradient = ctx.createLinearGradient(
    0,
    skyHeight,
    0,
    skyHeight + 25
  );
  waveGradient.addColorStop(0, OCEAN_CONFIG.COLORS.WAVE_TOP);
  waveGradient.addColorStop(0.5, OCEAN_CONFIG.COLORS.WAVE_MID);
  waveGradient.addColorStop(1, OCEAN_CONFIG.COLORS.WAVE_FADE);
  ctx.fillStyle = waveGradient;
  ctx.fill();

  // Second layer of waves
  ctx.beginPath();
  ctx.moveTo(0, skyHeight);

  for (let x = 0; x < canvasWidth; x++) {
    const y =
      skyHeight +
      (WAVE_CALCULATIONS.OCEAN.LAYER_2_AMPLITUDE *
        Math.sin(
          x * WAVE_CALCULATIONS.OCEAN.LAYER_2_FREQUENCY +
            currentTime * WAVE_CALCULATIONS.OCEAN.LAYER_2_SPEED
        ) +
        WAVE_CALCULATIONS.OCEAN.LAYER_2_AMPLITUDE *
          0.6 *
          Math.sin(
            x * (WAVE_CALCULATIONS.OCEAN.LAYER_2_FREQUENCY * 1.67) +
              currentTime * (WAVE_CALCULATIONS.OCEAN.LAYER_2_SPEED * 1.5)
          ) +
        WAVE_CALCULATIONS.OCEAN.LAYER_2_AMPLITUDE *
          0.4 *
          Math.sin(
            x * (WAVE_CALCULATIONS.OCEAN.LAYER_2_FREQUENCY * 2.5) +
              currentTime * (WAVE_CALCULATIONS.OCEAN.LAYER_2_SPEED * 1.83)
          )) *
        waveDamping;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(
    canvasWidth,
    skyHeight + canvasWidth * OCEAN_CONFIG.LAYOUT.WATER_HEIGHT_RATIO
  );
  ctx.lineTo(
    0,
    skyHeight + canvasWidth * OCEAN_CONFIG.LAYOUT.WATER_HEIGHT_RATIO
  );
  ctx.closePath();

  const waveGradient2 = ctx.createLinearGradient(
    0,
    skyHeight,
    0,
    skyHeight + 20
  );
  waveGradient2.addColorStop(0, OCEAN_CONFIG.COLORS.WAVE_MID);
  waveGradient2.addColorStop(0.5, OCEAN_CONFIG.COLORS.WAVE_BOTTOM);
  waveGradient2.addColorStop(1, OCEAN_CONFIG.COLORS.WAVE_FADE);
  ctx.fillStyle = waveGradient2;
  ctx.fill();

  // Third layer of waves
  ctx.beginPath();
  ctx.moveTo(0, skyHeight);

  for (let x = 0; x < canvasWidth; x++) {
    const y =
      skyHeight +
      (WAVE_CALCULATIONS.OCEAN.LAYER_3_AMPLITUDE *
        Math.sin(
          x * WAVE_CALCULATIONS.OCEAN.LAYER_3_FREQUENCY +
            currentTime * WAVE_CALCULATIONS.OCEAN.LAYER_3_SPEED
        ) +
        WAVE_CALCULATIONS.OCEAN.LAYER_3_AMPLITUDE *
          0.6 *
          Math.sin(
            x * (WAVE_CALCULATIONS.OCEAN.LAYER_3_FREQUENCY * 1.75) +
              currentTime * (WAVE_CALCULATIONS.OCEAN.LAYER_3_SPEED * 2)
          ) +
        WAVE_CALCULATIONS.OCEAN.LAYER_3_AMPLITUDE *
          0.4 *
          Math.sin(
            x * (WAVE_CALCULATIONS.OCEAN.LAYER_3_FREQUENCY * 2.75) +
              currentTime * (WAVE_CALCULATIONS.OCEAN.LAYER_3_SPEED * 2)
          )) *
        waveDamping;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(
    canvasWidth,
    skyHeight + canvasWidth * OCEAN_CONFIG.LAYOUT.WATER_HEIGHT_RATIO
  );
  ctx.lineTo(
    0,
    skyHeight + canvasWidth * OCEAN_CONFIG.LAYOUT.WATER_HEIGHT_RATIO
  );
  ctx.closePath();

  const waveGradient3 = ctx.createLinearGradient(
    0,
    skyHeight,
    0,
    skyHeight + 15
  );
  waveGradient3.addColorStop(0, OCEAN_CONFIG.COLORS.WAVE_BOTTOM);
  waveGradient3.addColorStop(0.5, OCEAN_CONFIG.COLORS.WAVE_SUBTLE);
  waveGradient3.addColorStop(1, OCEAN_CONFIG.COLORS.WAVE_FADE);
  ctx.fillStyle = waveGradient3;
  ctx.fill();
};

// Fish management
export const createFish = (
  canvasWidth: number,
  canvasHeight: number,
  existingFish: Fish[]
): Fish => {
  const maxAttempts = OCEAN_CONFIG.CANVAS.MAX_FISH_ATTEMPTS;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const newFish: Fish = {
      id: ++fishIdCounter,
      x: canvasWidth + OCEAN_CONFIG.FISH.SPAWN_OFFSET,
      y: canvasHeight * 0.5 + Math.random() * (canvasHeight * 0.4),
      size:
        canvasWidth *
        (OCEAN_CONFIG.FISH.SIZE_MIN_RATIO +
          Math.random() *
            (OCEAN_CONFIG.FISH.SIZE_MAX_RATIO -
              OCEAN_CONFIG.FISH.SIZE_MIN_RATIO)),
      speed:
        OCEAN_CONFIG.FISH.SPEED_MIN +
        Math.random() *
          (OCEAN_CONFIG.FISH.SPEED_MAX - OCEAN_CONFIG.FISH.SPEED_MIN),
      opacity:
        OCEAN_CONFIG.FISH.OPACITY_MIN +
        Math.random() *
          (OCEAN_CONFIG.FISH.OPACITY_MAX - OCEAN_CONFIG.FISH.OPACITY_MIN),
      waveOffset: Math.random() * Math.PI * 2,
    };

    const minDistance =
      newFish.size * OCEAN_CONFIG.FISH.MIN_DISTANCE_MULTIPLIER;
    const hasOverlap = existingFish.some((fish) => {
      const distance = Math.sqrt(
        Math.pow(fish.x - newFish.x, 2) + Math.pow(fish.y - newFish.y, 2)
      );
      return distance < minDistance;
    });

    if (!hasOverlap || attempts === maxAttempts - 1) {
      return newFish;
    }

    attempts++;
  }

  // Fallback
  return {
    id: ++fishIdCounter,
    x: canvasWidth + OCEAN_CONFIG.FISH.SPAWN_OFFSET,
    y: canvasHeight * 0.5 + Math.random() * (canvasHeight * 0.4),
    size:
      canvasWidth *
      (OCEAN_CONFIG.FISH.SIZE_MIN_RATIO +
        Math.random() *
          (OCEAN_CONFIG.FISH.SIZE_MAX_RATIO -
            OCEAN_CONFIG.FISH.SIZE_MIN_RATIO)),
    speed:
      OCEAN_CONFIG.FISH.SPEED_MIN +
      Math.random() *
        (OCEAN_CONFIG.FISH.SPEED_MAX - OCEAN_CONFIG.FISH.SPEED_MIN),
    opacity:
      OCEAN_CONFIG.FISH.OPACITY_MIN +
      Math.random() *
        (OCEAN_CONFIG.FISH.OPACITY_MAX - OCEAN_CONFIG.FISH.OPACITY_MIN),
    waveOffset: Math.random() * Math.PI * 2,
  };
};

export const updateFishPositions = (fish: Fish[]): Fish[] => {
  return fish
    .map((fish) => {
      // Only update position if fish is not being trapped AND not blurred
      if (!fish.isBeingTrapped && !fish.isBlurred) {
        fish.x -= fish.speed;

        // Add gentle vertical swimming motion
        const swimPhase = fish.swimPhase || 0;
        fish.swimPhase = (fish.swimPhase || 0) + 0.02;
        fish.y += Math.sin(swimPhase) * 0.5;
      }
      return fish;
    })
    .filter((fish) => fish.x > -fish.size);
};

// Net calculations and drawing
export const calculateNetPosition = (
  canvasWidth: number,
  canvasHeight: number,
  currentTime: number
) => {
  const baseNetX = canvasWidth * OCEAN_CONFIG.LAYOUT.NET_X_OFFSET_RATIO;
  const baseNetY = canvasHeight * OCEAN_CONFIG.LAYOUT.NET_Y_RATIO;
  const netWidth = canvasWidth * OCEAN_CONFIG.LAYOUT.NET_WIDTH_RATIO;
  const netHeight = canvasHeight * OCEAN_CONFIG.LAYOUT.NET_HEIGHT_RATIO;

  // Add wave movement for hovering effect
  const waveOffset =
    OCEAN_CONFIG.WAVES.NET_HORIZONTAL_AMPLITUDE *
    Math.sin(currentTime * OCEAN_CONFIG.WAVES.NET_HORIZONTAL_FREQUENCY);
  const verticalWave =
    OCEAN_CONFIG.WAVES.NET_VERTICAL_AMPLITUDE *
    Math.sin(currentTime * OCEAN_CONFIG.WAVES.NET_VERTICAL_FREQUENCY);

  return {
    netX: baseNetX + waveOffset,
    netY: baseNetY + verticalWave,
    netWidth,
    netHeight,
  };
};

export const isPointInsideParabola = (
  x: number,
  y: number,
  netX: number,
  netY: number,
  netWidth: number,
  netHeight: number
): boolean => {
  const vertexX = netX + netWidth * OCEAN_CONFIG.LAYOUT.NET_VERTEX_X_RATIO;
  const vertexY = netY + netHeight / 2;
  const rectRightX = netX + netWidth;

  const cornerX = rectRightX - vertexX;
  const cornerY = netY - vertexY;
  const a = (cornerY * cornerY) / (4 * cornerX);

  if (x < vertexX || x > rectRightX) return false;

  const parabolaTopY = vertexY - Math.sqrt(4 * a * (x - vertexX));
  const parabolaBottomY = vertexY + Math.sqrt(4 * a * (x - vertexX));

  return y >= parabolaTopY && y <= parabolaBottomY;
};

export const calculateNextTrapPosition = (
  netX: number,
  netY: number,
  netWidth: number,
  netHeight: number,
  caughtFishCount: number
) => {
  const vertexX = netX + netWidth * OCEAN_CONFIG.LAYOUT.NET_VERTEX_X_RATIO;
  const vertexY = netY + netHeight / 2;
  const rectRightX = netX + netWidth;

  const cornerX = rectRightX - vertexX;
  const cornerY = netY - vertexY;
  const a = (cornerY * cornerY) / (4 * cornerX);

  // Proper parabolic stacking following the net's parabola formula
  // Fish should be arranged in a natural pattern within the parabola

  if (caughtFishCount === 0) {
    // First fish: well inside the parabola
    return { x: vertexX + 25, y: vertexY };
  }

  if (caughtFishCount === 1) {
    // Second fish: further inside parabola
    const x = vertexX + 35;
    const y = vertexY + 10;
    return { x, y };
  }

  if (caughtFishCount === 2) {
    // Third fish: well inside parabola
    const x = vertexX + 45;
    const y = vertexY;
    return { x, y };
  }

  if (caughtFishCount === 3) {
    // Fourth fish: well inside parabola
    const x = vertexX + 45;
    const y = vertexY - 10;
    return { x, y };
  }

  // For more fish, create a spiral pattern well inside the parabola
  const spiralRadius = 5 + (caughtFishCount - 4) * 2; // Smaller radius, well inside
  const angle = (caughtFishCount - 4) * 0.8; // Spiral angle

  // Calculate position well inside the parabola
  const baseX = vertexX + 55 + spiralRadius * Math.cos(angle);
  const baseY = vertexY + spiralRadius * Math.sin(angle);

  // Ensure the position follows the parabola curve
  const parabolaTopY = vertexY - Math.sqrt(4 * a * (baseX - vertexX));
  const parabolaBottomY = vertexY + Math.sqrt(4 * a * (baseX - vertexX));

  // Clamp Y position to stay well within parabola bounds (more margin)
  const clampedY = Math.max(
    parabolaTopY + 15,
    Math.min(parabolaBottomY - 15, baseY)
  );

  // Ensure X position is well within bounds
  const clampedX = Math.max(vertexX + 15, Math.min(rectRightX - 20, baseX));

  return { x: clampedX, y: clampedY };
};

// Fish trapping logic - CRITICAL: Once fish is blurred, it MUST be trapped
export const processFishTrapping = (
  fish: Fish,
  index: number,
  netX: number,
  netY: number,
  netWidth: number,
  netHeight: number,
  currentTime: number,
  nextTrapPosition: { x: number; y: number } | null,
  caughtFishRef: React.MutableRefObject<Fish[]>
): {
  shouldRemove: boolean;
  newTrapPosition: { x: number; y: number } | null;
  caughtFish?: Fish;
} => {
  const vertexX = netX + netWidth * OCEAN_CONFIG.LAYOUT.NET_VERTEX_X_RATIO;
  const vertexY = netY + netHeight / 2;
  const rectRightX = netX + netWidth;
  const rectLeftX = netX;
  const rectTopY = netY;
  const rectBottomY = netY + netHeight;

  const isInsideParabola = isPointInsideParabola(
    fish.x,
    fish.y,
    netX,
    netY,
    netWidth,
    netHeight
  );

  if (isInsideParabola) {
    // Fish is inside the net - mark as blurred immediately and PREVENT ESCAPE
    fish.isBlurred = true;

    // CRITICAL: ABSOLUTE CONTAINMENT - Fish CANNOT escape under any circumstances
    // Force fish to stay within net boundaries with multiple constraints

    // 1. Horizontal containment - prevent left/right escape
    if (fish.x < rectLeftX) {
      fish.x = rectLeftX + 5; // Force back into net
    }
    if (fish.x > rectRightX) {
      fish.x = rectRightX - OCEAN_CONFIG.FISH.ESCAPE_PREVENTION_OFFSET;
    }

    // 2. Vertical containment - prevent top/bottom escape
    if (fish.y < rectTopY) {
      fish.y = rectTopY + 5; // Force back into net
    }
    if (fish.y > rectBottomY) {
      fish.y = rectBottomY - 5; // Force back into net
    }

    // 3. Parabola boundary enforcement - ensure fish stays within parabolic net
    const cornerX = rectRightX - vertexX;
    const cornerY = rectTopY - vertexY;
    const a = (cornerY * cornerY) / (4 * cornerX);

    // Calculate parabola boundaries at current X position
    const parabolaTopY = vertexY - Math.sqrt(4 * a * (fish.x - vertexX));
    const parabolaBottomY = vertexY + Math.sqrt(4 * a * (fish.x - vertexX));

    // Force fish to stay within parabola boundaries
    if (fish.y < parabolaTopY) {
      fish.y = parabolaTopY + 2;
    }
    if (fish.y > parabolaBottomY) {
      fish.y = parabolaBottomY - 2;
    }

    // 4. SMOOTH TRAPPING - If fish is inside net, start trapping process smoothly
    // Set target trap position once and move towards it gradually

    if (!fish.isBeingTrapped) {
      // First time entering trap mode - set target position
      fish.isBeingTrapped = true;
      fish.targetTrapPosition = calculateNextTrapPosition(
        netX,
        netY,
        netWidth,
        netHeight,
        caughtFishRef.current.length
      );
    }

    const trapPos = fish.targetTrapPosition!;
    const dirX = trapPos.x - fish.x;
    const dirY = trapPos.y - fish.y;
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);

    // Move fish towards trap position with smooth, natural movement
    if (distance > 0) {
      const normalizedDirX = dirX / distance;
      const normalizedDirY = dirY / distance;

      // Move at the same speed as normal swimming
      const approachSpeed = fish.speed; // Same speed as normal movement

      fish.x += normalizedDirX * approachSpeed;
      fish.y += normalizedDirY * approachSpeed;

      // Add gentle swimming motion for more natural movement
      const swimOffset = Math.sin(currentTime * 0.005 + index) * 2; // Gentle swimming
      fish.y += swimOffset * 0.1;

      // Add slight horizontal drift for more realistic movement
      const driftOffset = Math.cos(currentTime * 0.003 + index) * 1;
      fish.x += driftOffset * 0.05;
    }

    // Check if fish has reached the trap position
    const hasReachedTrap = distance < OCEAN_CONFIG.FISH.TRAP_DETECTION_RADIUS;

    if (hasReachedTrap) {
      // Fish reached the trap position - NOW IT'S TRAPPED!

      const caughtFish = {
        ...fish,
        caughtTime: currentTime,
        x: trapPos.x,
        y: trapPos.y,
        isBlurred: true,
      };

      const newTrapPosition = calculateNextTrapPosition(
        netX,
        netY,
        netWidth,
        netHeight,
        caughtFishRef.current.length + 1
      );

      return { shouldRemove: true, newTrapPosition, caughtFish };
    }
  } else {
    // Fish is outside net - only reset if it was never being trapped
    if (!fish.isBeingTrapped) {
      fish.isBlurred = false;
      fish.targetTrapPosition = undefined;
    } else {
      // Fish was being trapped but is now outside - this might be due to net hovering
    }
    // Keep isBeingTrapped = true if fish was already being trapped
    // This prevents resetting due to net hovering movement
  }

  return { shouldRemove: false, newTrapPosition: nextTrapPosition };
};

// Smoke effect
export const createSmokeEffect = (
  x: number,
  y: number,
  smokeParticlesRef: React.MutableRefObject<SmokeParticle[]>
) => {
  for (let i = 0; i < OCEAN_CONFIG.SMOKE.PARTICLE_COUNT; i++) {
    const initialSize =
      OCEAN_CONFIG.SMOKE.SIZE_MIN +
      Math.random() *
        (OCEAN_CONFIG.SMOKE.SIZE_MAX - OCEAN_CONFIG.SMOKE.SIZE_MIN);

    const particleX = x + (Math.random() - 0.5) * OCEAN_CONFIG.SMOKE.SPREAD;
    const particleY = y + (Math.random() - 0.5) * OCEAN_CONFIG.SMOKE.SPREAD;
    const particleVx =
      (Math.random() - 0.5) * OCEAN_CONFIG.SMOKE.VELOCITY_X_RANGE;
    const particleVy =
      -Math.random() *
        (OCEAN_CONFIG.SMOKE.VELOCITY_Y_MAX -
          OCEAN_CONFIG.SMOKE.VELOCITY_Y_MIN) -
      OCEAN_CONFIG.SMOKE.VELOCITY_Y_MIN;
    const particleMaxLife =
      OCEAN_CONFIG.SMOKE.LIFE_MIN +
      Math.random() *
        (OCEAN_CONFIG.SMOKE.LIFE_MAX - OCEAN_CONFIG.SMOKE.LIFE_MIN);
    const particleWindEffect = Math.random() * OCEAN_CONFIG.SMOKE.WIND_EFFECT;

    // Validate all values are finite
    if (
      !isFinite(particleX) ||
      !isFinite(particleY) ||
      !isFinite(particleVx) ||
      !isFinite(particleVy) ||
      !isFinite(particleMaxLife) ||
      !isFinite(particleWindEffect) ||
      !isFinite(initialSize)
    ) {
      continue; // Skip this particle if any value is invalid
    }

    const particle: SmokeParticle = {
      x: particleX,
      y: particleY,
      vx: particleVx,
      vy: particleVy,
      life: 0,
      maxLife: particleMaxLife,
      size: initialSize,
      initialSize: initialSize,
      windEffect: particleWindEffect,
    };
    smokeParticlesRef.current.push(particle);
  }
};

export const updateSmokeParticles = (
  smokeParticles: SmokeParticle[],
  ctx: CanvasRenderingContext2D
) => {
  return smokeParticles.filter((particle) => {
    particle.life++;

    // Update position with wind effect
    particle.x += particle.vx + particle.windEffect;
    particle.y += particle.vy;

    // Ensure positions are finite
    if (!isFinite(particle.x) || !isFinite(particle.y)) {
      return false; // Remove invalid particles
    }

    // Particles expand as they rise (like real smoke)
    particle.size =
      particle.initialSize + particle.life * OCEAN_CONFIG.SMOKE.EXPANSION_RATE;

    // Ensure size is finite and within reasonable bounds
    if (!isFinite(particle.size) || particle.size <= 0) {
      particle.size = particle.initialSize;
    }

    // Cap maximum size to prevent performance issues
    particle.size = Math.min(particle.size, particle.initialSize * 3);

    // Calculate alpha with smooth fade
    const alpha = Math.max(0, 1 - particle.life / particle.maxLife);
    const smoothAlpha = alpha * alpha; // Quadratic fade for more realistic effect

    if (alpha <= 0) return false;

    ctx.save();
    ctx.globalAlpha = smoothAlpha * OCEAN_CONFIG.SMOKE.ALPHA;

    // Create more realistic smoke color gradient
    // Ensure all values are finite before creating gradient
    if (
      !isFinite(particle.x) ||
      !isFinite(particle.y) ||
      !isFinite(particle.size)
    ) {
      return false; // Remove invalid particles
    }

    const gradient = ctx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.size
    );
    gradient.addColorStop(
      0,
      `rgba(80, 80, 80, ${smoothAlpha * OCEAN_CONFIG.SMOKE.ALPHA})`
    );
    gradient.addColorStop(
      0.5,
      `rgba(60, 60, 60, ${smoothAlpha * OCEAN_CONFIG.SMOKE.ALPHA * 0.7})`
    );
    gradient.addColorStop(
      1,
      `rgba(40, 40, 40, ${smoothAlpha * OCEAN_CONFIG.SMOKE.ALPHA * 0.3})`
    );

    ctx.fillStyle = gradient;

    // Draw irregular smoke shape instead of perfect circle
    ctx.beginPath();
    const irregularity = 0.3;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const radius = particle.size * (1 + Math.random() * irregularity);
      const x = particle.x + Math.cos(angle) * radius;
      const y = particle.y + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    return particle.life < particle.maxLife;
  });
};
