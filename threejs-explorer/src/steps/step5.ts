import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Step 5: Let the user select an object and change its color.
 * 
 * Core concepts introduced:
 * - Raycasting:
 *   How 2D screen clicks select 3D objects:
 *   1. Screen coordinates (pixels) -> Normalized Device Coordinates (NDC: [-1, +1]).
 *      Formula:
 *        ndc.x = (clientX / width) * 2 - 1
 *        ndc.y = -(clientY / height) * 2 + 1  (Y is inverted in WebGL)
 *   2. raycaster.setFromCamera(ndc, camera) fires a mathematical ray from the camera.
 *   3. raycaster.intersectObjects() returns all intersected objects sorted by proximity.
 * - Selection State:
 *   Highlighting the active mesh using material.emissive.
 * - Dynamic Material Modification:
 *   mesh.material.color.set(hex) dynamically updates WebGL uniform colors.
 */
export function setupStep5(
  container: HTMLElement,
  onSelect?: (mesh: THREE.Mesh | null) => void,
  colorInput?: HTMLInputElement
): () => void {
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

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 8, 4);
  scene.add(dirLight);

  scene.add(new THREE.GridHelper(10, 10, 0x334155, 0x1e293b));

  // Meshes
  const meshes: THREE.Mesh[] = [];

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 })
  );
  box.name = 'Blue Cube';
  box.position.x = -2.2;
  scene.add(box);
  meshes.push(box);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2 })
  );
  sphere.name = 'Pink Sphere';
  sphere.position.x = 0;
  scene.add(sphere);
  meshes.push(sphere);

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.25, 24, 48),
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2, metalness: 0.7 })
  );
  torus.name = 'Gold Torus';
  torus.position.x = 2.2;
  scene.add(torus);
  meshes.push(torus);

  // Selection & Raycasting
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedMesh: THREE.Mesh | null = null;
  let originalEmissive = new THREE.Color(0x000000);

  // Track pointer down/up to distinguish deliberate clicks from camera drag orbits
  let pointerDownPos = { x: 0, y: 0 };

  const onPointerDown = (event: PointerEvent) => {
    pointerDownPos = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent) => {
    // Only register as click if mouse didn't drag camera
    const dx = Math.abs(event.clientX - pointerDownPos.x);
    const dy = Math.abs(event.clientY - pointerDownPos.y);
    if (dx > 4 || dy > 4) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshes, false);

    // Reset previous selection emissive highlight
    if (selectedMesh) {
      const mat = selectedMesh.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(originalEmissive);
    }

    if (intersects.length > 0) {
      selectedMesh = intersects[0].object as THREE.Mesh;
      const mat = selectedMesh.material as THREE.MeshStandardMaterial;
      originalEmissive.copy(mat.emissive);
      // Give the selected object an emissive highlight glow
      mat.emissive.setHex(0x444444);

      if (colorInput) {
        colorInput.disabled = false;
        colorInput.value = `#${mat.color.getHexString()}`;
      }
      onSelect?.(selectedMesh);
    } else {
      selectedMesh = null;
      if (colorInput) {
        colorInput.disabled = true;
      }
      onSelect?.(null);
    }
  };

  // Connect color picker change event
  const onColorChange = () => {
    if (selectedMesh && colorInput) {
      const mat = selectedMesh.material as THREE.MeshStandardMaterial;
      mat.color.set(colorInput.value);
    }
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  if (colorInput) {
    colorInput.addEventListener('input', onColorChange);
  }

  // Render loop
  let animationFrameId: number;
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(animationFrameId);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    if (colorInput) {
      colorInput.removeEventListener('input', onColorChange);
    }
    controls.dispose();
    meshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}

