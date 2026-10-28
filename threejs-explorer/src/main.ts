import type * as THREE from 'three';
import { setupStep1 } from './steps/step1.ts';
import { setupStep2 } from './steps/step2.ts';
import { setupStep3 } from './steps/step3.ts';
import { setupStep4 } from './steps/step4.ts';
import { setupStep5 } from './steps/step5.ts';
import { setupStep6 } from './steps/step6.ts';
import { STEP_THEORY, GENERAL_THEORY } from './theory.ts';

// DOM Elements - Explorer UI
const container = document.getElementById('canvas-container') as HTMLElement;
const stepSelector = document.getElementById('step-selector') as HTMLSelectElement;
const stepDescription = document.getElementById('step-description') as HTMLDivElement;
const selectedBadge = document.getElementById('selected-badge') as HTMLDivElement;
const colorInput = document.getElementById('object-color') as HTMLInputElement;
const instructionsBox = document.getElementById('instructions-box') as HTMLDivElement;
const interactivePanel = document.getElementById('interactive-panel') as HTMLDivElement;

// DOM Elements - Modal & Theory
const btnOpenStepTheory = document.getElementById('btn-open-step-theory') as HTMLButtonElement;
const btnOpenGeneralTheory = document.getElementById('btn-open-general-theory') as HTMLButtonElement;
const modalBackdrop = document.getElementById('theory-modal-backdrop') as HTMLDivElement;
const btnCloseModal = document.getElementById('btn-close-modal') as HTMLButtonElement;
const modalTitle = document.getElementById('modal-title') as HTMLHeadingElement;
const modalBadge = document.getElementById('modal-badge') as HTMLSpanElement;
const modalContent = document.getElementById('modal-content') as HTMLDivElement;
const tabStepTheory = document.getElementById('tab-step-theory') as HTMLButtonElement;
const tabGeneralTheory = document.getElementById('tab-general-theory') as HTMLButtonElement;

type ModalTab = 'step' | 'general';
let currentTab: ModalTab = 'step';
let currentGeneralTopic: string = 'scenegraph';

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
let currentStepNumber = '6';

function loadStep(stepNumber: string) {
  currentStepNumber = stepNumber;

  // 1. Clean up prior step
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

  btnOpenStepTheory.textContent = `📖 Step ${stepNumber} Theory`;

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

  // If modal is currently open on step theory, refresh its content
  if (modalBackdrop.classList.contains('open') && currentTab === 'step') {
    renderModalContent();
  }
}

stepSelector.addEventListener('change', () => {
  loadStep(stepSelector.value);
});

// --------------------------------------------------------------------------
// Theory Modal Management
// --------------------------------------------------------------------------

function openModal(tab: ModalTab = 'step') {
  currentTab = tab;
  modalBackdrop.classList.add('open');
  renderModalContent();
}

function closeModal() {
  modalBackdrop.classList.remove('open');
}

function updateTabButtons() {
  tabStepTheory.classList.toggle('active', currentTab === 'step');
  tabGeneralTheory.classList.toggle('active', currentTab === 'general');
}

function renderModalContent() {
  updateTabButtons();

  if (currentTab === 'step') {
    const theory = STEP_THEORY[currentStepNumber] || STEP_THEORY['6'];
    modalTitle.textContent = theory.title;
    modalBadge.textContent = theory.badge;
    modalContent.innerHTML = `
      <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 16px;">
        ${theory.summary}
      </p>
      ${theory.contentHtml}
    `;
  } else if (currentTab === 'general') {
    const topics: { id: string; label: string }[] = [
      { id: 'scenegraph', label: 'Scene Graph' },
      { id: 'coordinates', label: 'Coordinate System' },
      { id: 'camera', label: 'Camera & Frustum' },
      { id: 'materials', label: 'Materials & Shaders' },
      { id: 'lighting', label: 'Lighting & Shadows' },
      { id: 'renderloop', label: 'Render Loop & GPU' },
    ];

    const currentTopicData = GENERAL_THEORY[currentGeneralTopic] || GENERAL_THEORY['scenegraph'];
    modalTitle.textContent = currentTopicData.title;
    modalBadge.textContent = currentTopicData.badge;

    let pillsHtml = '<div class="pill-bar">';
    topics.forEach((t) => {
      const activeClass = t.id === currentGeneralTopic ? ' active' : '';
      pillsHtml += `<button class="pill-btn${activeClass}" data-topic="${t.id}">${t.label}</button>`;
    });
    pillsHtml += '</div>';

    modalContent.innerHTML = `
      ${pillsHtml}
      <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 16px;">
        ${currentTopicData.summary}
      </p>
      ${currentTopicData.contentHtml}
    `;

    modalContent.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const topicId = target.getAttribute('data-topic');
        if (topicId) {
          currentGeneralTopic = topicId;
          renderModalContent();
        }
      });
    });
  }
}

// Modal Event Listeners
btnOpenStepTheory.addEventListener('click', () => openModal('step'));
btnOpenGeneralTheory.addEventListener('click', () => openModal('general'));
btnCloseModal.addEventListener('click', closeModal);

modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) {
    closeModal();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
    closeModal();
  }
});

tabStepTheory.addEventListener('click', () => {
  currentTab = 'step';
  renderModalContent();
});

tabGeneralTheory.addEventListener('click', () => {
  currentTab = 'general';
  renderModalContent();
});

// Initial boot
loadStep(stepSelector.value);
