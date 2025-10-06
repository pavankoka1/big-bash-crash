import { ANIMATION_TIMING, OCEAN_CONFIG } from "../constants/oceanConstants";
import { Fish } from "./oceanAnimations";

// Fish drawing functions
export const drawFish = (
  ctx: CanvasRenderingContext2D,
  fish: Fish,
  fishImage: HTMLImageElement | null,
  index: number
) => {
  const drawX = fish.x;
  const drawY = fish.y;

  // Debug logging for fish in net
  if (fish.isBlurred && index === 0) {
    console.log(
      `Drawing fish ${index}: x=${drawX.toFixed(1)}, y=${drawY.toFixed(
        1
      )}, size=${fish.size.toFixed(1)}`
    );
  }

  ctx.save();
  ctx.globalAlpha = fish.opacity;

  // Apply blur if fish is inside net
  if (fish.isBlurred) {
    ctx.filter = `blur(${OCEAN_CONFIG.FISH.BLUR_INTENSITY}px)`;
  }

  if (fishImage) {
    ctx.drawImage(fishImage, drawX, drawY, fish.size, fish.size);
  } else {
    // Fallback: draw a simple fish shape
    drawFallbackFish(ctx, drawX, drawY, fish.size);
  }

  ctx.restore();
};

export const drawCaughtFish = (
  ctx: CanvasRenderingContext2D,
  fish: Fish,
  fishImage: HTMLImageElement | null,
  currentTime: number,
  index: number
) => {
  const timeSinceCaught = currentTime - (fish as any).caughtTime;
  const blurIntensity = Math.min(
    timeSinceCaught * ANIMATION_TIMING.FISH_BLUR_SPEED,
    5
  );

  // Debug logging for caught fish
  if (index === 0) {
    console.log(
      `🎣 Drawing caught fish ${index}: x=${fish.x.toFixed(
        1
      )}, y=${fish.y.toFixed(1)}, size=${fish.size.toFixed(1)}`
    );
  }

  ctx.save();
  ctx.globalAlpha = fish.opacity * OCEAN_CONFIG.FISH.CAUGHT_OPACITY_MULTIPLIER;
  ctx.filter = `blur(${blurIntensity}px)`;

  if (fishImage) {
    ctx.drawImage(
      fishImage,
      fish.x,
      fish.y,
      fish.size * OCEAN_CONFIG.FISH.CAUGHT_SIZE_MULTIPLIER,
      fish.size * OCEAN_CONFIG.FISH.CAUGHT_SIZE_MULTIPLIER
    );
  } else {
    // Fallback fish shape
    drawFallbackFish(
      ctx,
      fish.x,
      fish.y,
      fish.size * OCEAN_CONFIG.FISH.CAUGHT_SIZE_MULTIPLIER
    );
  }

  ctx.restore();
};

const drawFallbackFish = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => {
  ctx.fillStyle = OCEAN_CONFIG.COLORS.FISH_FALLBACK;

  // Draw fish body
  ctx.beginPath();
  ctx.ellipse(x, y, size / 2, size / 4, 0, 0, 2 * Math.PI);
  ctx.fill();

  // Draw tail
  ctx.beginPath();
  ctx.moveTo(x - size / 2, y);
  ctx.lineTo(x - size, y - size / 4);
  ctx.lineTo(x - size, y + size / 4);
  ctx.closePath();
  ctx.fill();
};

// UI drawing functions
export const drawFishCount = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  fishCount: number,
  currentTime: number
) => {
  ctx.save();
  ctx.fillStyle = OCEAN_CONFIG.COLORS.TEXT;
  ctx.strokeStyle = OCEAN_CONFIG.COLORS.TEXT_STROKE;
  ctx.lineWidth = OCEAN_CONFIG.UI.STROKE_WIDTH;
  ctx.font = `${OCEAN_CONFIG.UI.FONT_SIZE}px ${OCEAN_CONFIG.UI.FONT_FAMILY}`;
  ctx.textAlign = "right";

  const countText = `Fish Caught: ${fishCount}`;
  const textX = canvasWidth - OCEAN_CONFIG.UI.TEXT_OFFSET_X;
  const textY = OCEAN_CONFIG.UI.TEXT_OFFSET_Y;

  // Debug logging every 2 seconds
  if (Math.floor(currentTime / 1000) % 2 === 0) {
    console.log(`Current fish count: ${fishCount}`);
  }

  // Draw text with outline
  ctx.strokeText(countText, textX, textY);
  ctx.fillText(countText, textX, textY);

  ctx.restore();
};

// Debug function to draw trap position indicators
export const drawTrapPositionIndicator = (
  ctx: CanvasRenderingContext2D,
  trapPosition: { x: number; y: number },
  fishIndex: number
) => {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#FFD700"; // Gold color for trap indicator
  ctx.strokeStyle = "#FFA500"; // Orange outline
  ctx.lineWidth = 2;

  // Draw a small circle at trap position
  ctx.beginPath();
  ctx.arc(trapPosition.x, trapPosition.y, 8, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Draw fish index number
  ctx.fillStyle = "#000000";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(fishIndex.toString(), trapPosition.x, trapPosition.y + 4);

  ctx.restore();
};

// Debug function to draw parabola shape for fish positioning
export const drawParabolaDebug = (
  ctx: CanvasRenderingContext2D,
  netX: number,
  netY: number,
  netWidth: number,
  netHeight: number
) => {
  const vertexX = netX + netWidth * 0.75;
  const vertexY = netY + netHeight / 2;
  const rectRightX = netX + netWidth;

  const cornerX = rectRightX - vertexX;
  const cornerY = netY - vertexY;
  const a = (cornerY * cornerY) / (4 * cornerX);

  ctx.save();
  ctx.strokeStyle = "#FF0000"; // Red for debug
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;

  // Draw parabola outline
  ctx.beginPath();
  ctx.moveTo(vertexX, vertexY);

  // Top half of parabola
  for (let x = vertexX; x <= rectRightX; x += 2) {
    const y = vertexY - Math.sqrt(4 * a * (x - vertexX));
    if (y >= netY) {
      ctx.lineTo(x, y);
    }
  }

  // Bottom half of parabola
  ctx.moveTo(vertexX, vertexY);
  for (let x = vertexX; x <= rectRightX; x += 2) {
    const y = vertexY + Math.sqrt(4 * a * (x - vertexX));
    if (y <= netY + netHeight) {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
  ctx.restore();
};
