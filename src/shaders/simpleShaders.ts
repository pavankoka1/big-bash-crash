export const SimpleVertexShaderSource = `
  precision mediump float;
  
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform vec2 u_center;
  uniform float u_size;
  
  void main() {
    vec2 position = a_position * u_size + u_center;
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = vec2(zeroToTwo.x - 1.0, 1.0 - zeroToTwo.y);
    gl_Position = vec4(clipSpace, 0, 1);
  }
`;

export const SimpleFragmentShaderSource = `
  precision mediump float;
  
  uniform vec4 u_color;
  
  void main() {
    gl_FragColor = u_color;
  }
`;
