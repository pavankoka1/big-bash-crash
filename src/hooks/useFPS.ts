import { useEffect, useRef, useState } from "react";

interface FPSData {
  fps: number;
  isCalculating: boolean;
  error: string | null;
  resetFPS: () => void;
  getFrameRateMultiplier: () => number;
  progress: number; // 0-100 for loader progress
}

const FPS_STORAGE_KEY = "big-bash-crash-fps";
const FPS_CALCULATION_DURATION = 5000; // 5 seconds of calculation
const FPS_SKIP_DURATION = 1000; // Skip first 1 second
const TARGET_FPS = 60; // Target FPS for normalization
const FPS_VALIDATION_THRESHOLD = 8; // Recalculate if difference > 8 FPS

export const useFPS = (): FPSData => {
  const [fps, setFps] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const frameCountRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animationIdRef = useRef<number | null>(null);
  const isSkippingRef = useRef<boolean>(true);
  const hasCalculatedRef = useRef<boolean>(false);

  useEffect(() => {
    // Always calculate FPS on mount, even if stored
    const storedFPS = localStorage.getItem(FPS_STORAGE_KEY);
    const storedFPSValue = storedFPS ? parseFloat(storedFPS) : 0;

    setIsCalculating(true);
    setError(null);
    setProgress(0);
    frameCountRef.current = 0;
    startTimeRef.current = performance.now();
    lastTimeRef.current = startTimeRef.current;
    isSkippingRef.current = true;
    hasCalculatedRef.current = false;

    const calculateFPS = (currentTime: number) => {
      frameCountRef.current++;

      // Skip first 1 second
      if (
        isSkippingRef.current &&
        currentTime - startTimeRef.current < FPS_SKIP_DURATION
      ) {
        const skipProgress =
          ((currentTime - startTimeRef.current) / FPS_SKIP_DURATION) * 20; // 20% for skip
        setProgress(skipProgress);
        animationIdRef.current = requestAnimationFrame(calculateFPS);
        return;
      }

      // Start counting after skip period
      if (isSkippingRef.current) {
        isSkippingRef.current = false;
        frameCountRef.current = 0;
        startTimeRef.current = currentTime;
        lastTimeRef.current = currentTime;
      }

      // Calculate progress (20% for skip + 80% for measurement)
      const measurementTime = currentTime - startTimeRef.current;
      const measurementProgress =
        (measurementTime / FPS_CALCULATION_DURATION) * 80;
      const totalProgress = 20 + measurementProgress;
      setProgress(Math.min(totalProgress, 100));

      // Check if we've calculated for enough time
      if (
        measurementTime >= FPS_CALCULATION_DURATION &&
        !hasCalculatedRef.current
      ) {
        hasCalculatedRef.current = true;
        const calculatedFPS = Math.round(
          (frameCountRef.current / measurementTime) * 1000
        );

        // Validate against stored FPS
        if (storedFPSValue > 0) {
          const difference = Math.abs(calculatedFPS - storedFPSValue);
          if (difference > FPS_VALIDATION_THRESHOLD) {
            localStorage.setItem(FPS_STORAGE_KEY, calculatedFPS.toString());
          }
        } else {
          localStorage.setItem(FPS_STORAGE_KEY, calculatedFPS.toString());
        }

        setFps(calculatedFPS);
        setIsCalculating(false);
        setProgress(100);

        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        return;
      }

      animationIdRef.current = requestAnimationFrame(calculateFPS);
    };

    animationIdRef.current = requestAnimationFrame(calculateFPS);

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []); // Empty dependency array - only run on mount

  // Function to reset FPS calculation (useful for testing)
  const resetFPS = () => {
    localStorage.removeItem(FPS_STORAGE_KEY);
    setFps(0);
    setIsCalculating(true);
    setProgress(0);
    hasCalculatedRef.current = false;
  };

  // Calculate frame rate multiplier for normalization
  const getFrameRateMultiplier = (): number => {
    if (fps <= 0) return 1;
    return TARGET_FPS / fps;
  };

  return {
    fps,
    isCalculating,
    error,
    resetFPS,
    getFrameRateMultiplier,
    progress,
  };
};
