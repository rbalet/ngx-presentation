export function observeMetricReveal(played: Set<string>) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>('#chapter-01 .metric-card'), (card, index) => {
    const logo = card.querySelector<HTMLImageElement>('.metric-logo')!;
    const chart = card.querySelector<HTMLImageElement>('.metric-history')!;
    const counter = card.querySelector<HTMLElement>('[data-count-to]')!;
    const total = Number(counter.dataset.countTo);
    const formattedTotal = counter.textContent!;
    const animations: Animation[] = [];
    let frame = 0;

    if (!played.has(chart.src)) card.dataset.revealPending = '';

    function finish() {
      cancelAnimationFrame(frame);
      counter.textContent = formattedTotal;
      for (const animation of animations) animation.finish();
    }

    function reveal() {
      if (index !== played.size) return;
      played.add(chart.src);
      const from = logo.getBoundingClientRect();
      delete card.dataset.revealPending;
      if (reducedMotion.matches) return;

      const to = logo.getBoundingClientRect();
      const x = from.x - to.x;
      const y = from.y - to.y;
      const scale = from.width / to.width;
      animations.push(logo.animate([
        { transform: `translate(${x}px, ${y}px) rotate(0deg) scale(${scale})`, offset: 0, easing: 'ease-out' },
        { transform: `translate(${x - 12}px, ${y + 10}px) rotate(-8deg) scale(${scale * 1.04})`, offset: 0.24, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        { transform: 'translate(3px, -2px) rotate(4deg) scale(0.96)', offset: 0.8, easing: 'ease-in-out' },
        { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', offset: 1 },
      ], { duration: 620 }));
      for (const content of card.children) {
        if (content === logo || content === chart) continue;
        animations.push(content.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 180,
        }));
      }
      animations.push(chart.animate([
        { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' },
      ], { duration: 900, easing: 'ease-out' }));

      counter.textContent = '0';
      const start = performance.now();
      function count(now: number) {
        const progress = Math.max(0, Math.min((now - start) / 1800, 1));
        counter.textContent = Math.floor(total * (1 - (1 - progress) ** 4)).toLocaleString('en-US');
        if (progress < 1) frame = requestAnimationFrame(count);
      }
      frame = requestAnimationFrame(count);
    }

    for (const event of ['pointerenter', 'focusin', 'click']) {
      card.addEventListener(event, reveal, { signal: controller.signal });
    }
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) finish();
    }, { signal: controller.signal });
    return () => {
      finish();
      for (const animation of animations) animation.cancel();
      delete card.dataset.revealPending;
    };
  });

  return () => {
    controller.abort();
    for (const cleanup of cleanups) cleanup();
  };
}
