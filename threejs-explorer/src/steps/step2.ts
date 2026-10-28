import * as THREE from 'three';

/**
 * Step 2: Add a sphere and torus with different materials.
 * 
 * Core concepts introduced:
 * - Geometries: SphereGeometry, TorusGeometry.
 * - Materials compared:
 *   1. MeshLambertMaterial: Non-shiny diffuse shading. Fast, good for matte surfaces (wood, matte stone).
 *   2. MeshPhongMaterial: Glossy surface with sharp specular highlights (plastic, glazed ceramic).
 *   3. MeshStandardMaterial: Physically Based Rendering (PBR) using metallic-roughness model (gold, chrome, satin).
 * - Spatial arrangement: Translating meshes along the X axis using mesh.position.x.
 */
export function setupStep2(container: HTMLElement): () => void {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // We add basic illumination so illuminated materials are visible
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 1. Box with MeshLambertMaterial (matte diffuse)
  const boxGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.x = -2.6;
  scene.add(box);

  // 2. Sphere with MeshPhongMaterial (glossy with specular highlight)
  const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xec4899,
    shininess: 90,
    specular: 0xffffff,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.x = 0;
  scene.add(sphere);

  // 3. Torus with MeshStandardMaterial (PBR metallic & roughness)
  const torusGeometry = new THREE.TorusGeometry(0.7, 0.25, 24, 48);
  const torusMaterial = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    metalness: 0.8,
    roughness: 0.2,
  });
  const torus = new THREE.Mesh(torusGeometry, torusMaterial);
  torus.position.x = 2.6;
  scene.add(torus);

  // Render loop: rotate all 3 objects
  let animationFrameId: number;
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    sphere.rotation.y += 0.015;

    torus.rotation.x += 0.015;
    torus.rotation.y += 0.01;

    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(animationFrameId);
    boxGeometry.dispose();
    boxMaterial.dispose();
    sphereGeometry.dispose();
    sphereMaterial.dispose();
    torusGeometry.dispose();
    torusMaterial.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}

