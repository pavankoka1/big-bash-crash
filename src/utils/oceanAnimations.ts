import { OCEAN_CONFIG, WAVE_CALCULATIONS } from "../constants/oceanConstants";

export interface Fish {
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
      fish.x -= fish.speed;
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
    // First fish: near the vertex
    return { x: vertexX + 10, y: vertexY };
  }

  if (caughtFishCount === 1) {
    // Second fish: slightly right and below vertex
    const x = vertexX + 20;
    const y = vertexY + 15;
    return { x, y };
  }

  if (caughtFishCount === 2) {
    // Third fish: to the right of first fish
    const x = vertexX + 30;
    const y = vertexY;
    return { x, y };
  }

  if (caughtFishCount === 3) {
    // Fourth fish: above the third fish
    const x = vertexX + 30;
    const y = vertexY - 15;
    return { x, y };
  }

  // For more fish, create a spiral pattern within the parabola
  const spiralRadius = 8 + (caughtFishCount - 4) * 3; // Increasing radius
  const angle = (caughtFishCount - 4) * 0.8; // Spiral angle

  // Calculate position along the parabola curve
  const baseX = vertexX + 40 + spiralRadius * Math.cos(angle);
  const baseY = vertexY + spiralRadius * Math.sin(angle);

  // Ensure the position follows the parabola curve
  const parabolaTopY = vertexY - Math.sqrt(4 * a * (baseX - vertexX));
  const parabolaBottomY = vertexY + Math.sqrt(4 * a * (baseX - vertexX));

  // Clamp Y position to stay within parabola bounds
  const clampedY = Math.max(
    parabolaTopY + 5,
    Math.min(parabolaBottomY - 5, baseY)
  );

  // Ensure X position is within bounds
  const clampedX = Math.max(vertexX + 5, Math.min(rectRightX - 10, baseX));

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
      console.log(
        `Fish ${index} tried to escape left! Forced back to x=${fish.x.toFixed(
          1
        )}`
      );
    }
    if (fish.x > rectRightX) {
      fish.x = rectRightX - OCEAN_CONFIG.FISH.ESCAPE_PREVENTION_OFFSET;
      console.log(
        `Fish ${index} tried to escape right! Forced back to x=${fish.x.toFixed(
          1
        )}`
      );
    }

    // 2. Vertical containment - prevent top/bottom escape
    if (fish.y < rectTopY) {
      fish.y = rectTopY + 5; // Force back into net
      console.log(
        `Fish ${index} tried to escape up! Forced back to y=${fish.y.toFixed(
          1
        )}`
      );
    }
    if (fish.y > rectBottomY) {
      fish.y = rectBottomY - 5; // Force back into net
      console.log(
        `Fish ${index} tried to escape down! Forced back to y=${fish.y.toFixed(
          1
        )}`
      );
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
      console.log(
        `Fish ${index} tried to escape parabola top! Forced back to y=${fish.y.toFixed(
          1
        )}`
      );
    }
    if (fish.y > parabolaBottomY) {
      fish.y = parabolaBottomY - 2;
      console.log(
        `Fish ${index} tried to escape parabola bottom! Forced back to y=${fish.y.toFixed(
          1
        )}`
      );
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
      console.log(
        `Fish ${index} starting smooth trap to position: x=${fish.targetTrapPosition.x.toFixed(
          1
        )}, y=${fish.targetTrapPosition.y.toFixed(1)}`
      );
    }

    const trapPos = fish.targetTrapPosition!;
    const dirX = trapPos.x - fish.x;
    const dirY = trapPos.y - fish.y;
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);

    // Move fish towards trap position with ULTRA smooth, gradual movement
    if (distance > 0) {
      const normalizedDirX = dirX / distance;
      const normalizedDirY = dirY / distance;

      // ULTRA smooth movement - very slow approach
      const approachSpeed = Math.min(fish.speed * 0.15, distance * 0.01); // Very slow approach

      fish.x += normalizedDirX * approachSpeed;
      fish.y += normalizedDirY * approachSpeed;

      // Add very gentle curve to the movement for more natural path
      const curveOffset = Math.sin(currentTime * 0.003 + index) * 0.5; // Very subtle curve
      fish.y += curveOffset * 0.02;
    }

    // Check if fish has reached the trap position
    const hasReachedTrap = distance < OCEAN_CONFIG.FISH.TRAP_DETECTION_RADIUS;

    if (hasReachedTrap) {
      // Fish reached the trap position - NOW IT'S TRAPPED!
      console.log(`Fish ${index} reached trap position! Trapping...`);

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

      console.log(
        `🎣 FISH TRAPPED! Fish ${index} at position: x=${trapPos.x.toFixed(
          1
        )}, y=${trapPos.y.toFixed(1)}`
      );

      return { shouldRemove: true, newTrapPosition, caughtFish };
    }
  } else {
    // Fish is outside net - normal movement
    fish.isBlurred = false;
    fish.isBeingTrapped = false;
    fish.targetTrapPosition = undefined;
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
    const particle: SmokeParticle = {
      x: x + (Math.random() - 0.5) * OCEAN_CONFIG.SMOKE.SPREAD,
      y: y + (Math.random() - 0.5) * OCEAN_CONFIG.SMOKE.SPREAD,
      vx: (Math.random() - 0.5) * OCEAN_CONFIG.SMOKE.VELOCITY_X_RANGE,
      vy:
        -Math.random() *
          (OCEAN_CONFIG.SMOKE.VELOCITY_Y_MAX -
            OCEAN_CONFIG.SMOKE.VELOCITY_Y_MIN) -
        OCEAN_CONFIG.SMOKE.VELOCITY_Y_MIN,
      life: 0,
      maxLife:
        OCEAN_CONFIG.SMOKE.LIFE_MIN +
        Math.random() *
          (OCEAN_CONFIG.SMOKE.LIFE_MAX - OCEAN_CONFIG.SMOKE.LIFE_MIN),
      size:
        OCEAN_CONFIG.SMOKE.SIZE_MIN +
        Math.random() *
          (OCEAN_CONFIG.SMOKE.SIZE_MAX - OCEAN_CONFIG.SMOKE.SIZE_MIN),
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
    particle.x += particle.vx;
    particle.y += particle.vy;

    const alpha = 1 - particle.life / particle.maxLife;

    if (alpha <= 0) return false;

    ctx.save();
    ctx.globalAlpha = alpha * OCEAN_CONFIG.SMOKE.ALPHA;
    ctx.fillStyle = OCEAN_CONFIG.COLORS.SMOKE;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    return particle.life < particle.maxLife;
  });
};
