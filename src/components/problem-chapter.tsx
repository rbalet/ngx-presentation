import { motion } from "motion/react";
import { useId } from "react";
import { contributors, coreTeam } from "./formly-contributors";

const formExamples = [
  { title: "Contact details", design: "Material-inspired", theme: "material" },
  { title: "Access request", design: "Bootstrap-inspired", theme: "bootstrap" },
  { title: "Event registration", design: "Custom design", theme: "custom" },
];

export function ProblemChapter({ part }: { part?: "comparison" | "custom" }) {
  const examples =
    part === "comparison"
      ? formExamples.slice(0, 2)
      : part === "custom"
        ? formExamples.slice(2)
        : formExamples;

  return (
    <div className="problem-chapter">
      <figure
        className={
          part ? "problem-gallery problem-gallery--partial" : "problem-gallery"
        }
        aria-label={
          part === "custom"
            ? "Custom form example"
            : "Same fields, different designs"
        }
      >
        <div className="form-examples">
          {examples.map(({ title, design, theme }) => (
            <div className={`form-example form-example--${theme}`} key={title}>
              <div className="form-example-header">
                <h3>{title}</h3>
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

      {part !== "comparison" && (
        <p className="problem-repetition">
          The design changes. <strong>The work repeats.</strong>
          <span>
            Required fields, validation, conditional logic, API integration —
            and ongoing maintenance.
          </span>
        </p>
      )}
    </div>
  );
}

function ContributorPortrait({ index }: { index: number }) {
  const columns = 12;
  const rows = Math.ceil((coreTeam.length + contributors.length) / columns);

  return (
    <span
      className="contributor-portrait"
      aria-hidden="true"
      style={{
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: `${((index % columns) / (columns - 1)) * 100}% ${(Math.floor(index / columns) / (rows - 1)) * 100}%`,
      }}
    />
  );
}

function ContributorBoard() {
  return (
    <div className="contributor-board">
      <div>
        <h5>Core team</h5>
        <ul className="core-team" role="list" aria-label="Core team">
          {coreTeam.map((name, index) => (
            <li key={name}>
              <ContributorPortrait index={index} />
              {name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5>
          <a
            href="https://github.com/ngx-formly/ngx-formly/graphs/contributors"
            target="_blank"
            rel="noreferrer"
          >
            {coreTeam.length + contributors.length} contributors
          </a>
        </h5>
        <ul
          className="contributor-wall"
          role="list"
          aria-label="Community contributors"
        >
          {contributors.map((name, index) => (
            <li key={name} title={name}>
              <ContributorPortrait index={coreTeam.length + index} />
              <span className="contributor-name">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const problems = [
  {
    title: "Ongoing cost",
    description: "Every team maintains its own forms long after launch.",
    problemIcon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2",
    solutionIcon:
      "M9 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m2-15.8a3 3 0 0 1 0 5.6M18 14a4 4 0 0 1 3 4v2",
    answer: "Open source & shared maintenance",
    solution: <ContributorBoard />,
  },
  {
    title: "Repeated work",
    description: "The same form logic gets rebuilt across tools and projects.",
    problemIcon:
      "m17 2 4 4-4 4m4-4H7a4 4 0 0 0-4 4m4 12-4-4 4-4m-4 4h14a4 4 0 0 0 4-4",
    solutionIcon: "m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
    answer: "Core · Builder · MCP",
    solution: <p>Reuse the form logic across tools and projects.</p>,
  },
  {
    title: "Different designs",
    description:
      "Each project needs its own look, making shared forms hard to reuse.",
    problemIcon: "M3 3h8v8H3zM17 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    solutionIcon:
      "M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.6-3.2A2 2 0 0 1 16.2 15H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9Zm-5 9h.01M9 8h.01M14 7.5h.01M17.5 11h.01",
    answer: <>Material · Bootstrap · PrimeNG</>,
    solution: (
      <>
        <p>Material, Bootstrap or your own visual language.</p>
        <a
          className="oblique-compatible"
          href="https://oblique.bit.admin.ch/introductions/welcome"
          target="_blank"
          rel="noreferrer"
        >
          <span className="oblique-logo">
            <img src="/oblique.png" width="80" height="81" alt="" />
            <svg
              className="oblique-checkmark"
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" pathLength="1" />
            </svg>
          </span>
          <span>Oblique compatible</span>
        </a>
      </>
    ),
  },
];

function ProblemIcon({ path, layoutId }: { path: string; layoutId: string }) {
  return (
    <motion.span
      className="problem-icon"
      layoutId={layoutId}
      transition={{ layout: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </motion.span>
  );
}

export function ProblemRequirements({
  active,
  onSelect,
}: {
  active: number | null;
  onSelect: (index: number | null) => void;
}) {
  const solutionId = useId();
  const answerId = useId();

  return (
    <section className="problem-needs" aria-labelledby="form-needs-title">
      <h3 id="form-needs-title">But also...</h3>
      <div className="problem-layout">
        <ul className="problem-pillars" role="list">
          {problems.map(({ title, description, problemIcon }, index) => {
            const revealed = active === index;
            return (
              <li className="problem-card" data-revealed={revealed} key={title}>
                <h4 className="problem-card-title">
                  <button
                    className="problem-toggle"
                    type="button"
                    aria-expanded={revealed}
                    aria-controls={solutionId}
                    aria-label={`${revealed ? "Hide" : "Show"} solution: ${title}`}
                    onClick={() => onSelect(revealed ? null : index)}
                  >
                    {title}
                    <span className="problem-icon-slot">
                      {!revealed && (
                        <ProblemIcon
                          path={problemIcon}
                          layoutId={`${solutionId}-icon-${index}`}
                        />
                      )}
                    </span>
                  </button>
                </h4>
                <p className="problem-description">{description}</p>
              </li>
            );
          })}
        </ul>
        <div className="problem-result" id={solutionId}>
          {active !== null && (
            <div className="problem-solution" key={active}>
              <ProblemIcon
                path={problems[active].solutionIcon}
                layoutId={`${solutionId}-icon-${active}`}
              />
              <h4 className="problem-answer" id={answerId}>
                {problems[active].answer}
              </h4>
              <div
                className="problem-solution-content"
                role="region"
                aria-labelledby={answerId}
                tabIndex={0}
              >
                {problems[active].solution}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
