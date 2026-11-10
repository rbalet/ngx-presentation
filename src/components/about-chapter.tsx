import { useEffect, useRef } from 'react';

// The outer curves meet the middle chart at its linear reveal speed.
const revealTimings = [
  { duration: 500, easing: 'cubic-bezier(0.2, 0, 0.6, 0.5)' },
  { duration: 400, easing: 'linear' },
  { duration: 500, easing: 'cubic-bezier(0.4, 0.5, 0.8, 1)' },
];

export function useMetricReveal(splitDenseSlides: boolean) {
  const played = useRef(new Set<string>());

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const charts = Array.from(
      document.querySelectorAll<HTMLImageElement>('#chapter-01 .metric-history'),
      (chart, index) => ({ chart, card: chart.parentElement!, timing: revealTimings[index] }),
    ).filter(({ chart }) => !played.current.has(chart.src));
    const visible = new Set<Element>();
    let animation: Animation | undefined;

    function revealNext() {
      if (animation) return;
      const next = charts.find(({ card }) => visible.has(card));
      if (!next) return;

      const { chart, card, timing } = next;
      visible.delete(card);
      observer.unobserve(card);
      played.current.add(chart.src);
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
  }, [splitDenseSlides]);
}

export function AboutChapter({ part }: { part?: 'community' | 'maintainers' }) {
  return (
    <div className="about-intro">
      <div className={part ? `about-cards about-cards--${part}` : 'about-cards'}>
        {part !== 'maintainers' && <article
          className="metric-card community-card"
          aria-labelledby="stackoverflow-title"
        >
          <img
            className="metric-logo"
            src="/metrics/stackoverflow.svg"
            width="28"
            height="28"
            alt=""
          />
          <img
            className="metric-history"
            src="/metrics/stackoverflow-reputation.svg"
            width="320"
            height="180"
            alt=""
          />
          <h3 id="stackoverflow-title">
            <a
              href="https://stackoverflow.com/users/11135174/rapha%C3%ABl-balet"
              target="_blank"
              rel="noreferrer"
            >
              Stack Overflow
            </a>
          </h3>
          <p className="metric-value fanatic-badge">Fanatic</p>
          <p className="metric-label">100 consecutive days of visits</p>
          <a
            className="metric-caption"
            href="https://stackoverflow.com/help/badges/83/fanatic"
            target="_blank"
            rel="noreferrer"
          >
            For those who remember.
          </a>
        </article>}

        {part !== 'community' && <section
          className="maintainer-group"
          aria-labelledby="maintainer-title"
        >
          <h3 id="maintainer-title">Open-source</h3>
          <article className="metric-card" aria-labelledby="translate-title">
            <img
              className="metric-logo"
              src="/metrics/npm.svg"
              width="28"
              height="28"
              alt=""
            />
            <img
              className="metric-history"
              src="/metrics/translate-downloads.svg"
              width="320"
              height="180"
              alt=""
            />
            <h4 id="translate-title">
              <a
                href="https://ngx-translate.org/"
                target="_blank"
                rel="noreferrer"
              >
                ngx-translate
              </a>
            </h4>
            <p className="metric-value">1,912,458</p>
            <a
              className="metric-label"
              href="https://api.npmjs.org/downloads/point/2026-11-02:2026-11-08/%40ngx-translate%2Fcore"
              target="_blank"
              rel="noreferrer"
              aria-label="npm downloads / week for ngx-translate, source"
            >
              npm downloads / week
            </a>
            <p className="metric-caption">
              Most downloaded angular library on npm.
            </p>
          </article>
          <article className="metric-card" aria-labelledby="formly-title">
            <img
              className="metric-logo"
              src="/metrics/npm.svg"
              width="28"
              height="28"
              alt=""
            />
            <img
              className="metric-history"
              src="/metrics/formly-downloads.svg"
              width="320"
              height="180"
              alt=""
            />
            <h4 id="formly-title">
              <a href="https://formly.dev/" target="_blank" rel="noreferrer">
                ngx-formly
              </a>
            </h4>
            <p className="metric-value">311,233</p>
            <a
              className="metric-label"
              href="https://api.npmjs.org/downloads/point/2026-11-02:2026-11-08/%40ngx-formly%2Fcore"
              target="_blank"
              rel="noreferrer"
              aria-label="npm downloads / week for ngx-formly, source"
            >
              npm downloads / week
            </a>
            <p className="metric-caption">The reason we're here.</p>
          </article>
        </section>}
      </div>
    </div>
  );
}
