/**
 * Tab switching controller for the GSAP Playground.
 * Supports per-card [Visual | Theory] toggles as well as global batch switching.
 */
export function setupTabs(): void {
  // 1. Per-card tab switching
  const tabGroups = document.querySelectorAll<HTMLElement>('.tab-group');

  tabGroups.forEach((group) => {
    const card = group.closest<HTMLElement>('.card');
    if (!card) return;

    const buttons = group.querySelectorAll<HTMLButtonElement>('.tab-btn');
    const visualContent = card.querySelector<HTMLElement>('.tab-content-visual');
    const theoryContent = card.querySelector<HTMLElement>('.tab-content-theory');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Update active tab button
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Toggle content panels
        if (targetTab === 'visual') {
          visualContent?.classList.add('active');
          theoryContent?.classList.remove('active');
        } else if (targetTab === 'theory') {
          visualContent?.classList.remove('active');
          theoryContent?.classList.add('active');
        }
      });
    });
  });

  // 2. Global batch toggle (All Visual / All Theory)
  const globalVisualBtn = document.querySelector<HTMLButtonElement>('#global-btn-visual');
  const globalTheoryBtn = document.querySelector<HTMLButtonElement>('#global-btn-theory');

  const setGlobalTab = (tab: 'visual' | 'theory') => {
    if (tab === 'visual') {
      globalVisualBtn?.classList.add('active');
      globalTheoryBtn?.classList.remove('active');
    } else {
      globalTheoryBtn?.classList.add('active');
      globalVisualBtn?.classList.remove('active');
    }

    document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
      const visualContent = card.querySelector<HTMLElement>('.tab-content-visual');
      const theoryContent = card.querySelector<HTMLElement>('.tab-content-theory');
      const visualBtn = card.querySelector<HTMLButtonElement>('.tab-btn[data-tab="visual"]');
      const theoryBtn = card.querySelector<HTMLButtonElement>('.tab-btn[data-tab="theory"]');

      if (tab === 'visual') {
        visualContent?.classList.add('active');
        theoryContent?.classList.remove('active');
        visualBtn?.classList.add('active');
        theoryBtn?.classList.remove('active');
      } else {
        visualContent?.classList.remove('active');
        theoryContent?.classList.add('active');
        visualBtn?.classList.remove('active');
        theoryBtn?.classList.add('active');
      }
    });
  };

  globalVisualBtn?.addEventListener('click', () => setGlobalTab('visual'));
  globalTheoryBtn?.addEventListener('click', () => setGlobalTab('theory'));
}

