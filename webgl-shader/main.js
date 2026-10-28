// =============================================================================
// STEP 1: INITIALIZE CANVAS AND WEBGL 2 CONTEXT
// =============================================================================

const canvas = document.getElementById('gl-canvas');

// Request WebGL 2 context (gl is the state machine interface to your GPU)
const gl = canvas.getContext('webgl2');

if (!gl) {
  alert('WebGL 2 is not supported by your browser or graphics hardware.');
  throw new Error('WebGL 2 unavailable');
}

// Map Normalized Device Coordinates (NDC: [-1, 1]) to screen pixel dimensions
gl.viewport(0, 0, canvas.width, canvas.height);


// =============================================================================
// STEP 2 & 3: SHADERS (GLSL ES 3.00)
// =============================================================================

// VERTEX SHADER:
// Runs once per vertex (3 times for a single triangle).
// Its primary job is to output 'gl_Position' in clip space (NDC).
const vertexShaderSource = `#version 300 es

// Input attribute: incoming vertex position from our buffer
in vec2 a_position;

void main() {
  // gl_Position is a built-in vec4 (x, y, z, w).
  // For 2D, z is 0.0 and w is 1.0.
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// FRAGMENT SHADER:
// Runs once for every fragment (pixel) inside the rasterized triangle.
// Its primary job is to write the output RGBA color to the framebuffer.
const fragmentShaderSource = `#version 300 es
precision highp float;

// Uniform: global variable passed from JavaScript, constant across all pixels in one draw
uniform vec4 u_color;

// Output variable for final pixel color
out vec4 fragColor;

void main() {
  fragColor = u_color;
}
`;

// Helper: Compile GLSL source code into a GPU shader object
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    const errorLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation error: ${errorLog}`);
  }
  return shader;
}

// Helper: Link vertex shader and fragment shader together into a GPU program
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    const errorLog = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking error: ${errorLog}`);
  }
  return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);


// =============================================================================
// STEP 4: BUFFERS, VERTEX ATTRIBUTES, VAO & UNIFORMS
// =============================================================================

// 1. Define raw vertex coordinates in Normalized Device Coordinates (NDC):
// X and Y range from -1.0 to +1.0. (0,0) is the center of the canvas.
const trianglePositions = new Float32Array([
   0.0,  0.55,  // Top vertex
  -0.55, -0.45, // Bottom-left vertex
   0.55, -0.45   // Bottom-right vertex
]);

// 2. Create a GPU Buffer and copy CPU data to GPU memory (VRAM)
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, trianglePositions, gl.STATIC_DRAW);

// 3. Query the location of the 'a_position' attribute in our compiled program
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

// 4. Create and bind a Vertex Array Object (VAO).
// In WebGL 2, the VAO stores the attribute configuration and buffer binding state.
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// Enable the attribute and describe how to read the data from the buffer
gl.enableVertexAttribArray(positionAttributeLocation);

const size = 2;          // 2 values per vertex (X and Y)
const type = gl.FLOAT;   // 32-bit floating point numbers
const normalize = false; // Do not normalize fixed-point data
const stride = 0;        // 0 = tightly packed (no extra bytes between vertices)
const offset = 0;        // Byte offset from start of buffer
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

// 5. Query the location of the 'u_color' uniform
const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

// Unbind VAO (optional, good hygiene so state isn't accidentally overwritten)
gl.bindVertexArray(null);


// =============================================================================
// STEP 5: RENDER LOOP & UNIFORM ANIMATION
// =============================================================================

function render(time) {
  // Convert timestamp from milliseconds to seconds
  const seconds = time * 0.001;

  // Clear the canvas with a dark background color
  gl.clearColor(0.04, 0.05, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Activate our shader program
  gl.useProgram(program);

  // Bind the VAO containing our triangle buffer and attribute layout
  gl.bindVertexArray(vao);

  // Animate RGB color smoothly over time using offset sine waves
  const r = 0.5 + 0.5 * Math.sin(seconds * 2.0);
  const g = 0.5 + 0.5 * Math.sin(seconds * 2.0 + 2.094); // 2.094 rad ~ 120 deg
  const b = 0.5 + 0.5 * Math.sin(seconds * 2.0 + 4.188); // 4.188 rad ~ 240 deg

  // Upload dynamic uniform data (RGBA) to the fragment shader
  gl.uniform4f(colorUniformLocation, r, g, b, 1.0);

  // Issue the DRAW CALL: Draw 3 vertices as a triangle
  // (mode: gl.TRIANGLES, starting index: 0, count: 3)
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Request the next animation frame
  requestAnimationFrame(render);
}

// Start the animation loop
requestAnimationFrame(render);

