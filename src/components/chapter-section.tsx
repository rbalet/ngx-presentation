import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Chapter } from '../chapters';
import { ChapterTitle } from './chapter-title';

type Continuation = { id: string; label: string; content: ReactNode };

function SlideConnector({ slide }: { slide: Continuation }) {
  return (
    <a className="slide-connector" href={`#${slide.id}`}>
      {slide.label}
      <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 2v19m-5-5 5 5 5-5" />
      </svg>
    </a>
  );
}

export function ChapterSection({ chapter, previous, next, subtitle = chapter.subtitle, children, continuations = [] }: {
  chapter: Chapter;
  previous?: Chapter;
  next?: Chapter;
  subtitle?: ReactNode;
  children?: ReactNode;
  continuations?: Continuation[];
}) {
  const firstSlide = useRef<HTMLDivElement>(null);
  const [showRunningTitle, setShowRunningTitle] = useState(false);
  const { scrollYProgress } = useScroll({ target: firstSlide, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [32, 0, 0, -32]);
  const chapterId = `chapter-${chapter.number}`;
  const hasContinuation = continuations.length > 0;

  useEffect(() => {
    if (!hasContinuation) return;
    const title = firstSlide.current!.querySelector('h2')!;
    const header = document.querySelector('.site-header')!;
    const updateRunningTitle = () => {
      setShowRunningTitle(title.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom);
    };

    updateRunningTitle();
    window.addEventListener('scroll', updateRunningTitle, { passive: true });
    window.addEventListener('resize', updateRunningTitle);
    return () => {
      window.removeEventListener('scroll', updateRunningTitle);
      window.removeEventListener('resize', updateRunningTitle);
    };
  }, [hasContinuation]);

  const previousLink = (
    <a href={previous ? `#chapter-${previous.number}` : '#overview'}>
      {previous ? `Previous: ${previous.number}` : 'Back to overview'}
    </a>
  );
  const nextLinks = (
    <div>
      {next?.kind === 'extra' && <a href="#chapter-11" className="skip-extras">Skip extras</a>}
      <a href={next ? `#chapter-${next.number}` : '#overview'}>
        {next ? `Next: ${next.number}` : 'Back to overview'}
      </a>
    </div>
  );

  return (
    <section
      id={chapterId}
      className={`chapter chapter--${chapter.kind}`}
      aria-labelledby={`title-${chapter.number}`}
      tabIndex={-1}
    >
      {hasContinuation && (
        <div className="chapter-running-title" data-visible={showRunningTitle} aria-hidden="true">
          <div className="chapter-running-title-inner">
            <span className="chapter-number">{chapter.number}</span>
            <span>{chapter.title}</span>
          </div>
        </div>
      )}
      <div className="chapter-slide" ref={firstSlide}>
        <motion.div className="chapter-content" style={{ y }}>
          <ChapterTitle number={chapter.number} title={chapter.title} subtitle={subtitle} />
          {chapter.kind === 'extra' && <p className="chapter-label">Optional extra</p>}
          {children ?? <p className="chapter-summary">{chapter.summary}</p>}
        </motion.div>
        <nav className="chapter-controls" aria-label={`Chapter ${chapter.number} navigation`}>
          {previousLink}
          {hasContinuation ? <SlideConnector slide={continuations[0]} /> : nextLinks}
        </nav>
      </div>
      {continuations.map((slide, index) => (
        <div id={slide.id} key={slide.id} className="chapter-slide chapter-slide--continuation" tabIndex={-1}>
          <div className="chapter-content">{slide.content}</div>
          <nav className="chapter-controls" aria-label={`Chapter ${chapter.number}, slide ${index + 2} navigation`}>
            <a href={`#${continuations[index - 1]?.id ?? chapterId}`}>Previous slide</a>
            {continuations[index + 1] ? <SlideConnector slide={continuations[index + 1]} /> : nextLinks}
          </nav>
        </div>
      ))}
    </section>
  );
}
