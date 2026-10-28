import * as THREE from 'three';

/**
 * Step 3: Add lighting and a perspective camera setup.
 * 
 * Core concepts introduced:
 * - Three.js Coordinate System:
 *   Right-handed coordinate system:
 *     +X = Right (Red in AxesHelper)
 *     +Y = Up (Green in AxesHelper)
 *     +Z = Towards Viewer (Blue in AxesHelper)
 * - PerspectiveCamera Parameters:
 *   - fov: Vertical field of view in degrees (e.g. 50 deg).
 *   - aspect: Width / Height of the viewport.
 *   - near: Nearest distance rendered (objects closer are clipped).
 *   - far: Farthest distance rendered (objects beyond are clipped).
 *   - camera.lookAt(x, y, z): Reorients camera to point toward any 3D coordinate.
 * - Lighting System:
 *   1. AmbientLight: Soft fill light, no direction, prevents pure black shadows.
 *   2. DirectionalLight: Parallel rays, simulates distant sun with sharp highlights.
 *   3. PointLight: Radiates outward in all directions from a point with distance falloff.
 * - Visual Helpers:
 *   AxesHelper (Red=X, Green=Y, Blue=Z) and GridHelper (spatial floor).
 */
export function setupStep3(container: HTMLElement): () => void {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  // 1. Perspective Camera positioned elevated and angled
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  // Position camera up and back, looking at scene center
  camera.position.set(0, 3, 6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 2. Spatial Helpers (Coordinate visualization)
  const axesHelper = new THREE.AxesHelper(2.5); // X=Red, Y=Green, Z=Blue
  scene.add(axesHelper);

  const gridHelper = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b);
  gridHelper.position.y = -1;
  scene.add(gridHelper);

  // 3. Lighting setup
  // A. Ambient Light (uniform baseline illumination)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // B. Directional Light (key light, angled like sun)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(4, 5, 3);
  scene.add(dirLight);

  // C. Moving Point Light (colored accent light)
  const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 10);
  pointLight.position.set(0, 1.5, 1);
  scene.add(pointLight);

  // Add small sphere to visualize point light position
  const lightMarkerGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const lightMarkerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const lightMarker = new THREE.Mesh(lightMarkerGeo, lightMarkerMat);
  pointLight.add(lightMarker);

  // 4. Meshes to receive the lighting
  const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3,
    metalness: 0.2,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.x = -2.2;
  scene.add(box);

  const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    roughness: 0.1,
    metalness: 0.5,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.x = 0;
  scene.add(sphere);

  const torusGeo = new THREE.TorusGeometry(0.7, 0.25, 24, 48);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.2,
    metalness: 0.8,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.x = 2.2;
  scene.add(torus);

  // 5. Render Loop with animated orbiting point light
  let animationFrameId: number;
  let clock = new THREE.Clock();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Orbit the point light horizontally in a circle
    pointLight.position.x = Math.sin(elapsedTime * 1.5) * 3;
    pointLight.position.z = Math.cos(elapsedTime * 1.5) * 2;

    box.rotation.y = elapsedTime * 0.5;
    sphere.rotation.y = elapsedTime * 0.5;
    torus.rotation.x = elapsedTime * 0.6;
    torus.rotation.y = elapsedTime * 0.4;

    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(animationFrameId);
    boxGeo.dispose();
    boxMat.dispose();
    sphereGeo.dispose();
    sphereMat.dispose();
    torusGeo.dispose();
    torusMat.dispose();
    lightMarkerGeo.dispose();
    lightMarkerMat.dispose();
    gridHelper.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}

