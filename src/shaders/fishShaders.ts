export const FishVertexShaderSource = `
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

  // Create fish-like shape using mathematical functions
  float fishShape(vec2 pos) {
    // Main body - elongated ellipse
    float body = 1.0 - (pos.x * pos.x * 0.8 + pos.y * pos.y * 2.0);
    
    // Tail section - wider at back
    float tail = 1.0 - (pos.x * pos.x * 0.3 + pos.y * pos.y * 1.5);
    tail *= smoothstep(-0.8, -0.3, pos.x);
    
    // Head section - narrower at front
    float head = 1.0 - (pos.x * pos.x * 1.2 + pos.y * pos.y * 1.8);
    head *= smoothstep(0.3, 0.8, pos.x);
    
    // Combine sections
    float fish = max(body, max(tail, head));
    
    // Add fin details
    float dorsalFin = 1.0 - (pos.x * pos.x * 0.5 + (pos.y - 0.3) * (pos.y - 0.3) * 3.0);
    dorsalFin *= smoothstep(-0.2, 0.2, pos.x);
    dorsalFin *= smoothstep(0.2, 0.4, pos.y);
    
    float ventralFin = 1.0 - (pos.x * pos.x * 0.5 + (pos.y + 0.3) * (pos.y + 0.3) * 3.0);
    ventralFin *= smoothstep(-0.2, 0.2, pos.x);
    ventralFin *= smoothstep(-0.4, -0.2, pos.y);
    
    return max(fish, max(dorsalFin, ventralFin));
  }

  // Calculate normal for lighting
  vec3 calculateNormal(vec2 pos, float shape) {
    float eps = 0.01;
    float dx = fishShape(pos + vec2(eps, 0.0)) - fishShape(pos - vec2(eps, 0.0));
    float dy = fishShape(pos + vec2(0.0, eps)) - fishShape(pos - vec2(0.0, eps));
    return normalize(vec3(-dx, -dy, 1.0));
  }

  void main() {
    // Apply swimming motion
    float swimOffset = sin(u_time * 2.0 + u_swimPhase) * 0.1;
    vec2 pos = a_position + vec2(swimOffset, 0.0);
    
    // Calculate fish shape
    float shape = fishShape(pos);
    v_fishShape = shape;
    
    // Only render if inside fish shape
    if (shape < 0.0) {
      gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }
    
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
    v_normal = calculateNormal(pos, shape);
    
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

export const FishFragmentShaderSource = `
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

  // Create fish texture pattern
  vec3 fishTexture(vec2 uv) {
    // Base color
    vec3 baseColor = u_color.rgb;
    
    // Add scale pattern
    float scalePattern = sin(uv.x * 20.0) * sin(uv.y * 15.0);
    scalePattern = smoothstep(0.3, 0.7, scalePattern);
    
    // Add lateral line
    float lateralLine = 1.0 - smoothstep(0.45, 0.55, uv.y);
    lateralLine *= smoothstep(0.2, 0.8, uv.x);
    
    // Add fin details
    float finPattern = sin(uv.x * 30.0) * sin(uv.y * 25.0);
    finPattern = smoothstep(0.4, 0.6, finPattern);
    
    // Combine patterns
    vec3 patternColor = mix(baseColor, baseColor * 0.8, scalePattern);
    patternColor = mix(patternColor, baseColor * 1.2, lateralLine);
    patternColor = mix(patternColor, baseColor * 0.9, finPattern);
    
    return patternColor;
  }

  void main() {
    // Discard pixels outside fish shape
    if (v_fishShape < 0.0) {
      discard;
    }
    
    if (u_useLighting < 0.5) {
      gl_FragColor = u_color;
      return;
    }
    
    // Get fish texture
    vec3 baseColor = fishTexture(v_uv);
    
    // Lighting calculations
    vec3 norm = normalize(v_normal);
    vec3 lightDir = normalize(u_lightPosition - v_position);
    vec3 viewDir = normalize(u_viewPosition - v_position);
    
    // Ambient lighting
    float ambientStrength = 0.3 + (u_metallic * 0.2);
    vec3 ambient = ambientStrength * u_lightColor;
    
    // Diffuse lighting
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * u_lightColor * 0.8;
    
    // Specular lighting
    vec3 reflectDir = reflect(-lightDir, norm);
    float roughness = max(u_roughness, 0.01);
    float shininess = 32.0 / (roughness * roughness);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = 0.5 * spec * u_lightColor;
    
    // Fresnel effect for underwater look
    float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 2.0);
    vec3 fresnelColor = mix(baseColor, u_lightColor, fresnel * 0.1);
    
    // Combine lighting
    vec3 result = (ambient + diffuse + specular + fresnelColor) * baseColor;
    
    // Add slight transparency for underwater effect
    float alpha = u_color.a * (0.9 + 0.1 * sin(u_time + u_swimPhase));
    
    gl_FragColor = vec4(result, alpha);
  }
`;
