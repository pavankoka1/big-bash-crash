import React, { useEffect, useRef, useState } from "react";
import { FishSystem } from "../systems/FishSystem";
import { SimpleFishSystem } from "../systems/SimpleFishSystem";
import { SimpleTestSystem } from "../systems/SimpleTestSystem";
import type { FishConfig } from "../types/fishTypes";

interface OBJData {
  vertices: number[][];
  faces: number[][];
}

const BigBassCrash: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const fishSystemRef = useRef<FishSystem | null>(null);
  const simpleFishSystemRef = useRef<SimpleFishSystem | null>(null);
  const testSystemRef = useRef<SimpleTestSystem | null>(null);
  const [objData, setObjData] = useState<OBJData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get WebGL context
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    console.log("WebGL context created successfully");
    console.log("WebGL version:", gl.getParameter(gl.VERSION));
    console.log("WebGL vendor:", gl.getParameter(gl.VENDOR));
    console.log("WebGL renderer:", gl.getParameter(gl.RENDERER));

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log("Canvas resized to:", canvas.width, "x", canvas.height);
      fishSystemRef.current?.resize(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    try {
      // Initialize simple test system first
      testSystemRef.current = new SimpleTestSystem(gl);
      console.log("Simple test system created");

      // Initialize simple fish system
      simpleFishSystemRef.current = new SimpleFishSystem(gl);
      console.log("Simple fish system created");

      // Create fish with configuration
      const fishConfig: FishConfig = {
        count: 12,
        size: 80, // Make fish bigger
        speed: 0.5, // Make fish slower
        colors: [
          "#49a362", // Original green
          "#4a7c59", // Darker green
          "#5ba85a", // Lighter green
          "#3d8b3d", // Forest green
          "#2e7d32", // Deep green
          "#388e3c", // Material green
          "#43a047", // Bright green
          "#4caf50", // Light green
          "#66bb6a", // Light green variant
          "#81c784", // Very light green
        ],
        spawnArea: {
          x: [canvas.width - 50, canvas.width + 100], // Spawn from right edge
          y: [canvas.height * 0.3, canvas.height * 0.9],
        },
        behavior: {
          swimPattern: "sinusoidal",
          maxSpeed: 2.0,
          acceleration: 0.1,
        },
      };

      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
      console.log(
        "Window dimensions:",
        window.innerWidth,
        "x",
        window.innerHeight
      );
      console.log("Spawn area:", JSON.stringify(fishConfig.spawnArea));

      simpleFishSystemRef.current.createFish(fishConfig);
      console.log("Simple fish system created with", fishConfig.count, "fish");

      // Animation loop
      const animate = () => {
        // Clear WebGL canvas with ocean blue
        gl.clearColor(0.0, 0.4, 0.6, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Render simple test rectangles first (disabled to see fish)
        // if (testSystemRef.current) {
        //   testSystemRef.current.renderTestRectangles(
        //     canvas.width,
        //     canvas.height
        //   );
        // }

        // Update and render simple fish
        if (simpleFishSystemRef.current) {
          simpleFishSystemRef.current.update(16, canvas.width, canvas.height);
          simpleFishSystemRef.current.render();
        } else {
          console.log("Simple fish system not available");
        }

        animationIdRef.current = requestAnimationFrame(animate);
      };

      // Test: Just show ocean blue background first
      console.log("Starting animation loop...");

      // Start animation
      animationIdRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error("Error initializing fish system:", error);
    }

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (fishSystemRef.current) {
        fishSystemRef.current.destroy();
      }
      if (simpleFishSystemRef.current) {
        simpleFishSystemRef.current.destroy();
      }
      if (testSystemRef.current) {
        testSystemRef.current.destroy();
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []); // Run once on mount

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "crosshair",
        }}
      />
    </div>
  );
};

export default BigBassCrash;
