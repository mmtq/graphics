import type * as THREE from 'three';
import { setupStep1 } from './steps/step1.ts';
import { setupStep2 } from './steps/step2.ts';
import { setupStep3 } from './steps/step3.ts';
import { setupStep4 } from './steps/step4.ts';
import { setupStep5 } from './steps/step5.ts';
import { setupStep6 } from './steps/step6.ts';

const container = document.getElementById('canvas-container') as HTMLElement;
const stepSelector = document.getElementById('step-selector') as HTMLSelectElement;
const stepDescription = document.getElementById('step-description') as HTMLDivElement;
const selectedBadge = document.getElementById('selected-badge') as HTMLDivElement;
const colorInput = document.getElementById('object-color') as HTMLInputElement;
const instructionsBox = document.getElementById('instructions-box') as HTMLDivElement;
const interactivePanel = document.getElementById('interactive-panel') as HTMLDivElement;

const STEP_INFO: Record<string, { desc: string; controls: string; interactive: boolean }> = {
  '1': {
    desc: 'Step 1: Single cube rendered with BoxGeometry, MeshBasicMaterial, and PerspectiveCamera in a requestAnimationFrame loop.',
    controls: '• Mesh automatically rotates on X and Y axes.',
    interactive: false,
  },
  '2': {
    desc: 'Step 2: Multiple objects (Cube, Sphere, Torus) comparing MeshLambertMaterial (matte), MeshPhongMaterial (glossy), and MeshStandardMaterial (PBR).',
    controls: '• Meshes animate in place with basic ambient & directional illumination.',
    interactive: false,
  },
  '3': {
    desc: 'Step 3: Multi-light setup (Ambient, Directional, and an orbiting PointLight) positioned in Three.js right-handed 3D space with AxesHelper and GridHelper.',
    controls: '• Watch the blue point light orbit the 3 geometries.',
    interactive: false,
  },
  '4': {
    desc: 'Step 4: Camera OrbitControls enabled with smooth damping inertia.',
    controls: '• Left click + drag: Orbit around center<br />• Right click + drag: Pan<br />• Scroll: Zoom in/out',
    interactive: false,
  },
  '5': {
    desc: 'Step 5: Raycasting converts 2D mouse clicks into 3D intersection tests to select an object and modify its color.',
    controls: '• Click any object to select it<br />• Use color input to change color<br />• Orbit camera controls active',
    interactive: true,
  },
  '6': {
    desc: 'Step 6: Complete responsive object explorer with window resize recalculations and full GPU memory disposal on cleanup.',
    controls: '• Click any object to select and edit its color<br />• Left click: Orbit, Right click: Pan, Wheel: Zoom<br />• Responsive resize + shadow maps enabled',
    interactive: true,
  },
};

let currentCleanup: (() => void) | null = null;

function loadStep(stepNumber: string) {
  // 1. Clean up prior step (tests resource disposal every time you switch!)
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // 2. Reset UI state
  const info = STEP_INFO[stepNumber] || STEP_INFO['6'];
  stepDescription.innerHTML = info.desc;
  instructionsBox.innerHTML = `<strong>Controls:</strong><br />${info.controls}`;
  interactivePanel.style.display = info.interactive ? 'block' : 'none';
  selectedBadge.textContent = 'Selected: None';
  selectedBadge.classList.remove('active');
  colorInput.disabled = true;

  const onSelect = (mesh: THREE.Mesh | null) => {
    if (mesh) {
      selectedBadge.textContent = `Selected: ${mesh.name || 'Mesh'}`;
      selectedBadge.classList.add('active');
    } else {
      selectedBadge.textContent = 'Selected: None';
      selectedBadge.classList.remove('active');
    }
  };

  // 3. Mount selected step
  switch (stepNumber) {
    case '1':
      currentCleanup = setupStep1(container);
      break;
    case '2':
      currentCleanup = setupStep2(container);
      break;
    case '3':
      currentCleanup = setupStep3(container);
      break;
    case '4':
      currentCleanup = setupStep4(container);
      break;
    case '5':
      currentCleanup = setupStep5(container, onSelect, colorInput);
      break;
    case '6':
    default:
      currentCleanup = setupStep6(container, { onSelect }, colorInput);
      break;
  }
}

stepSelector.addEventListener('change', () => {
  loadStep(stepSelector.value);
});

// Initial boot with Step 6 (or whatever is selected in dropdown)
loadStep(stepSelector.value);

