import gsap from 'gsap';

/**
 * STEP 4: Build a Timeline with Overlapping Animations and Stagger
 *
 * - gsap.timeline(): Container for sequencing tweens without manual delay calculations.
 * - Position Parameter: Controls when a tween starts relative to others.
 *     - (omitted): Starts immediately after previous tween ends.
 *     - "<": Starts at the exact same time as previous tween.
 *     - "<0.2": Starts 0.2s after previous tween starts (overlapping!).
 *     - "-=0.3": Starts 0.3s before previous tween finishes.
 * - stagger: Animates a collection of elements with a sequential offset.
 */
export function setupStep4(): void {
  const playBtn = document.querySelector<HTMLButtonElement>('#btn-run-timeline');
  const resetBtn = document.querySelector<HTMLButtonElement>('#btn-reset-timeline');

  if (!playBtn || !resetBtn) return;

  const playSequence = () => {
    // Create a new timeline with shared defaults
    const tl = gsap.timeline({
      defaults: {
        duration: 0.5,
        ease: 'power2.out',
      },
    });

    // Reset everything first
    tl.set(['#tl-badge', '#tl-title', '.tl-item', '#tl-btn'], {
      clearProps: 'all',
    });

    // 1. Badge slides in from the left
    tl.from('#tl-badge', {
      x: -40,
      opacity: 0,
    })
      // 2. Title slides up, overlapping: starts 0.2s after the badge animation begins
      .from(
        '#tl-title',
        {
          y: 20,
          opacity: 0,
        },
        '<0.2' // Position parameter: overlap with previous
      )
      // 3. Staggered tags pop in one by one with a bounce
      .from(
        '.tl-item',
        {
          scale: 0,
          opacity: 0,
          stagger: 0.1, // 100ms offset between each item
          ease: 'back.out(1.8)',
        },
        '-=0.15' // Starts 0.15s before the title animation fully finishes
      )
      // 4. Action button slides up
      .from(
        '#tl-btn',
        {
          y: 15,
          opacity: 0,
        },
        '<0.2'
      );
  };

  playBtn.addEventListener('click', playSequence);

  resetBtn.addEventListener('click', () => {
    gsap.set(['#tl-badge', '#tl-title', '.tl-item', '#tl-btn'], {
      clearProps: 'all',
    });
  });
}

