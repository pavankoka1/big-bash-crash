import React from "react";

interface FPSLoaderProps {
  isCalculating: boolean;
  fps: number;
  progress: number;
  onReset?: () => void;
}

const FPSLoader: React.FC<FPSLoaderProps> = ({
  isCalculating,
  fps,
  progress,
  onReset,
}) => {
  if (!isCalculating) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "600px",
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "20px",
            color: "#4CAF50",
          }}
        >
          🎮 Big Bash Crash
        </h1>

        <div
          style={{
            fontSize: "24px",
            marginBottom: "30px",
            color: "#B0E0E6",
          }}
        >
          Calculating optimal frame rate...
        </div>

        <div
          style={{
            width: "400px",
            height: "25px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            overflow: "hidden",
            margin: "0 auto 20px",
            position: "relative",
            border: "2px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #4CAF50, #8BC34A, #FFC107, #FF9800)",
              borderRadius: "10px",
              transition: "width 0.1s ease-out",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>

        <div
          style={{
            fontSize: "18px",
            color: "#E0E0E0",
            marginBottom: "20px",
          }}
        >
          {progress < 20
            ? "Skipping first second for accurate measurement..."
            : progress < 100
            ? "Measuring frame rate for 5 seconds..."
            : "FPS calculation complete!"}
        </div>

        <div
          style={{
            fontSize: "16px",
            color: "#B0B0B0",
            lineHeight: "1.5",
          }}
        >
          This ensures the game runs at the same speed on all devices
          <br />
          regardless of their refresh rate (60fps, 120fps, etc.)
        </div>

        {onReset && (
          <button
            onClick={onReset}
            style={{
              marginTop: "30px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reset FPS Calculation
          </button>
        )}
      </div>

      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};

export default FPSLoader;
