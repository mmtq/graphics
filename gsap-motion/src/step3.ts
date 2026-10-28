import gsap from 'gsap';

/**
 * STEP 3: Experiment with Different Easing Functions
 *
 * Ease determines the acceleration and deceleration rate over time.
 * Standard format: "<type>.<direction>"
 * - Direction: "in" (starts slow), "out" (ends slow - best for UI), "inOut" (slow both ends)
 * - Types: power1 through power4, back, bounce, elastic, steps(n), none
 */
export function setupStep3(): void {
  const box = document.querySelector<HTMLElement>('#box-easing');
  const easeSelect = document.querySelector<HTMLSelectElement>('#select-ease');
  const codeSnippet = document.querySelector<HTMLElement>('#snippet-ease');
  const playBtn = document.querySelector<HTMLButtonElement>('#btn-run-ease');
  const resetBtn = document.querySelector<HTMLButtonElement>('#btn-reset-ease');

  if (!box || !easeSelect || !codeSnippet || !playBtn || !resetBtn) return;

  const updateSnippet = () => {
    const ease = easeSelect.value;
    codeSnippet.textContent = `gsap.to("#box-easing", { x: 240, duration: 1.4, ease: "${ease}" });`;
  };

  easeSelect.addEventListener('change', updateSnippet);
  updateSnippet();

  playBtn.addEventListener('click', () => {
    const selectedEase = easeSelect.value;

    // Reset to start before running selected ease
    gsap.set(box, { x: 0 });

    gsap.to(box, {
      x: 240,
      duration: 1.4,
      ease: selectedEase,
    });
  });

  resetBtn.addEventListener('click', () => {
    gsap.to(box, {
      x: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  });
}

