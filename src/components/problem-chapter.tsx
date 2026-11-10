const formExamples = [
  { title: "Contact details", design: "Material-inspired", theme: "material" },
  { title: "Access request", design: "Bootstrap-inspired", theme: "bootstrap" },
  { title: "Event registration", design: "Custom design", theme: "custom" },
];

export function ProblemChapter() {
  return (
    <div className="problem-chapter">
      <figure className="problem-gallery" aria-labelledby="form-gallery-title">
        <div className="form-examples">
          {formExamples.map(({ title, design, theme }) => (
            <div className={`form-example form-example--${theme}`} key={title}>
              <div className="form-example-header">
                <h4>{title}</h4>
                <p>{design}</p>
              </div>
              <dl className="form-example-fields">
                <div>
                  <dt>
                    Name <span aria-label="required">*</span>
                  </dt>
                  <dd>Alex Morgan</dd>
                </div>
                <div>
                  <dt>
                    Email <span aria-label="required">*</span>
                  </dt>
                  <dd>alex@example.org</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </figure>

      <p className="problem-repetition">
        The design changes. <strong>The work repeats.</strong>
        <span>
          Required fields, validation, conditional logic, API integration — and
          ongoing maintenance.
        </span>
      </p>

      <section className="problem-needs" aria-labelledby="form-needs-title">
        <h3 id="form-needs-title">What do we need from a shared approach?</h3>
        <ol className="problem-pillars" role="list">
          <li>
            <h4>
              <span>1</span> Price
            </h4>
            <p>The cost continues after launch.</p>
            <p className="problem-answer">
              Open source &amp; shared maintenance
            </p>
            <p>Maintain it together with your colleagues.</p>
          </li>
          <li>
            <h4>
              <span>2</span> Extensible
            </h4>
            <p>A foundation we can build on.</p>
            <p className="problem-answer">Core · Builder · MCP</p>
            <p>Reuse the form logic across tools and projects.</p>
          </li>
          <li>
            <h4>
              <span>3</span> Adaptive
            </h4>
            <p>Keep each project's design.</p>
            <p className="problem-answer">
              PrimeNG · Material ·{" "}
              <a
                href="https://angular.dev/guide/aria/overview"
                target="_blank"
                rel="noreferrer"
              >
                Angular Aria
              </a>
            </p>
            <p>Material, Bootstrap or your own visual language.</p>
          </li>
        </ol>
      </section>
    </div>
  );
}
