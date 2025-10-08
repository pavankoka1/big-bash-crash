# 🎣 Big Bash Crash - Ocean Fishing Game

A React-based 2D ocean fishing game built with TypeScript and Canvas API. Players catch fish using a parabolic fishing net that moves with ocean waves.

## 🎮 Game Features

### Core Gameplay

- **Ocean Environment**: Animated sky, ocean waves, and atmospheric effects
- **Fish Spawning**: Fish spawn every second and swim across the screen
- **Fishing Net**: Parabolic net that moves with ocean waves and catches fish
- **Fish Catching**: Fish get trapped in the net and are collected
- **Game Timer**: Random game duration between 15-20 seconds
- **Detachment Animation**: Net detaches and flows off-screen when time ends
- **Game Over Screen**: Shows final fish count with replay functionality

### Technical Features

- **FPS Calculation**: Automatic frame rate detection and normalization
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Efficient rendering and animation loops
- **Smooth Animations**: 60 FPS target with frame rate normalization

## 🏗️ Project Structure

```
src/
├── components/
│   ├── OceanScene.tsx          # Main game component
│   ├── FPSLoader.tsx           # FPS calculation loader
│   └── BigBassCrash.tsx        # App wrapper component
├── hooks/
│   └── useFPS.ts               # Custom hook for FPS calculation
├── constants/
│   └── oceanConstants.ts       # Game configuration constants
├── utils/
│   ├── oceanAnimations.ts      # Core game logic and animations
│   ├── fishDrawing.ts          # Fish rendering utilities
│   ├── boatAndNet.ts          # Boat and net rendering
│   └── webgl.ts               # WebGL utilities (unused)
├── types/
│   ├── fishTypes.ts           # Fish-related type definitions
│   └── types.ts               # General type definitions
└── shaders/
    ├── fishShaders.ts         # Fish shader definitions
    ├── simpleFishShaders.ts   # Simplified fish shaders
    └── simpleShaders.ts       # Basic shader utilities
```

## 🎯 Game Mechanics

### Fish System

- **Spawning**: Fish spawn every 1000ms at random positions off-screen right
- **Movement**: Fish swim left across the screen at 2.5-4.5 pixels per frame
- **Trapping**: Fish are caught when they enter the parabolic net area
- **Lifetime**: Fish are removed when they move off-screen left

### Net System

- **Parabolic Shape**: Net forms a parabolic opening that catches fish
- **Wave Movement**: Net moves with ocean wave animations
- **Trap Detection**: Uses mathematical parabola calculations for collision detection
- **Detachment**: Net moves left off-screen when game ends

### Game States

1. **Playing**: Normal gameplay with fish spawning and catching
2. **Detaching**: Net detaches and moves off-screen
3. **Game Over**: Shows final score and replay button

## ⚙️ Technical Implementation

### FPS Normalization

The game uses automatic FPS detection to ensure consistent gameplay across different devices:

```typescript
// FPS calculation runs for 5 seconds on app start
const { fps, isCalculating, progress, getFrameRateMultiplier } = useFPS();

// Game timing is normalized to 60 FPS
const frameRateMultiplier = getFrameRateMultiplier();
const normalizedElapsedTime = elapsedTime * frameRateMultiplier;
```

### Animation Loop

The main animation loop handles:

- Game timing and state management
- Fish spawning and movement
- Net positioning and fish trapping
- Rendering all game elements
- Smoke particle effects

### Fish Trapping Algorithm

1. **Detection**: Check if fish position is inside parabolic net area
2. **Trapping**: Mark fish as being trapped and set target position
3. **Movement**: Move fish smoothly toward trap position
4. **Collection**: Add caught fish to caught fish array

## 🎨 Visual Effects

### Ocean Environment

- **Sky Gradient**: Smooth color transition from top to bottom
- **Wave Animation**: Multiple animated wave layers
- **Atmospheric Effects**: Subtle wave distortions in sky

### Fish Rendering

- **Image-based**: Uses fish.png for realistic appearance
- **Blur Effect**: Trapped fish have motion blur
- **Stacking**: Caught fish are stacked in organized rows

### Smoke Effects

- **Particle System**: 75 smoke particles per fish catch
- **Realistic Movement**: Wind effects and expansion
- **Fade Animation**: Particles fade out over time

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm start
```

### Building for Production

```bash
# Build the project
npm run build

# Serve the built files
npm run serve
```

## 🔧 Configuration

Game settings can be modified in `src/constants/oceanConstants.ts`:

```typescript
export const OCEAN_CONFIG = {
  CANVAS: {
    FISH_SPAWN_INTERVAL: 1000, // Fish spawn every 1 second
    FISH_COUNT_INITIAL: 5, // Initial fish count
  },
  FISH: {
    SPEED_MIN: 2.5, // Minimum fish speed
    SPEED_MAX: 4.5, // Maximum fish speed
    SIZE_MIN_RATIO: 0.02, // Minimum fish size
    SIZE_MAX_RATIO: 0.04, // Maximum fish size
  },
  GAME_TIMING: {
    GAME_DURATION_MIN: 15, // Minimum game duration (seconds)
    GAME_DURATION_MAX: 20, // Maximum game duration (seconds)
    DETACHMENT_DURATION: 3000, // Net detachment animation (ms)
  },
};
```

## 🎮 Controls

- **No Controls Required**: Game runs automatically
- **Replay**: Click "Play Again" button on game over screen

## 🐛 Troubleshooting

### Common Issues

1. **Fish not spawning**: Check if images are loaded properly
2. **Game not ending**: Verify game duration settings
3. **Performance issues**: Check FPS calculation and frame rate normalization

### Debug Mode

Enable debug logging by uncommenting console.log statements in the code.

## 📝 Development Notes

### Code Organization

- **Components**: React components for UI and game logic
- **Hooks**: Custom React hooks for reusable logic
- **Utils**: Pure functions for game mechanics
- **Constants**: Centralized configuration
- **Types**: TypeScript type definitions

### Performance Considerations

- **Canvas Rendering**: Efficient 2D canvas operations
- **Object Pooling**: Reuse fish and particle objects
- **Frame Rate Normalization**: Consistent timing across devices
- **Memory Management**: Proper cleanup of animation loops

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Fish and boat images from game assets
- Ocean wave algorithms inspired by real wave physics
- Canvas API for smooth 2D rendering
- React for component-based architecture
