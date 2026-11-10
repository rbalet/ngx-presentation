import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { useId, useRef, useState, type Ref } from "react";
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

function FormEcosystem() {
  return (
    <svg
      className="form-ecosystem"
      viewBox="0 0 480 112"
      role="img"
      aria-label="Core forms, MCP and Builder share the same form logic."
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="ecosystem-connections">
        <path className="ecosystem-track" d="M116 56h76m96 0h76" />
        <path className="ecosystem-flow" d="M116 56h76" pathLength="1" />
        <path className="ecosystem-flow ecosystem-flow--builder" d="M288 56h76" pathLength="1" />
        <path d="m122 51-6 5 6 5m64-10 6 5-6 5m108-10-6 5 6 5m64-10 6 5-6 5" />
      </g>

      <svg x="20" y="8" width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
        <rect x="14" y="8" width="68" height="80" rx="7" />
        <path d="M26 23h26M26 51h19" />
        <rect className="ecosystem-field" x="26" y="31" width="44" height="12" rx="3" />
        <rect className="ecosystem-field" x="26" y="59" width="44" height="12" rx="3" />
        <path className="ecosystem-accent" d="m56 36 3 3 5-5m-8 30 3 3 5-5" />
      </svg>

      <svg x="192" y="8" width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
        <path d="m22 24 14 14m38-14L60 38M48 64v10" />
        <circle cx="16" cy="18" r="9" />
        <circle cx="80" cy="18" r="9" />
        <circle cx="48" cy="83" r="9" />
        <rect className="ecosystem-field" x="32" y="32" width="32" height="32" rx="9" />
        <path className="ecosystem-accent" d="m43 42-6 6 6 6m10-12 6 6-6 6" />
      </svg>

      <svg x="364" y="8" width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
        <rect x="8" y="14" width="80" height="66" rx="7" />
        <path d="M8 30h80M30 30v50M17 22h2m6 0h2M17 41h5m-5 9h5m-5 9h5" />
        <rect className="ecosystem-field" x="39" y="39" width="38" height="12" rx="3" />
        <rect x="39" y="59" width="15" height="12" rx="3" />
        <path className="ecosystem-cursor" d="m65 58 19 13-9 2-4 9Z" />
      </svg>

    </svg>
  );
}

const problems = [
  {
    title: "Ongoing cost",
    description:
      "Every team maintains its own forms long after launch, sometimes even with a monthly/yearly fee.",
    problemIcon: "M3 3h7l11 11-7 7L3 10ZM7 7h.01",
    solutionIcon:
      "M9 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m2-15.8a3 3 0 0 1 0 5.6M18 14a4 4 0 0 1 3 4v2",
    answer: "Open source & shared maintenance",
    solution: <ContributorBoard />,
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
  {
    title: "Repeated work",
    description: "The same form logic gets rebuilt across tools and projects.",
    problemIcon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2",
    solutionIcon: "m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
    answer: "Core · MCP · Builder",
    solution: (
      <>
        <p>Reuse the form logic across tools and projects.</p>
        <FormEcosystem />
      </>
    ),
  },
];

function ProblemIcon({ path, layoutId }: { path: string; layoutId?: string }) {
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

function SolutionPage({
  index,
  direction,
  solutionId,
  ref,
}: {
  index: number;
  direction: number;
  solutionId: string;
  ref?: Ref<HTMLDivElement>;
}) {
  const isPresent = useIsPresent();
  const reducedMotion = useReducedMotion();
  const answerId = useId();

  return (
    <motion.div
      ref={ref}
      className="problem-solution-page"
      aria-hidden={!isPresent}
      inert={!isPresent}
      custom={direction}
      variants={{
        enter: (direction: number) => ({
          y: reducedMotion ? 0 : `${direction * 100}%`,
        }),
        active: { y: 0 },
        exit: (direction: number) => ({
          y: reducedMotion ? 0 : `${direction * -100}%`,
        }),
      }}
      initial="enter"
      animate="active"
      exit="exit"
      transition={{
        duration: reducedMotion ? 0 : 0.38,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <ProblemIcon
        path={problems[index].solutionIcon}
        layoutId={`${solutionId}-icon-${index}`}
      />
      <h4 className="problem-answer" id={answerId}>
        {problems[index].answer}
      </h4>
      <div
        className="problem-solution-content"
        role="region"
        aria-labelledby={answerId}
        tabIndex={0}
      >
        {problems[index].solution}
      </div>
    </motion.div>
  );
}

function SolutionHistory({
  indexes,
  solutionId,
  onSelect,
}: {
  indexes: number[];
  solutionId: string;
  onSelect: (index: number) => void;
}) {
  return (
    indexes.length > 0 && (
      <ul
        className="problem-solution-history"
        aria-label="Previously shown solutions"
        role="list"
      >
        {indexes.map((index) => (
          <li key={problems[index].title}>
            <button
              className="problem-toggle"
              type="button"
              aria-expanded={false}
              aria-controls={solutionId}
              onClick={() => onSelect(index)}
            >
              {problems[index].answer}
              <ProblemIcon path={problems[index].solutionIcon} />
            </button>
          </li>
        ))}
      </ul>
    )
  );
}

export function ProblemRequirements({
  active,
  onSelect,
}: {
  active: number | null;
  onSelect: (index: number) => void;
}) {
  const solutionId = useId();
  const resultRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(1);
  const [visited, setVisited] = useState<number[]>([]);
  const previousSolutions = visited.filter(
    (index) => active !== null && index < active,
  );
  const nextSolutions = visited.filter(
    (index) => active !== null && index > active,
  );

  function selectSolution(index: number) {
    setVisited((visited) =>
      visited.includes(index)
        ? visited
        : [...visited, index].sort((a, b) => a - b),
    );
    setDirection(active !== null && index < active ? -1 : 1);
    onSelect(index);
  }

  function revisitSolution(index: number) {
    selectSolution(index);
    resultRef.current?.focus({ preventScroll: true });
  }

  return (
    <section className="problem-needs" aria-labelledby="form-needs-title">
      <h3 id="form-needs-title">But also...</h3>
      <div className="problem-layout">
        <ul className="problem-pillars" role="list">
          {problems.map(({ title, description, problemIcon }, index) => {
            const revealed = active === index;
            return (
              <li
                className="problem-card"
                data-visited={visited.includes(index)}
                key={title}
              >
                <h4 className="problem-card-title">
                  <button
                    className="problem-toggle"
                    type="button"
                    aria-expanded={revealed}
                    aria-controls={solutionId}
                    aria-label={`Show solution: ${title}`}
                    onClick={() => selectSolution(index)}
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
        <div
          className="problem-result"
          id={solutionId}
          ref={resultRef}
          tabIndex={-1}
        >
          <SolutionHistory
            indexes={previousSolutions}
            solutionId={solutionId}
            onSelect={revisitSolution}
          />
          {active !== null && (
            <div className="problem-solution">
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="popLayout"
              >
                <SolutionPage
                  key={active}
                  index={active}
                  direction={direction}
                  solutionId={solutionId}
                />
              </AnimatePresence>
            </div>
          )}
          <SolutionHistory
            indexes={nextSolutions}
            solutionId={solutionId}
            onSelect={revisitSolution}
          />
        </div>
      </div>
    </section>
  );
}
