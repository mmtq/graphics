import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface ExplorerCallbacks {
  onSelect?: (mesh: THREE.Mesh | null) => void;
}

/**
 * Step 6: Make the canvas responsive and clean up resources correctly.
 * 
 * Core concepts introduced:
 * 1. Responsive Viewport Handling:
 *    - On resize, update camera.aspect = width / height.
 *    - MUST call camera.updateProjectionMatrix() so the new aspect ratio
 *      recalculates the frustum transformation matrix.
 *    - Call renderer.setSize(width, height).
 *    - Cap pixel ratio: Math.min(window.devicePixelRatio, 2) to maintain sharp text
 *      while avoiding 4K GPU rendering penalties on mobile/Retina screens.
 * 2. Proper WebGL / Three.js Resource Disposal:
 *    - WebGL is an external C/GPU state machine. VRAM allocations for geometries,
 *      textures, and materials are NOT freed by JavaScript's garbage collector.
 *    - Proper cleanup protocol:
 *      a) cancelAnimationFrame() to stop the render loop.
 *      b) Remove all DOM event listeners (resize, pointer events).
 *      c) Traverse the scene graph and invoke .dispose() on every geometry & material.
 *      d) Dispose OrbitControls and WebGLRenderer.
 *      e) Remove canvas from DOM.
 */
export function setupStep6(
  container: HTMLElement,
  callbacks?: ExplorerCallbacks,
  colorInput?: HTMLInputElement
): () => void {
  // 1. Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1120);

  // 2. Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(4, 3.5, 6);

  // 3. Renderer with antialiasing and capped pixel ratio
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 4. OrbitControls with smooth damping
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 25;
  controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent camera sinking under the floor
  controls.target.set(0, 0, 0);

  // 5. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 8, 4);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  // Subtle colored point light
  const accentLight = new THREE.PointLight(0x38bdf8, 1.5, 12);
  accentLight.position.set(0, 2, 0);
  scene.add(accentLight);

  // 6. Visual Grounding Helpers
  const gridHelper = new THREE.GridHelper(12, 12, 0x334155, 0x1e293b);
  gridHelper.position.y = -1;
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(1.5);
  axesHelper.position.set(-4, -0.99, -4);
  scene.add(axesHelper);

  // 7. Interactive Meshes
  const selectableMeshes: THREE.Mesh[] = [];

  // Cube
  const cubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const cubeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.25,
    metalness: 0.1,
  });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.name = 'Cube (BoxGeometry)';
  cube.position.set(-2.4, 0, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);
  selectableMeshes.push(cube);

  // Sphere
  const sphereGeo = new THREE.SphereGeometry(0.75, 48, 48);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    roughness: 0.15,
    metalness: 0.6,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.name = 'Sphere (SphereGeometry)';
  sphere.position.set(0, 0, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);
  selectableMeshes.push(sphere);

  // Torus
  const torusGeo = new THREE.TorusGeometry(0.65, 0.22, 32, 64);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.8,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.name = 'Torus (TorusGeometry)';
  torus.position.set(2.4, 0, 0);
  torus.castShadow = true;
  torus.receiveShadow = true;
  scene.add(torus);
  selectableMeshes.push(torus);

  // 8. Selection State & Raycasting
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedMesh: THREE.Mesh | null = null;
  const originalEmissive = new THREE.Color(0x000000);

  let pointerDownPos = { x: 0, y: 0 };

  const onPointerDown = (event: PointerEvent) => {
    pointerDownPos = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent) => {
    // Avoid triggering selection when dragging to rotate the camera
    const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
    if (dist > 5) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(selectableMeshes, false);

    // Reset old selection
    if (selectedMesh) {
      const mat = selectedMesh.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(originalEmissive);
    }

    if (hits.length > 0) {
      selectedMesh = hits[0].object as THREE.Mesh;
      const mat = selectedMesh.material as THREE.MeshStandardMaterial;
      originalEmissive.copy(mat.emissive);
      // Visual feedback: luminous highlight
      mat.emissive.setHex(0x3b82f6);
      mat.emissiveIntensity = 0.5;

      if (colorInput) {
        colorInput.disabled = false;
        colorInput.value = `#${mat.color.getHexString()}`;
      }
      callbacks?.onSelect?.(selectedMesh);
    } else {
      selectedMesh = null;
      if (colorInput) {
        colorInput.disabled = true;
      }
      callbacks?.onSelect?.(null);
    }
  };

  const onColorInput = () => {
    if (selectedMesh && colorInput) {
      const mat = selectedMesh.material as THREE.MeshStandardMaterial;
      mat.color.set(colorInput.value);
    }
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  if (colorInput) {
    colorInput.addEventListener('input', onColorInput);
  }

  // 9. Responsive Resize Handler
  const onResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener('resize', onResize);

  // 10. Render Loop
  let animationFrameId: number;
  let clock = new THREE.Clock();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Gentle idle rotation for all objects
    cube.rotation.x += delta * 0.4;
    cube.rotation.y += delta * 0.5;

    sphere.rotation.y += delta * 0.3;

    torus.rotation.x += delta * 0.5;
    torus.rotation.y += delta * 0.3;

    // OrbitControls damping update
    controls.update();

    renderer.render(scene, camera);
  };

  animate();

  // 11. Complete Cleanup Routine
  return () => {
    // A. Halt render loop
    cancelAnimationFrame(animationFrameId);

    // B. Detach event listeners
    window.removeEventListener('resize', onResize);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    if (colorInput) {
      colorInput.removeEventListener('input', onColorInput);
    }

    // C. Dispose controls
    controls.dispose();

    // D. Traverse scene and release GPU resources (VRAM)
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });

    gridHelper.dispose();
    axesHelper.dispose();

    // E. Dispose renderer and remove canvas
    renderer.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  };
}

