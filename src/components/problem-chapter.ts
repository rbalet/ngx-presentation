import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

const examples = [
  { title: 'problem.contact', design: 'problem.material', theme: 'material' },
  { title: 'problem.access', design: 'problem.bootstrap', theme: 'bootstrap' },
  { title: 'problem.event', design: 'problem.custom', theme: 'custom' },
];

@Component({
  selector: 'app-problem-chapter',
  imports: [TranslatePipe],
  templateUrl: './problem-chapter.html',
  styles: ':host { display: contents; }',
})
export class ProblemChapter {
  readonly part = input<'comparison' | 'custom'>();
  readonly examples = computed(() => this.part() === 'comparison' ? examples.slice(0, 2)
    : this.part() === 'custom' ? examples.slice(2) : examples);
}
