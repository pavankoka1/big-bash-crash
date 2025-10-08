import React, { useEffect, useRef, useState } from "react";
import { GAME_TIMING, OCEAN_CONFIG } from "../constants/oceanConstants";
import { drawBoat, drawFishingNet } from "../utils/boatAndNet";
import { drawCaughtFish, drawFish, drawFishCount } from "../utils/fishDrawing";
import {
  Fish,
  SmokeParticle,
  Wave,
  calculateNetPosition,
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

  // Game state
  const [gameState, setGameState] = useState<
    "playing" | "detaching" | "gameOver"
  >("playing");
  const [gameTime, setGameTime] = useState(0);
  const [finalFishCount, setFinalFishCount] = useState(0);
  const [gameDuration, setGameDuration] = useState(0); // Random duration between 15-20 seconds
  const gameStartTimeRef = useRef<number>(0);
  const detachmentStartTimeRef = useRef<number>(0);
  const gameEndedRef = useRef<boolean>(false);

  // Generate random game duration on mount
  useEffect(() => {
    const randomDuration =
      Math.floor(
        Math.random() *
          (GAME_TIMING.GAME_DURATION_MAX - GAME_TIMING.GAME_DURATION_MIN + 1)
      ) + GAME_TIMING.GAME_DURATION_MIN;
    setGameDuration(randomDuration);
    console.log(`🎮 Game duration set to: ${randomDuration} seconds`);
  }, []);

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
      // Initialize game timer on first frame
      if (gameStartTimeRef.current === 0) {
        gameStartTimeRef.current = currentTime;
      }

      // Calculate game time
      const elapsedTime = currentTime - gameStartTimeRef.current;
      const gameTimeSeconds = Math.floor(elapsedTime / 1000);

      // Update game time state
      if (gameTimeSeconds !== gameTime) {
        setGameTime(gameTimeSeconds);
        console.log(
          `Timer: ${gameTimeSeconds}s (elapsed: ${elapsedTime}ms), State: ${gameState}`
        );
      }

      // Check if game duration has passed
      if (gameTimeSeconds >= gameDuration && !gameEndedRef.current) {
        console.log(
          `🎮 GAME ENDING! Time: ${gameTimeSeconds}s/${gameDuration}s, State: ${gameState}, gameEnded: ${gameEndedRef.current}`
        );
        gameEndedRef.current = true;
        setGameState("detaching");
        setFinalFishCount(caughtFishRef.current.length);
        detachmentStartTimeRef.current = currentTime;
      }

      // Check if detachment animation is complete
      if (
        gameEndedRef.current &&
        currentTime - detachmentStartTimeRef.current >
          GAME_TIMING.DETACHMENT_DURATION
      ) {
        setGameState("gameOver");
      }
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

      // Spawn new fish only during playing state
      if (
        gameState === "playing" &&
        currentTime - lastFishSpawn > fishSpawnInterval
      ) {
        const newFish = createFish(
          canvas.width,
          canvas.height,
          fishRef.current
        );
        fishRef.current.push(newFish);
        lastFishSpawn = currentTime;
      }

      // Process fish trapping and drawing
      let netPosition = calculateNetPosition(
        canvas.width,
        canvas.height,
        currentTime
      );
      let { netX, netY, netWidth, netHeight } = netPosition;

      // Apply detachment animation
      if (gameEndedRef.current) {
        const detachmentProgress = Math.min(
          (currentTime - detachmentStartTimeRef.current) /
            GAME_TIMING.DETACHMENT_DURATION,
          1
        );
        const detachmentOffset = detachmentProgress * canvas.width * 1.5; // Move left off screen
        netX -= detachmentOffset;
      }

      // Calculate net deviation from base position for caught fish movement
      const baseNetX = canvas.width * OCEAN_CONFIG.LAYOUT.NET_X_OFFSET_RATIO;
      const baseNetY = canvas.height * OCEAN_CONFIG.LAYOUT.NET_Y_RATIO;
      const netDeviationX = netX - baseNetX;
      const netDeviationY = netY - baseNetY;

      // Process each fish for trapping only during playing state
      if (gameState === "playing") {
        for (let i = fishRef.current.length - 1; i >= 0; i--) {
          const fish = fishRef.current[i];

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
      }

      // Draw active fish
      fishRef.current.forEach((fish, index) => {
        drawFish(ctx, fish, fishImageRef.current, index);
      });

      // Draw caught fish with net hovering movement
      caughtFishRef.current.forEach((fish, index) => {
        // Apply net deviation to caught fish positions
        let adjustedFish = {
          ...fish,
          x: fish.x + netDeviationX,
          y: fish.y + netDeviationY,
        };

        // Apply detachment animation to caught fish
        if (gameEndedRef.current) {
          const detachmentProgress = Math.min(
            (currentTime - detachmentStartTimeRef.current) /
              GAME_TIMING.DETACHMENT_DURATION,
            1
          );
          const detachmentOffset = detachmentProgress * canvas.width * 1.5;
          adjustedFish.x -= detachmentOffset;
        }

        drawCaughtFish(
          ctx,
          adjustedFish,
          fishImageRef.current,
          currentTime,
          index
        );
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

      // Draw fishing net with detachment animation
      if (!gameEndedRef.current) {
        drawFishingNet(ctx, canvas.width, canvas.height, currentTime);
      } else {
        // Draw detached net flowing left
        const detachmentProgress = Math.min(
          (currentTime - detachmentStartTimeRef.current) /
            GAME_TIMING.DETACHMENT_DURATION,
          1
        );
        const detachmentOffset = detachmentProgress * canvas.width * 1.5;
        ctx.save();
        ctx.translate(-detachmentOffset, 0);
        drawFishingNet(ctx, canvas.width, canvas.height, currentTime);
        ctx.restore();
      }

      // Draw parabola debug outline - REMOVED
      // drawParabolaDebug(ctx, netX, netY, netWidth, netHeight);

      // Draw fish count
      drawFishCount(
        ctx,
        canvas.width,
        caughtFishRef.current.length,
        currentTime
      );

      // Draw game timer with background
      const remainingTime = Math.max(0, gameDuration - gameTimeSeconds);
      const timerText = `Time: ${remainingTime}s`;
      const timerX = canvas.width / 2;
      const timerY = 50;

      // Draw background for timer
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(timerX - 80, timerY - 30, 160, 40);

      // Draw timer text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(timerText, timerX, timerY);

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

      {/* Game Over Screen */}
      {gameState === "gameOver" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Game Over!
          </h1>
          <h2
            style={{
              fontSize: "32px",
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            You caught {finalFishCount} fish!
          </h2>
          <button
            onClick={() => {
              // Generate new random game duration
              const newDuration =
                Math.floor(
                  Math.random() *
                    (GAME_TIMING.GAME_DURATION_MAX -
                      GAME_TIMING.GAME_DURATION_MIN +
                      1)
                ) + GAME_TIMING.GAME_DURATION_MIN;
              setGameDuration(newDuration);
              console.log(`🎮 New game duration: ${newDuration} seconds`);

              setGameState("playing");
              setGameTime(0);
              setFinalFishCount(0);
              fishRef.current = [];
              caughtFishRef.current = [];
              smokeParticlesRef.current = [];
              nextTrapPositionRef.current = null;
              gameStartTimeRef.current = 0; // Reset game timer
              gameEndedRef.current = false; // Reset game ended flag
            }}
            style={{
              padding: "15px 30px",
              fontSize: "24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default OceanScene;
