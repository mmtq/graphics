import './style.css';
import { setupTabs } from './tabs';
import { setupStep1 } from './step1';
import { setupStep2 } from './step2';
import { setupStep3 } from './step3';
import { setupStep4 } from './step4';
import { setupStep5 } from './step5';

// Initialize tabs and all learning steps when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupStep1();
  setupStep2();
  setupStep3();
  setupStep4();
  setupStep5();
});
