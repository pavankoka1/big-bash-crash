export const SimpleFishVertexShaderSource = `
  precision mediump float;
  
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform vec2 u_center;
  uniform float u_radius;
  uniform float u_rotation;
  uniform vec2 u_scale;
  uniform float u_depth;
  uniform float u_zPosition;
  uniform float u_time;
  uniform float u_swimPhase;
  uniform vec3 u_lightPosition;
  uniform vec3 u_viewPosition;
  uniform vec3 u_lightColor;
  uniform float u_metallic;
  uniform float u_roughness;
  uniform float u_useLighting;
  varying vec3 v_normal;
  varying vec3 v_position;
  varying vec2 v_uv;
  varying float v_fishShape;

  // Create a fish shape using distance from center
  float fishShape(vec2 pos) {
    // Create a fish-like shape using distance
    float dist = length(pos);
    
    // Make it fish-shaped by adjusting the distance based on position
    float fishFactor = 1.0;
    
    // Make it longer horizontally
    if (abs(pos.x) > abs(pos.y)) {
      fishFactor = 0.8; // Wider horizontally
    } else {
      fishFactor = 1.2; // Narrower vertically
    }
    
    // Create the fish shape
    return 1.0 - (dist * fishFactor);
  }

  void main() {
    // Apply swimming motion
    float swimOffset = sin(u_time * 2.0 + u_swimPhase) * 0.1;
    vec2 pos = a_position + vec2(swimOffset, 0.0);
    
    // Calculate fish shape
    float shape = fishShape(pos);
    v_fishShape = shape;
    
    // For debugging: always render, don't cull
    // if (shape < 0.0) {
    //   gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    //   return;
    // }
    
    // Transform position
    float x = pos.x * u_radius * u_scale.x;
    float y = pos.y * u_radius * u_scale.y;
    
    // Add depth variation for 3D effect
    float z = shape * u_depth + u_zPosition;
    
    // Apply rotation
    float cosR = cos(u_rotation);
    float sinR = sin(u_rotation);
    float rotatedX = x * cosR - y * sinR;
    float rotatedY = x * sinR + y * cosR;
    
    // Calculate normal for lighting
    v_normal = vec3(0.0, 0.0, 1.0);
    
    // Apply perspective
    float perspective = 1.0 + (z / 10000.0);
    vec2 screenPos = u_center + vec2(rotatedX, rotatedY) / perspective;
    v_position = vec3(screenPos, z);
    v_uv = (pos + 1.0) * 0.5;
    
    // Convert to clip space
    vec2 zeroToOne = screenPos / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = vec2(zeroToTwo.x - 1.0, 1.0 - zeroToTwo.y);
    gl_Position = vec4(clipSpace, 0, 1);
  }
`;

export const SimpleFishFragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  uniform vec3 u_lightPosition;
  uniform vec3 u_viewPosition;
  uniform vec3 u_lightColor;
  uniform float u_metallic;
  uniform float u_roughness;
  uniform float u_useLighting;
  uniform float u_time;
  uniform float u_swimPhase;
  varying vec3 v_normal;
  varying vec3 v_position;
  varying vec2 v_uv;
  varying float v_fishShape;

  void main() {
    // Create fish shape in fragment shader
    vec2 pos = (v_uv - 0.5) * 2.0; // Convert UV to position
    
    // Create fish body (elongated ellipse)
    float bodyX = pos.x * 1.5; // Make body longer
    float bodyY = pos.y;
    float bodyDist = length(vec2(bodyX, bodyY));
    float fishBody = 1.0 - smoothstep(0.2, 0.7, bodyDist);
    
    // Create tail (triangular shape on the left)
    float tailShape = 0.0;
    if (pos.x < -0.3) {
      float tailX = (pos.x + 0.3) / 0.7; // Normalize tail area
      float tailY = abs(pos.y);
      tailShape = 1.0 - smoothstep(0.0, 0.8, tailY + tailX * 0.5);
    }
    
    // Create eye (small circle on the right side)
    float eyeX = pos.x - 0.3;
    float eyeY = pos.y - 0.2;
    float eyeDist = length(vec2(eyeX, eyeY));
    float eye = 1.0 - smoothstep(0.0, 0.15, eyeDist);
    
    // Create gills (vertical lines on the body)
    float gill1 = 0.0;
    float gill2 = 0.0;
    if (pos.x > 0.1 && pos.x < 0.3 && abs(pos.y) < 0.4) {
      // First gill line
      if (abs(pos.x - 0.15) < 0.02) {
        gill1 = 1.0;
      }
      // Second gill line  
      if (abs(pos.x - 0.25) < 0.02) {
        gill2 = 1.0;
      }
    }
    
    // Combine all parts
    float finalShape = max(fishBody, tailShape);
    
    // Only show pixels inside fish shape
    if (finalShape < 0.1) {
      discard;
    }
    
    // Create final color
    vec4 finalColor = u_color;
    
    // Add eye (black)
    if (eye > 0.1) {
      finalColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    // Add gills (slightly darker)
    else if (gill1 > 0.1 || gill2 > 0.1) {
      finalColor = u_color * 0.7;
    }
    // Add tail (slightly different shade)
    else if (tailShape > 0.1) {
      finalColor = u_color * 0.9;
    }
    
    gl_FragColor = finalColor;
  }
`;
