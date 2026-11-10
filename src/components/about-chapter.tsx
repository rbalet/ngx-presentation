export function AboutChapter() {
  return (
    <div className="about-intro">
      <p className="about-presenter">
        <a href="https://raphael-balert.ch" target="_blank" rel="noreferrer">
          Raphaël Balet
        </a>
        <span>Expert Front-end Developer at BIT</span>
      </p>

      <div className="about-cards">
        <article
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
        </article>

        <section
          className="maintainer-group"
          aria-labelledby="maintainer-title"
        >
          <h3 id="maintainer-title">Open-source maintainer</h3>
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
        </section>
      </div>

      <p className="metric-source">
        Weekly npm downloads, 2 to 8 November 2026. Core packages only.
        <span>
          Background graphs show 52 weeks of downloads and public Stack Overflow
          reputation gains.
        </span>
      </p>
    </div>
  );
}
