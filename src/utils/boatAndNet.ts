import { OCEAN_CONFIG } from "../constants/oceanConstants";

// Boat drawing functions
export const drawBoat = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  skyHeight: number,
  currentTime: number,
  boatImage: HTMLImageElement
) => {
  const boatWidth = canvasWidth * OCEAN_CONFIG.LAYOUT.BOAT_WIDTH_RATIO;
  const boatHeight = boatWidth * OCEAN_CONFIG.LAYOUT.BOAT_HEIGHT_RATIO;
  const boatX = (canvasWidth - boatWidth) / 2;

  // Calculate wave height at boat position for realistic hovering
  const waveDamping = OCEAN_CONFIG.CANVAS.WAVE_DAMPING;
  const boatHoverDamping = OCEAN_CONFIG.CANVAS.BOAT_HOVER_DAMPING;

  const waveHeightAtBoat =
    (OCEAN_CONFIG.WAVES.LAYER_1_AMPLITUDE *
      Math.sin(
        boatX * OCEAN_CONFIG.WAVES.LAYER_1_FREQUENCY +
          currentTime * OCEAN_CONFIG.WAVES.LAYER_1_SPEED
      ) +
      OCEAN_CONFIG.WAVES.LAYER_2_AMPLITUDE *
        Math.sin(
          boatX * OCEAN_CONFIG.WAVES.LAYER_2_FREQUENCY +
            currentTime * OCEAN_CONFIG.WAVES.LAYER_2_SPEED
        ) +
      OCEAN_CONFIG.WAVES.LAYER_3_AMPLITUDE *
        Math.sin(
          boatX * OCEAN_CONFIG.WAVES.LAYER_3_FREQUENCY +
            currentTime * OCEAN_CONFIG.WAVES.LAYER_3_SPEED
        )) *
    waveDamping *
    boatHoverDamping;

  const boatY =
    canvasHeight * OCEAN_CONFIG.LAYOUT.BOAT_Y_RATIO -
    boatHeight +
    waveHeightAtBoat;

  // Draw boat shadow
  drawBoatShadow(
    ctx,
    boatX,
    boatY,
    boatWidth,
    boatHeight,
    skyHeight,
    waveHeightAtBoat
  );

  // Draw the boat
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.drawImage(boatImage, boatX, boatY, boatWidth, boatHeight);

  // Add water effect on submerged part
  const submergedHeight = boatHeight * OCEAN_CONFIG.BOAT.SUBMERGED_HEIGHT_RATIO;
  const waterMaskY = skyHeight + waveHeightAtBoat;

  if (waterMaskY > boatY) {
    ctx.save();
    ctx.globalAlpha = OCEAN_CONFIG.BOAT.WATER_MASK_ALPHA;

    const submergedGradient = ctx.createLinearGradient(
      boatX,
      waterMaskY,
      boatX,
      waterMaskY + submergedHeight
    );
    submergedGradient.addColorStop(0, "rgba(1, 84, 130, 0.6)");
    submergedGradient.addColorStop(0.3, "rgba(0, 105, 148, 0.4)");
    submergedGradient.addColorStop(0.7, "rgba(1, 84, 130, 0.3)");
    submergedGradient.addColorStop(1, "rgba(1, 84, 130, 0.1)");

    ctx.fillStyle = submergedGradient;
    ctx.fillRect(
      boatX,
      waterMaskY,
      boatWidth,
      Math.min(submergedHeight, boatY + boatHeight - waterMaskY)
    );
    ctx.restore();
  }

  ctx.restore();
};

const drawBoatShadow = (
  ctx: CanvasRenderingContext2D,
  boatX: number,
  boatY: number,
  boatWidth: number,
  boatHeight: number,
  skyHeight: number,
  waveHeightAtBoat: number
) => {
  const boatCenterX = boatX + boatWidth / 2;
  const shadowOffsetX = OCEAN_CONFIG.BOAT.SHADOW_OFFSET_X;

  const shadowX = boatCenterX + shadowOffsetX;
  const shadowY =
    skyHeight + waveHeightAtBoat + OCEAN_CONFIG.BOAT.SHADOW_OFFSET_Y;

  ctx.save();
  ctx.globalAlpha = OCEAN_CONFIG.BOAT.SHADOW_ALPHA;
  ctx.fillStyle = OCEAN_CONFIG.COLORS.BOAT_SHADOW;
  ctx.beginPath();

  const shadowWidth = boatWidth * OCEAN_CONFIG.BOAT.SHADOW_WIDTH_RATIO;
  const shadowHeight = boatHeight * OCEAN_CONFIG.BOAT.SHADOW_HEIGHT_RATIO;
  const shadowStartX = shadowX - shadowWidth / 2;
  const shadowStartY = shadowY;

  // Draw realistic shadow shape with bezier curves
  ctx.moveTo(shadowStartX, shadowStartY);
  ctx.bezierCurveTo(
    shadowStartX + shadowWidth * 0.2,
    shadowStartY - shadowHeight * 0.3,
    shadowStartX + shadowWidth * 0.4,
    shadowStartY - shadowHeight * 0.1,
    shadowStartX + shadowWidth * 0.5,
    shadowStartY
  );
  ctx.bezierCurveTo(
    shadowStartX + shadowWidth * 0.6,
    shadowStartY + shadowHeight * 0.1,
    shadowStartX + shadowWidth * 0.8,
    shadowStartY + shadowHeight * 0.3,
    shadowStartX + shadowWidth,
    shadowStartY
  );
  ctx.bezierCurveTo(
    shadowStartX + shadowWidth * 0.9,
    shadowStartY + shadowHeight * 0.5,
    shadowStartX + shadowWidth * 0.7,
    shadowStartY + shadowHeight * 0.7,
    shadowStartX + shadowWidth * 0.5,
    shadowStartY + shadowHeight
  );
  ctx.bezierCurveTo(
    shadowStartX + shadowWidth * 0.3,
    shadowStartY + shadowHeight * 0.7,
    shadowStartX + shadowWidth * 0.1,
    shadowStartY + shadowHeight * 0.5,
    shadowStartX,
    shadowStartY
  );

  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Net drawing functions
export const drawFishingNet = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  currentTime: number
) => {
  const { netX, netY, netWidth, netHeight } = calculateNetPosition(
    canvasWidth,
    canvasHeight,
    currentTime
  );

  ctx.save();

  // Draw parabola curve
  const vertexX = netX + netWidth * OCEAN_CONFIG.LAYOUT.NET_VERTEX_X_RATIO;
  const vertexY = netY + netHeight / 2;
  const rectRightX = netX + netWidth;
  const rectTopY = netY;
  const rectBottomY = netY + netHeight;

  const cornerX = rectRightX - vertexX;
  const cornerY = rectTopY - vertexY;
  const a = (cornerY * cornerY) / (4 * cornerX);

  ctx.strokeStyle = OCEAN_CONFIG.COLORS.NET_STROKE;
  ctx.lineWidth = OCEAN_CONFIG.NET.STROKE_WIDTH;

  // Draw parabola curve
  ctx.beginPath();
  ctx.moveTo(vertexX, vertexY);

  // Top half of parabola
  for (let x = vertexX; x <= rectRightX; x += 2) {
    const y = vertexY - Math.sqrt(4 * a * (x - vertexX));
    if (y >= rectTopY) {
      ctx.lineTo(x, y);
    }
  }

  // Bottom half of parabola
  ctx.moveTo(vertexX, vertexY);
  for (let x = vertexX; x <= rectRightX; x += 2) {
    const y = vertexY + Math.sqrt(4 * a * (x - vertexX));
    if (y <= rectBottomY) {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  // Create clipping path for parabola
  ctx.beginPath();
  ctx.moveTo(vertexX, vertexY);

  // Top half of parabola
  for (let x = vertexX; x <= rectRightX; x += 2) {
    const y = vertexY - Math.sqrt(4 * a * (x - vertexX));
    if (y >= rectTopY) {
      ctx.lineTo(x, y);
    }
  }

  // Bottom half of parabola
  for (let x = rectRightX; x >= vertexX; x -= 2) {
    const y = vertexY + Math.sqrt(4 * a * (x - vertexX));
    if (y <= rectBottomY) {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.clip();

  // Draw net grid with wave distortion
  ctx.strokeStyle = OCEAN_CONFIG.COLORS.NET_COLOR;
  ctx.lineWidth = OCEAN_CONFIG.NET.LINE_WIDTH;
  ctx.globalAlpha = OCEAN_CONFIG.NET.ALPHA;

  const lineSpacing = OCEAN_CONFIG.NET.LINE_SPACING;

  // Draw horizontal lines with wave distortion
  for (let y = rectTopY; y <= rectBottomY; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(netX, y);

    for (let x = netX; x <= rectRightX; x += 4) {
      const waveDistortion =
        Math.sin(
          (x - netX) * OCEAN_CONFIG.NET.WAVE_DISTORTION_FREQUENCY_X +
            currentTime * OCEAN_CONFIG.NET.WAVE_DISTORTION_SPEED_X
        ) *
          OCEAN_CONFIG.NET.WAVE_DISTORTION_AMPLITUDE +
        Math.sin(
          (y - rectTopY) * OCEAN_CONFIG.NET.WAVE_DISTORTION_FREQUENCY_Y +
            currentTime * OCEAN_CONFIG.NET.WAVE_DISTORTION_SPEED_Y
        ) *
          (OCEAN_CONFIG.NET.WAVE_DISTORTION_AMPLITUDE * 0.67);
      ctx.lineTo(x, y + waveDistortion);
    }
    ctx.stroke();
  }

  // Draw vertical lines with wave distortion
  for (let x = netX; x <= rectRightX; x += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, rectTopY);

    for (let y = rectTopY; y <= rectBottomY; y += 4) {
      const waveDistortion =
        Math.sin(
          (y - rectTopY) * OCEAN_CONFIG.NET.WAVE_DISTORTION_FREQUENCY_Y +
            currentTime * OCEAN_CONFIG.NET.WAVE_DISTORTION_SPEED_Y
        ) *
          (OCEAN_CONFIG.NET.WAVE_DISTORTION_AMPLITUDE * 0.67) +
        Math.sin(
          (x - netX) * OCEAN_CONFIG.NET.WAVE_DISTORTION_FREQUENCY_X +
            currentTime * OCEAN_CONFIG.NET.WAVE_DISTORTION_SPEED_X
        ) *
          OCEAN_CONFIG.NET.WAVE_DISTORTION_AMPLITUDE;
      ctx.lineTo(x + waveDistortion, y);
    }
    ctx.stroke();
  }

  ctx.restore();

  // Draw connecting pole from boat to net
  drawNetPole(ctx, canvasWidth, canvasHeight, netX, netY, netWidth, netHeight);
};

const calculateNetPosition = (
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

const drawNetPole = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  netX: number,
  netY: number,
  netWidth: number,
  netHeight: number
) => {
  const boatCenterX = canvasWidth / 2;
  const boatBottomY = canvasHeight * OCEAN_CONFIG.LAYOUT.BOAT_Y_RATIO;

  const poleEndX = netX + netWidth;
  const poleEndY = netY;

  ctx.strokeStyle = OCEAN_CONFIG.COLORS.NET_STROKE;
  ctx.lineWidth = OCEAN_CONFIG.NET.POLE_WIDTH;
  ctx.globalAlpha = 1;
  ctx.beginPath();

  const poleMidX = (boatCenterX + poleEndX) / 2;
  const poleMidY = (boatBottomY + poleEndY) / 2 - 10;

  ctx.moveTo(boatCenterX, boatBottomY);
  ctx.quadraticCurveTo(poleMidX, poleMidY, poleEndX, poleEndY);
  ctx.stroke();
};

