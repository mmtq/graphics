import gsap from 'gsap';

/**
 * STEP 2: Compare gsap.to(), gsap.from(), and gsap.fromTo()
 *
 * - gsap.to(target, toVars):
 *     Animates FROM the element's current state TO the specified values.
 * - gsap.from(target, fromVars):
 *     Animates FROM the specified values TO the element's current state.
 * - gsap.fromTo(target, fromVars, toVars):
 *     Explicitly defines BOTH starting and ending values, ignoring current state.
 */
export function setupStep2(): void {
  const toBox = document.querySelector<HTMLElement>('#box-to');
  const fromBox = document.querySelector<HTMLElement>('#box-from');
  const fromToBox = document.querySelector<HTMLElement>('#box-fromto');

  const btnTo = document.querySelector<HTMLButtonElement>('#btn-run-to');
  const btnFrom = document.querySelector<HTMLButtonElement>('#btn-run-from');
  const btnFromTo = document.querySelector<HTMLButtonElement>('#btn-run-fromto');
  const btnReset = document.querySelector<HTMLButtonElement>('#btn-step2-reset');

  if (!toBox || !fromBox || !fromToBox) return;

  // 1. gsap.to() - Moves forward from wherever it is right now
  const runTo = () => {
    gsap.to(toBox, {
      x: 180,
      rotation: 180,
      duration: 1,
      ease: 'power2.out',
    });
  };

  // 2. gsap.from() - Starts at specified values and animates back to normal CSS state
  const runFrom = () => {
    gsap.from(fromBox, {
      x: 180,
      opacity: 0.1,
      rotation: -180,
      duration: 1,
      ease: 'power2.out',
    });
  };

  // 3. gsap.fromTo() - Completely controls both start and destination
  const runFromTo = () => {
    gsap.fromTo(
      fromToBox,
      { x: -30, opacity: 0.2, scale: 0.6, rotation: 0 },
      { x: 180, opacity: 1, scale: 1, rotation: 360, duration: 1, ease: 'back.out(1.7)' }
    );
  };

  btnTo?.addEventListener('click', runTo);
  btnFrom?.addEventListener('click', runFrom);
  btnFromTo?.addEventListener('click', runFromTo);

  btnReset?.addEventListener('click', () => {
    // Reset all boxes cleanly
    gsap.to([toBox, fromBox, fromToBox], {
      x: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'power1.out',
    });
  });
}

