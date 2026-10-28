import * as THREE from 'three';

/**
 * Step 1: Render one rotating cube.
 * 
 * Core concepts introduced:
 * - Scene: The root container holding all 3D objects, lights, and cameras.
 * - PerspectiveCamera: Simulates human eye with perspective (field of view, aspect ratio, near/far planes).
 * - WebGLRenderer: Takes the scene and camera and draws pixels onto an HTML5 canvas.
 * - BoxGeometry: The mathematical description of vertex coordinates and triangular faces.
 * - MeshBasicMaterial: A flat-colored material that does NOT require light to be visible.
 * - Mesh: Combines a Geometry and a Material and positions them in 3D space.
 * - Render Loop: requestAnimationFrame calling renderer.render() on every monitor refresh.
 */
export function setupStep1(container: HTMLElement): () => void {
  // 1. Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  // 2. Camera
  // Parameters: FOV (degrees), aspect ratio, near clip, far clip
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  // Position camera along +Z so it looks towards origin (0, 0, 0)
  camera.position.z = 4;

  // 3. Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 4. Geometry + Material -> Mesh
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: false,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 5. Render Loop
  let animationFrameId: number;

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    // Rotate cube along X and Y axes
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.015;

    // Render the scene from camera's vantage point
    renderer.render(scene, camera);
  };

  animate();

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationFrameId);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}

