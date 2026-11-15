// The outer curves meet the middle chart at its linear reveal speed.
const revealTimings = [
  { duration: 500, easing: 'cubic-bezier(0.2, 0, 0.6, 0.5)' },
  { duration: 400, easing: 'linear' },
  { duration: 500, easing: 'cubic-bezier(0.4, 0.5, 0.8, 1)' },
];

export function observeMetricReveal(played: Set<string>) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const charts = Array.from(
    document.querySelectorAll<HTMLImageElement>('#chapter-01 .metric-history'),
    (chart, index) => ({ chart, card: chart.parentElement!, timing: revealTimings[index] }),
  ).filter(({ chart }) => !played.has(chart.src));
  const visible = new Set<Element>();
  let animation: Animation | undefined;

  function revealNext() {
    if (animation) return;
    const next = charts.find(({ card }) => visible.has(card));
    if (!next) return;

    const { chart, card, timing } = next;
    visible.delete(card);
    observer.unobserve(card);
    played.add(chart.src);
    delete chart.dataset.revealPending;
    if (reducedMotion.matches) {
      revealNext();
      return;
    }

    animation = chart.animate(
      [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
      timing,
    );
    animation.onfinish = () => {
      animation = undefined;
      revealNext();
    };
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.intersectionRatio >= 0.5) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    revealNext();
  }, { threshold: 0.5 });

  for (const { chart, card } of charts) {
    chart.dataset.revealPending = '';
    observer.observe(card);
  }

  function respectMotionPreference() {
    if (reducedMotion.matches) animation?.finish();
  }

  reducedMotion.addEventListener('change', respectMotionPreference);
  return () => {
    reducedMotion.removeEventListener('change', respectMotionPreference);
    observer.disconnect();
    animation?.cancel();
    for (const { chart } of charts) delete chart.dataset.revealPending;
  };
}
