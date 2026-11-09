import { createFileRoute } from '@tanstack/react-router';
import { chapters, minutesFor } from '../chapters';
import { ChapterSection } from '../components/chapter-section';

export const Route = createFileRoute('/')({ component: Presentation });

function Presentation() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to presentation</a>
      <header className="site-header">
        <a className="brand" href="#overview">
          <img src="/formly.svg" width="27" height="29" alt="" />
          ngx-formly
        </a>
        <a href="#chapters">Chapters</a>
      </header>

      <main id="main" tabIndex={-1}>
        <section id="overview" className="overview" aria-labelledby="presentation-title">
          <div className="opening">
            <h1 id="presentation-title">Why are we still rebuilding <span>the same forms?</span></h1>
            <p className="subtitle">Reusable forms for people and AI with ngx-formly.</p>
            <p className="presenter">Raphaël Balet <span>Expert Front-end Developer at BIT</span></p>
            <a className="start-link" href="#chapter-01">Start with chapter 01 <span aria-hidden="true">↓</span></a>
          </div>

          <nav id="chapters" className="chapter-index" aria-label="Chapter index">
            <h2>Chapters</h2>
            <ol role="list">
              {chapters.map((chapter) => (
                <li key={chapter.number}>
                  <a href={`#chapter-${chapter.number}`}>
                    <span className="index-number">{chapter.number}</span>
                    <span>{chapter.title}{chapter.kind === 'extra' && <small>Optional extra</small>}</span>
                    <span className="index-time">{chapter.minutes} min</span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="timing">{minutesFor('main')} min presentation<br />{minutesFor('extra')} min optional extras · {minutesFor('discussion')} min Q&A</p>
          </nav>
        </section>

        {chapters.map((chapter, index) => (
          <ChapterSection key={chapter.number} chapter={chapter} previous={chapters[index - 1]} next={chapters[index + 1]} />
        ))}
      </main>
    </>
  );
}
