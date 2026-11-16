import { afterNextRender, afterRenderEffect, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { chapters } from './chapters';
import { ChapterSection } from './components/chapter-section';
import { observeMetricReveal } from './components/metric-reveal';
import { ThemeToggle } from './components/theme-toggle';
import { Languages } from './languages';

const timerStorageKey = 'ngx-presentation-started-at';
const presentationDuration = 60 * 60_000;

@Component({
  selector: 'app-presentation',
  imports: [TranslatePipe, ChapterSection, ThemeToggle],
  templateUrl: './presentation.html',
  host: { '(window:keydown)': 'navigate($event)', '(click)': 'followLink($event)' },
})
export class Presentation {
  readonly languages = inject(Languages);
  readonly chapters = chapters;
  readonly compact = signal(matchMedia('(max-width: 700px), (max-height: 650px)').matches);
  readonly activeChapter = signal<string | undefined>(undefined);
  readonly activeIndex = computed(() => chapters.findIndex(chapter => chapter.number === this.activeChapter()));
  readonly targetMinutes = computed(() => chapters.slice(0, Math.max(0, this.activeIndex())).reduce((total, chapter) => total + chapter.minutes, 0));
  readonly activeProblem = signal<number | null>(null);
  readonly focused = signal(false);
  readonly startedAt = signal<number | null>(null);
  readonly elapsed = signal(0);
  readonly elapsedMinutes = computed(() => Math.floor(this.elapsed() / 60_000));
  readonly overdue = computed(() => this.elapsed() > presentationDuration);
  readonly progress = computed(() => Math.min(this.elapsed() / presentationDuration * 100, 100));
  readonly indexList = viewChild.required<ElementRef<HTMLOListElement>>('indexList');
  private readonly played = new Set<string>();
  private activeSlide?: string;

  constructor() {
    const destroyRef = inject(DestroyRef);
    try {
      const saved = Number(localStorage.getItem(timerStorageKey));
      if (Number.isFinite(saved) && saved > 0 && saved <= Date.now()) this.startedAt.set(saved);
    } catch {
      // Storage can be blocked; the timer still works for this visit.
    }
    const updateElapsed = () => this.elapsed.set(this.startedAt() === null ? 0 : Math.max(0, Date.now() - this.startedAt()!));
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    const media = matchMedia('(max-width: 700px), (max-height: 650px)');
    const updateSize = () => this.compact.set(media.matches);
    media.addEventListener('change', updateSize);
    window.addEventListener('scroll', this.updateNavigation, { passive: true });
    window.addEventListener('resize', this.updateNavigation);
    destroyRef.onDestroy(() => {
      clearInterval(timer);
      media.removeEventListener('change', updateSize);
      window.removeEventListener('scroll', this.updateNavigation);
      window.removeEventListener('resize', this.updateNavigation);
    });
    afterNextRender(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
      this.updateNavigation();
    });
    afterRenderEffect(onCleanup => {
      this.compact();
      onCleanup(observeMetricReveal(this.played));
    });
    afterRenderEffect(onCleanup => {
      this.activeChapter();
      const list = this.indexList().nativeElement;
      const updateIndex = () => {
        if (getComputedStyle(list).overflowY === 'auto') {
          const current = list.querySelector<HTMLElement>('[aria-current="location"]');
          list.scrollTop = current ? current.offsetTop - (list.clientHeight - current.offsetHeight) / 2 : 0;
        }
      };
      updateIndex();
      const observer = new ResizeObserver(updateIndex);
      observer.observe(list);
      onCleanup(() => observer.disconnect());
    });
  }

  private readonly updateNavigation = () => {
    const headerHeight = document.querySelector('header')?.offsetHeight ?? 0;
    const slides = [...document.querySelectorAll<HTMLElement>('.overview, .chapter-slide')];
    const current = slides.reverse().find(slide => slide.getBoundingClientRect().top <= headerHeight + 1);
    const chapter = current?.closest<HTMLElement>('.chapter');
    this.activeChapter.set(chapter?.id.slice('chapter-'.length));
    const id = current?.id || chapter?.id;
    if (!id || id === this.activeSlide) return;
    this.activeSlide = id;
    if (id === 'overview' && !location.hash.startsWith('#chapter-')) return;
    const url = new URL(location.href);
    url.hash = id;
    if (url.href !== location.href) history.replaceState(history.state, '', url);
  };

  followLink(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    const target = link && document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    location.hash = link.hash;
    target.scrollIntoView();
    target.focus({ preventScroll: true });
  }

  navigate(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      || (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, button, [contenteditable], [role="textbox"]'))) return;
    const direction = ['ArrowRight', 'PageDown'].includes(event.key) ? 1
      : ['ArrowLeft', 'PageUp'].includes(event.key) ? -1 : 0;
    if (!direction) return;
    const slides = [...document.querySelectorAll<HTMLElement>('.overview, .chapter-slide')];
    const readingLine = (document.querySelector('header')?.offsetHeight ?? 0) + 40;
    const current = slides.filter(slide => slide.getBoundingClientRect().top <= readingLine).length - 1;
    const slide = slides[Math.max(0, Math.min(slides.length - 1, current + direction))];
    if (!slide) return;
    event.preventDefault();
    const target = slide.id ? slide : slide.closest<HTMLElement>('section')!;
    location.hash = target.id;
    target.focus({ preventScroll: true });
  }

  start() {
    if (this.startedAt() !== null) return;
    const start = Date.now();
    this.startedAt.set(start);
    try {
      localStorage.setItem(timerStorageKey, String(start));
    } catch {
      // Keep the timer running even when its start time cannot be saved.
    }
  }

  reset() {
    this.startedAt.set(null);
    this.elapsed.set(0);
    try {
      localStorage.removeItem(timerStorageKey);
    } catch {
      // Reset this visit even when storage is unavailable.
    }
  }
}
