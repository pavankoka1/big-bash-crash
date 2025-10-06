import React, { useEffect, useRef, useState } from "react";
import { OCEAN_CONFIG } from "../constants/oceanConstants";
import { drawBoat, drawFishingNet } from "../utils/boatAndNet";
import {
  drawCaughtFish,
  drawFish,
  drawFishCount,
  drawParabolaDebug,
  drawTrapPositionIndicator,
} from "../utils/fishDrawing";
import {
  Fish,
  SmokeParticle,
  Wave,
  calculateNetPosition,
  calculateNextTrapPosition,
  createFish,
  createSmokeEffect,
  drawAtmosphericWaves,
  drawOcean,
  drawOceanWaves,
  drawSky,
  processFishTrapping,
  updateFishPositions,
  updateSmokeParticles,
} from "../utils/oceanAnimations";

const OceanScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const fishImageRef = useRef<HTMLImageElement | null>(null);
  const boatImageRef = useRef<HTMLImageElement | null>(null);
  const fishRef = useRef<Fish[]>([]);
  const caughtFishRef = useRef<Fish[]>([]);
  const smokeParticlesRef = useRef<SmokeParticle[]>([]);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const nextTrapPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      try {
        const fishImg = new Image();
        const boatImg = new Image();

        const fishPromise = new Promise<void>((resolve, reject) => {
          fishImg.onload = () => {
            fishImageRef.current = fishImg;
            console.log("Fish image loaded successfully");
            resolve();
          };
          fishImg.onerror = () => {
            console.error("Failed to load fish image");
            reject(new Error("Fish image failed to load"));
          };
          fishImg.src = "/assets/fish.png";
        });

        const boatPromise = new Promise<void>((resolve, reject) => {
          boatImg.onload = () => {
            boatImageRef.current = boatImg;
            console.log("Boat image loaded successfully");
            resolve();
          };
          boatImg.onerror = () => {
            console.error("Failed to load boat image");
            reject(new Error("Boat image failed to load"));
          };
          boatImg.src = "/assets/boat.png";
        });

        await Promise.all([fishPromise, boatPromise]);
        setImagesLoaded(true);
        console.log("All images loaded successfully");
      } catch (error) {
        console.error("Failed to load images:", error);
        // Still set images loaded to true to show the scene even without images
        setImagesLoaded(true);
      }
    };

    loadImages();
  }, []);

  // Initialize waves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newWaves: Wave[] = [];
    for (let i = 0; i < OCEAN_CONFIG.WAVES.COUNT; i++) {
      newWaves.push({
        x: 0,
        y: canvas.height * OCEAN_CONFIG.LAYOUT.SKY_HEIGHT_RATIO,
        amplitude:
          OCEAN_CONFIG.WAVES.AMPLITUDE_MIN +
          Math.random() *
            (OCEAN_CONFIG.WAVES.AMPLITUDE_MAX -
              OCEAN_CONFIG.WAVES.AMPLITUDE_MIN),
        frequency:
          OCEAN_CONFIG.WAVES.FREQUENCY_MIN +
          Math.random() *
            (OCEAN_CONFIG.WAVES.FREQUENCY_MAX -
              OCEAN_CONFIG.WAVES.FREQUENCY_MIN),
        phase: Math.random() * Math.PI * 2,
      });
    }
    setWaves(newWaves);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize fish
    fishRef.current = [];
    for (let i = 0; i < OCEAN_CONFIG.CANVAS.FISH_COUNT_INITIAL; i++) {
      fishRef.current.push(
        createFish(canvas.width, canvas.height, fishRef.current)
      );
    }

    let lastFishSpawn = 0;
    const fishSpawnInterval = OCEAN_CONFIG.CANVAS.FISH_SPAWN_INTERVAL;

    const animate = (currentTime: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const skyHeight = canvas.height * OCEAN_CONFIG.LAYOUT.SKY_HEIGHT_RATIO;
      const waterHeight =
        canvas.height * OCEAN_CONFIG.LAYOUT.WATER_HEIGHT_RATIO;

      // Draw sky and atmospheric effects
      drawSky(ctx, canvas.width, skyHeight);
      drawAtmosphericWaves(ctx, canvas.width, skyHeight, currentTime);

      // Draw ocean and waves
      drawOcean(ctx, canvas.width, skyHeight, waterHeight);
      drawOceanWaves(ctx, canvas.width, skyHeight, currentTime);

      // Update fish positions
      fishRef.current = updateFishPositions(fishRef.current);

      // Spawn new fish
      if (currentTime - lastFishSpawn > fishSpawnInterval) {
        fishRef.current.push(
          createFish(canvas.width, canvas.height, fishRef.current)
        );
        lastFishSpawn = currentTime;
        console.log("Spawned new fish, total fish:", fishRef.current.length);
      }

      // Process fish trapping and drawing
      const netPosition = calculateNetPosition(
        canvas.width,
        canvas.height,
        currentTime
      );
      const { netX, netY, netWidth, netHeight } = netPosition;

      // Process each fish for trapping
      for (let i = fishRef.current.length - 1; i >= 0; i--) {
        const fish = fishRef.current[i];

        // ADDITIONAL SAFETY: If fish is blurred but somehow still in active fish array,
        // force it to be trapped immediately (this should never happen but just in case)
        if (fish.isBlurred) {
          console.log(
            `🚨 SAFETY TRAP: Fish ${i} is blurred but still active! Forcing trap...`
          );

          // Force trap this fish immediately
          const emergencyTrapPos = calculateNextTrapPosition(
            netX,
            netY,
            netWidth,
            netHeight,
            caughtFishRef.current.length
          );

          const caughtFish = {
            ...fish,
            caughtTime: currentTime,
            x: emergencyTrapPos.x,
            y: emergencyTrapPos.y,
            isBlurred: true,
          };

          fishRef.current.splice(i, 1);
          caughtFishRef.current.push(caughtFish);
          nextTrapPositionRef.current = calculateNextTrapPosition(
            netX,
            netY,
            netWidth,
            netHeight,
            caughtFishRef.current.length
          );
          createSmokeEffect(caughtFish.x, caughtFish.y, smokeParticlesRef);
          continue;
        }

        const result = processFishTrapping(
          fish,
          i,
          netX,
          netY,
          netWidth,
          netHeight,
          currentTime,
          nextTrapPositionRef.current,
          caughtFishRef
        );

        if (result.shouldRemove && result.caughtFish) {
          // Fish is trapped - remove from active fish and add to caught fish
          fishRef.current.splice(i, 1);
          caughtFishRef.current.push(result.caughtFish);
          nextTrapPositionRef.current = result.newTrapPosition;
          createSmokeEffect(
            result.caughtFish.x,
            result.caughtFish.y,
            smokeParticlesRef
          );
        }
      }

      // Draw active fish
      fishRef.current.forEach((fish, index) => {
        drawFish(ctx, fish, fishImageRef.current, index);

        // Draw trap position indicator for fish that are being trapped
        if (fish.isBlurred && fish.targetTrapPosition) {
          drawTrapPositionIndicator(ctx, fish.targetTrapPosition, index);
        }
      });

      // Draw caught fish
      caughtFishRef.current.forEach((fish, index) => {
        drawCaughtFish(ctx, fish, fishImageRef.current, currentTime, index);
      });

      // Update and draw smoke particles
      smokeParticlesRef.current = updateSmokeParticles(
        smokeParticlesRef.current,
        ctx
      );

      // Draw boat
      if (boatImageRef.current) {
        drawBoat(
          ctx,
          canvas.width,
          canvas.height,
          skyHeight,
          currentTime,
          boatImageRef.current
        );
      }

      // Draw fishing net
      drawFishingNet(ctx, canvas.width, canvas.height, currentTime);

      // Draw parabola debug outline
      drawParabolaDebug(ctx, netX, netY, netWidth, netHeight);

      // Draw fish count
      drawFishCount(
        ctx,
        canvas.width,
        caughtFishRef.current.length,
        currentTime
      );

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [imagesLoaded, waves]);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "default",
        }}
      />
    </div>
  );
};

export default OceanScene;
