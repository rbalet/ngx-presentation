import { Component, computed, input, model } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Chapter } from '../chapters';
import { AboutChapter } from './about-chapter';
import { ChapterTitle } from './chapter-title';
import { ProblemChapter } from './problem-chapter';
import { ProblemRequirements } from './problem-requirements';
import { FormDemo } from './form-demo';
import { FormValidator } from './form-validator';
import { PeriscopeChapter } from './periscope-chapter';
import { ClosingChapter } from './closing-chapter';

@Component({
  selector: 'section[appChapterSection]',
  imports: [NgTemplateOutlet, TranslatePipe, AboutChapter, ChapterTitle, ProblemChapter, ProblemRequirements, FormDemo, FormValidator, PeriscopeChapter, ClosingChapter],
  templateUrl: './chapter-section.html',
  host: {
    '[id]': "'chapter-' + chapter().number",
    '[class]': "'chapter chapter--' + chapter().kind",
    '[attr.aria-labelledby]': "'title-' + chapter().number",
    tabindex: '-1',
  },
})
export class ChapterSection {
  readonly chapter = input.required<Chapter>();
  readonly previous = input<Chapter>();
  readonly next = input<Chapter>();
  readonly compact = input(false);
  readonly activeProblem = model<number | null>(null);
  readonly title = computed(() => this.chapter().number === '02' && this.activeProblem() !== null
    ? 'problem.solutions' : this.chapter().title);
  readonly subtitle = computed(() => this.chapter().number === '02' ? 'problem.subtitle' : this.chapter().subtitle);
  readonly continuations = computed(() => this.chapter().number === '01' && this.compact()
    ? [{ id: 'chapter-01-continued', label: 'nav.maintainers', content: 'maintainers' }]
    : this.chapter().number === '02' ? [
      ...(this.compact() ? [{ id: 'chapter-02-more-examples', label: 'nav.custom', content: 'custom' }] : []),
      { id: 'chapter-02-continued', label: 'nav.requirements', content: 'requirements' },
    ] : []);
}
