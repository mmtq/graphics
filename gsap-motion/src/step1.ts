import gsap from 'gsap';

/**
 * STEP 1: Animate a Single Box
 *
 * Key method: gsap.to(target, vars)
 * - target: CSS selector string or DOM element
 * - vars: Object containing properties to animate (x, y, rotation, scale, duration, ease, etc.)
 */
export function setupStep1(): void {
  const box = document.querySelector<HTMLElement>('#box-1');
  const playBtn = document.querySelector<HTMLButtonElement>('#btn-step1-play');
  const resetBtn = document.querySelector<HTMLButtonElement>('#btn-step1-reset');

  if (!box || !playBtn || !resetBtn) return;

  playBtn.addEventListener('click', () => {
    // Animate the box to new transform and style values
    gsap.to(box, {
      x: 220,
      rotation: 360,
      scale: 1.5,
      backgroundColor: '#f59e0b',
      duration: 2,
      ease: 'bounce.inOut',
    });
  });

  resetBtn.addEventListener('click', () => {
    // Reset back to original position
    gsap.to(box, {
      x: 0,
      rotation: 0,
      scale: 1,
      backgroundColor: '#3b82f6',
      duration: 0.6,
      ease: 'power1.inOut',
    });
  });
}

