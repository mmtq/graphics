import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Step 4: Add camera orbit controls.
 * 
 * Core concepts introduced:
 * - OrbitControls: Transforms mouse/touch gestures into spherical camera orbit coordinates.
 *   - Left Click + Drag: Rotate around the target point.
 *   - Right Click + Drag: Pan the camera and target laterally.
 *   - Mouse Wheel / Pinch: Zoom in and out along the viewing vector.
 * - Damping (Inertia): Smooths camera movement by adding momentum.
 *   - Crucial rule: controls.enableDamping = true requires controls.update()
 *     to be called every frame in the render loop!
 * - Target: controls.target defines what point in 3D space the camera orbits around.
 */
export function setupStep4(container: HTMLElement): () => void {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(3, 4, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Initialize OrbitControls attached to camera and canvas element
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 20;
  controls.target.set(0, 0, 0);

  // Lights & helpers
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 8, 4);
  scene.add(dirLight);

  const gridHelper = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b);
  gridHelper.position.y = -1;
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(2);
  scene.add(axesHelper);

  // Meshes
  const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.x = -2.2;
  scene.add(box);

  const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2 });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.x = 0;
  scene.add(sphere);

  const torusGeo = new THREE.TorusGeometry(0.7, 0.25, 24, 48);
  const torusMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2, metalness: 0.7 });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.x = 2.2;
  scene.add(torus);

  // Render loop
  let animationFrameId: number;
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    // Update controls every frame when damping is enabled
    controls.update();

    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(animationFrameId);
    controls.dispose();
    boxGeo.dispose();
    boxMat.dispose();
    sphereGeo.dispose();
    sphereMat.dispose();
    torusGeo.dispose();
    torusMat.dispose();
    gridHelper.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}

