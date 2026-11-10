import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { chapters } from "../chapters";
import { AboutChapter } from "../components/about-chapter";
import { ChapterSection } from "../components/chapter-section";
import { ProblemChapter } from "../components/problem-chapter";

export const Route = createFileRoute("/")({ component: Presentation });

const timerStorageKey = "ngx-presentation-started-at";
const presentationDuration = 60 * 60 * 1000;

function Presentation() {
  const indexRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState<string>();
  const [startedAt, setStartedAt] = useState<number | null>();
  const [elapsed, setElapsed] = useState(0);
  const overdue = elapsed > presentationDuration;
  const timerDescription =
    startedAt == null
      ? "Presentation not started"
      : `${Math.floor(elapsed / 60000)} of 60 minutes elapsed${overdue ? ", over time" : ""}`;
  const activeChapterIndex = chapters.findIndex(
    (chapter) => chapter.number === activeChapter,
  );

  useEffect(() => {
    try {
      const savedStart = Number(localStorage.getItem(timerStorageKey));
      setStartedAt(
        Number.isFinite(savedStart) &&
          savedStart > 0 &&
          savedStart <= Date.now()
          ? savedStart
          : null,
      );
    } catch {
      // Storage can be blocked; the timer still works for this visit.
      setStartedAt(null);
    }
  }, []);

  useEffect(() => {
    if (startedAt == null) return;
    const updateElapsed = () => setElapsed(Math.max(0, Date.now() - startedAt));
    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const startPresentation = () => {
    if (startedAt !== null) return;
    const start = Date.now();
    setStartedAt(start);
    try {
      localStorage.setItem(timerStorageKey, String(start));
    } catch {
      // Keep the timer running even when its start time cannot be saved.
    }
  };

  const resetPresentation = () => {
    setStartedAt(null);
    setElapsed(0);
    try {
      localStorage.removeItem(timerStorageKey);
    } catch {
      // Reset this visit even when storage is unavailable.
    }
  };

  useEffect(() => {
    const header = document.querySelector("header")!;
    const sections = chapters.map(
      (chapter) => document.getElementById(`chapter-${chapter.number}`)!,
    );
    const updateNavigation = () => {
      const headerHeight = header.offsetHeight;
      const readingLine =
        headerHeight + (window.innerHeight - headerHeight) / 3;
      const current =
        sections.filter(
          (section) => section.getBoundingClientRect().top <= readingLine,
        ).length - 1;
      setActiveChapter(chapters[current]?.number);
    };

    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
    window.addEventListener("resize", updateNavigation);
    return () => {
      window.removeEventListener("scroll", updateNavigation);
      window.removeEventListener("resize", updateNavigation);
    };
  }, []);

  useEffect(() => {
    const index = indexRef.current!;
    const updateIndex = () => {
      if (getComputedStyle(index).position === "sticky") {
        const current = index.querySelector<HTMLElement>(
          '[aria-current="location"]',
        );
        index.scrollTop = current
          ? current.offsetTop - (index.clientHeight - current.offsetHeight) / 2
          : 0;
      }
    };
    updateIndex();
    const resizeObserver = new ResizeObserver(updateIndex);
    resizeObserver.observe(index);
    return () => resizeObserver.disconnect();
  }, [activeChapter]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to presentation
      </a>
      <header className="site-header">
        <a className="brand" href="#overview">
          <img src="/formly.svg" width="27" height="29" alt="" />
          ngx-formly
        </a>
        <a href="#chapters">Chapters</a>
      </header>

      <main id="main" className="presentation" tabIndex={-1}>
        <section
          id="overview"
          className="overview"
          aria-labelledby="presentation-title"
        >
          <div className="opening">
            <h1 id="presentation-title">
              Why are we still rebuilding <span>the same forms?</span>
            </h1>
            <p className="subtitle">
              Extensive form manipulation with ngx-formly, a unified approach.
            </p>
            <p className="presenter">
              Raphaël Balet <span>Expert Developer at BIT</span>
            </p>
            <a
              className="start-link"
              href={startedAt === undefined ? undefined : "#chapter-01"}
              aria-disabled={startedAt === undefined}
              onClick={startPresentation}
            >
              Start with chapter 01 <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <div id="chapters" className="chapter-index-slot">
          <nav
            ref={indexRef}
            className="chapter-index"
            aria-label="Chapter index"
          >
            <h2>Chapters</h2>
            <ol role="list">
              {chapters.map((chapter, index) => {
                const completed = index < activeChapterIndex;
                return (
                  <li key={chapter.number}>
                    <a
                      href={`#chapter-${chapter.number}`}
                      aria-current={
                        activeChapter === chapter.number
                          ? "location"
                          : undefined
                      }
                    >
                      <span className="index-number">{chapter.number}</span>
                      <span>
                        <span
                          className={`index-title${completed ? " index-title--completed" : ""}`}
                        >
                          {chapter.title}
                        </span>
                        {chapter.kind === "extra" && (
                          <small>Optional extra</small>
                        )}
                      </span>
                      <span className="index-time">
                        {completed ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            role="img"
                            aria-label="Completed"
                          >
                            <path
                              d="m5 12 4 4L19 6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          `${chapter.minutes} min`
                        )}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
            <div className="presentation-timer-controls">
              <progress
                className={`presentation-timer${overdue ? " presentation-timer--overdue" : ""}`}
                value={Math.min((elapsed / presentationDuration) * 100, 100)}
                max={100}
                aria-label="Presentation time"
                aria-valuetext={timerDescription}
                title={timerDescription}
              />
              <button
                type="button"
                className="timer-button"
                disabled={startedAt === undefined}
                onClick={
                  startedAt == null ? startPresentation : resetPresentation
                }
                aria-label={
                  startedAt == null
                    ? "Start presentation timer"
                    : "Reset presentation timer"
                }
              >
                {startedAt == null ? "Start" : "Reset"}
              </button>
            </div>
          </nav>
        </div>

        <div className="chapter-sections">
          {chapters.map((chapter, index) => (
            <ChapterSection
              key={chapter.number}
              chapter={chapter}
              previous={chapters[index - 1]}
              next={chapters[index + 1]}
              subtitle={
                chapter.number === "02" ? (
                  <>
                    Familiar form, <strong>Different stack.</strong>
                  </>
                ) : undefined
              }
            >
              {chapter.number === "01" ? (
                <AboutChapter />
              ) : chapter.number === "02" ? (
                <ProblemChapter />
              ) : undefined}
            </ChapterSection>
          ))}
        </div>
      </main>
    </>
  );
}
