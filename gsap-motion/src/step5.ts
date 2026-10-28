import gsap from 'gsap';

/**
 * STEP 5: Add Play, Pause, Reverse, and Restart Controls
 *
 * GSAP Timelines and Tweens are full playback control objects.
 * Methods:
 * - tl.play()      : plays forward from current position
 * - tl.pause()     : freezes playhead at current time
 * - tl.reverse()   : plays in reverse towards time 0
 * - tl.restart()   : resets playhead to 0 and plays forward
 * - tl.timeScale() : adjusts playback speed (e.g. 0.5 = slow mo, 2 = 2x speed)
 * - tl.progress()  : gets or sets current progress from 0.0 to 1.0
 */
export function setupStep5(): void {
  const btnPlay = document.querySelector<HTMLButtonElement>('#btn-ctrl-play');
  const btnPause = document.querySelector<HTMLButtonElement>('#btn-ctrl-pause');
  const btnReverse = document.querySelector<HTMLButtonElement>('#btn-ctrl-reverse');
  const btnRestart = document.querySelector<HTMLButtonElement>('#btn-ctrl-restart');
  const speedSelect = document.querySelector<HTMLSelectElement>('#select-speed');

  const progressSlider = document.querySelector<HTMLInputElement>('#slider-progress');
  const timeDisplay = document.querySelector<HTMLElement>('#display-time');
  const stateDisplay = document.querySelector<HTMLElement>('#display-state');

  const disc1 = document.querySelector<HTMLElement>('#ctrl-disc-1');
  const disc2 = document.querySelector<HTMLElement>('#ctrl-disc-2');
  const disc3 = document.querySelector<HTMLElement>('#ctrl-disc-3');

  if (!disc1 || !disc2 || !disc3 || !progressSlider || !timeDisplay || !stateDisplay) {
    return;
  }

  // Create a paused master timeline
  const tl = gsap.timeline({
    paused: true,
    onUpdate: () => {
      // Sync slider and time labels with GSAP's internal playhead
      const prog = tl.progress();
      progressSlider.value = (prog * 100).toFixed(1);
      timeDisplay.textContent = `${tl.time().toFixed(2)}s / ${tl.duration().toFixed(2)}s (${Math.round(prog * 100)}%)`;
    },
    onComplete: () => {
      stateDisplay.textContent = 'Completed';
    },
    onReverseComplete: () => {
      stateDisplay.textContent = 'At Start';
    },
  });

  // Build an engaging multi-element animation sequence
  tl.to(disc1, {
    x: 200,
    backgroundColor: '#ec4899',
    borderRadius: '12px',
    duration: 1,
    ease: 'power2.inOut',
  })
    .to(
      disc2,
      {
        x: 200,
        rotation: 360,
        backgroundColor: '#8b5cf6',
        scale: 1.25,
        duration: 1,
        ease: 'power2.inOut',
      },
      '<0.2'
    )
    .to(
      disc3,
      {
        x: 200,
        backgroundColor: '#06b6d4',
        borderRadius: '50%',
        duration: 1,
        ease: 'power2.inOut',
      },
      '<0.2'
    );

  // Wire up control buttons
  btnPlay?.addEventListener('click', () => {
    tl.play();
    stateDisplay.textContent = 'Playing ▶';
  });

  btnPause?.addEventListener('click', () => {
    tl.pause();
    stateDisplay.textContent = 'Paused ⏸';
  });

  btnReverse?.addEventListener('click', () => {
    tl.reverse();
    stateDisplay.textContent = 'Reversing ◀';
  });

  btnRestart?.addEventListener('click', () => {
    tl.restart();
    stateDisplay.textContent = 'Playing ▶';
  });

  // Speed changer
  speedSelect?.addEventListener('change', () => {
    const speed = parseFloat(speedSelect.value);
    tl.timeScale(speed);
  });

  // Interactive scrubber: user drags slider to scrub timeline frame-by-frame
  progressSlider.addEventListener('input', () => {
    tl.pause();
    stateDisplay.textContent = 'Scrubbing 🔍';
    const progress = parseFloat(progressSlider.value) / 100;
    tl.progress(progress);
  });
}

