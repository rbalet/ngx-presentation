import { Component, computed, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Chapter } from '../chapters';
import { AboutChapter } from './about-chapter';
import { ChapterTitle } from './chapter-title';
import { ProblemChapter } from './problem-chapter';
import { FormDemo } from './form-demo';
import { FormValidator } from './form-validator';
import { FormBuilder } from './form-builder';
import { PeriscopeChapter } from './periscope-chapter';
import { ClosingChapter } from './closing-chapter';
import { FormBackground } from './form-background';

@Component({
  selector: 'section[appChapterSection]',
  imports: [NgTemplateOutlet, TranslatePipe, AboutChapter, ChapterTitle, ProblemChapter, FormDemo, FormValidator, FormBuilder, PeriscopeChapter, ClosingChapter, FormBackground],
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
  protected readonly maintenanceResolved = signal(false);
  protected readonly complexityResolved = signal(false);
  readonly continuations = computed(() => this.chapter().number === '01' && this.compact()
    ? [{ id: 'chapter-01-continued', label: 'nav.maintainers', content: 'maintainers' }]
    : this.chapter().number === '02' && this.compact()
      ? [{ id: 'chapter-02-more-examples', label: 'nav.ssfForms', content: 'ssf-forms' }]
      : []);
}
