import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import type { Chapter } from '../chapters';
import { ChapterTitle } from './chapter-title';

export function ChapterSection({ chapter, previous, next, subtitle = chapter.subtitle, children }: {
  chapter: Chapter;
  previous?: Chapter;
  next?: Chapter;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [32, 0, 0, -32]);

  return (
    <section
      ref={section}
      id={`chapter-${chapter.number}`}
      className={`chapter chapter--${chapter.kind}`}
      aria-labelledby={`title-${chapter.number}`}
      tabIndex={-1}
    >
      <motion.div className="chapter-content" style={{ y: reducedMotion ? 0 : y }}>
        <ChapterTitle number={chapter.number} title={chapter.title} subtitle={subtitle} />
        {chapter.kind === 'extra' && <p className="chapter-label">Optional extra</p>}
        {children ?? <p className="chapter-summary">{chapter.summary}</p>}
      </motion.div>
      <nav className="chapter-controls" aria-label={`Chapter ${chapter.number} navigation`}>
        <a href={previous ? `#chapter-${previous.number}` : '#overview'}>
          {previous ? `Previous: ${previous.number}` : 'Back to overview'}
        </a>
        <div>
          {next?.kind === 'extra' && (
            <a href="#chapter-11" className="skip-extras">Skip extras</a>
          )}
          <a href={next ? `#chapter-${next.number}` : '#overview'}>
            {next ? `Next: ${next.number}` : 'Back to overview'}
          </a>
        </div>
      </nav>
    </section>
  );
}
